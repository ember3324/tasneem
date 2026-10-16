import { createAdminClient } from '@/lib/supabase/admin'
import { updateSheetPaymentType } from '@/lib/sheets'
import { sendRefundNotification } from '@/lib/telegram'

/**
 * Records a Moyasar refund on the order and tells the owner. Refunds are made
 * by hand in the Moyasar dashboard, so this is the only way the app learns of
 * them. Called from the webhook; idempotent, since Moyasar redelivers events
 * — the owner is only notified when the stored payment status actually changes.
 *
 * Best-effort after the database write: Sheet/Telegram failures are logged,
 * never thrown, so Moyasar still gets its 200.
 */
export async function recordRefund(
  orderId: string,
  payment: { amount: number; refunded?: number | null }
): Promise<void> {
  const refundedHalalas = payment.refunded ?? 0
  if (refundedHalalas <= 0) return

  const full = refundedHalalas >= payment.amount
  const paymentStatus = full ? 'refunded' : 'partially_refunded'

  const admin = createAdminClient()
  const { data: order } = await admin
    .from('orders')
    .select('order_number, customer_name, total_amount, payment_status, sheet_row_number')
    .eq('id', orderId)
    .maybeSingle()
  if (!order || order.payment_status === paymentStatus) return

  const { error } = await admin.from('orders').update({ payment_status: paymentStatus }).eq('id', orderId)
  if (error) {
    // Most likely migration 0003 hasn't been applied (the old check
    // constraint rejects 'refunded'). Bail before notifying anyone, so
    // Moyasar's retries don't spam the owner while the order is unchanged.
    console.error('Failed to record refund on order', error)
    return
  }

  try {
    if (order.sheet_row_number && order.sheet_row_number > 0) {
      await updateSheetPaymentType(
        order.sheet_row_number,
        order.order_number,
        full ? 'Credit (Refunded)' : 'Credit (Partly refunded)'
      )
    }
  } catch (err) {
    console.error('Failed to mark refund in Google Sheet', err)
  }

  try {
    await sendRefundNotification({
      orderNumber: order.order_number,
      customerName: order.customer_name,
      amountSar: refundedHalalas / 100,
      totalSar: Number(order.total_amount),
      full,
    })
  } catch (err) {
    console.error('Failed to send Telegram refund notification', err)
  }
}
