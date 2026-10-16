import { createAdminClient } from '@/lib/supabase/admin'
import { appendOrderRow, ensureSheetHeader } from '@/lib/sheets'
import { sendOrderNotification } from '@/lib/telegram'

/**
 * Sends an order to the owner (Google Sheet row + Telegram message) exactly
 * once. Cash orders call this right after checkout; card orders call it only
 * once the payment is confirmed, so an abandoned card payment never looks
 * like a real order. The callback route and the webhook both call it for the
 * same payment, hence the claim below.
 *
 * Best-effort: every failure is logged and swallowed — the order already
 * exists in the DB and must never fail because Sheets/Telegram are down.
 */
export async function publishOrder(orderId: string): Promise<void> {
  const admin = createAdminClient()

  // Atomic claim: only one caller can flip sheet_row_number from null to the
  // -1 placeholder, so a callback/webhook race can't append two rows.
  const { data: claimed } = await admin
    .from('orders')
    .update({ sheet_row_number: -1 })
    .eq('id', orderId)
    .is('sheet_row_number', null)
    .select(
      'order_number, customer_name, customer_phone, lat, lng, items_summary, total_amount, payment_method, status, created_at, address_id'
    )
    .maybeSingle()

  if (!claimed) return

  let addressDetails: string | null = null
  if (claimed.address_id) {
    const { data: address } = await admin
      .from('addresses')
      .select('address_line')
      .eq('id', claimed.address_id)
      .maybeSingle()
    addressDetails = address?.address_line ?? null
  }

  try {
    await ensureSheetHeader()
    const rowNumber = await appendOrderRow({
      orderNumber: claimed.order_number,
      customerName: claimed.customer_name,
      customerPhone: claimed.customer_phone,
      lat: claimed.lat,
      lng: claimed.lng,
      itemsSummary: claimed.items_summary,
      totalAmount: Number(claimed.total_amount),
      paymentMethod: claimed.payment_method,
      status: claimed.status,
      createdAt: claimed.created_at,
      addressDetails,
    })
    await admin
      .from('orders')
      .update({ sheet_row_number: rowNumber, sheet_synced_at: new Date().toISOString() })
      .eq('id', orderId)
  } catch (err) {
    console.error('Failed to append order to Google Sheet', err)
    // Release the claim so a later call (e.g. the webhook) can retry.
    await admin.from('orders').update({ sheet_row_number: null }).eq('id', orderId)
  }

  // Independent failure domain from the Sheets write above.
  try {
    await sendOrderNotification({
      orderNumber: claimed.order_number,
      customerName: claimed.customer_name,
      customerPhone: claimed.customer_phone,
      lat: claimed.lat,
      lng: claimed.lng,
      itemsSummary: claimed.items_summary,
      totalAmount: Number(claimed.total_amount),
      paymentMethod: claimed.payment_method,
      addressDetails,
    })
  } catch (err) {
    console.error('Failed to send Telegram order notification', err)
  }
}
