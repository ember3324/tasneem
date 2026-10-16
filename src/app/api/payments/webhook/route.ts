import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isValidMoyasarWebhook, toHalalas } from '@/lib/moyasar'
import { publishOrder } from '@/lib/order-publish'
import { recordRefund } from '@/lib/order-refund'

// Configure this URL in the Moyasar dashboard (or via POST /v1/webhooks)
// listening for payment_paid, payment_failed and payment_refunded, with
// `shared_secret` set to MOYASAR_WEBHOOK_SECRET. This is the authoritative
// confirmation path — it fires server-to-server even if the customer closes
// the tab before the callback_url redirect completes.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  if (!body || !isValidMoyasarWebhook(body)) {
    return NextResponse.json({ error: 'Invalid webhook' }, { status: 401 })
  }

  const payment = body.data
  const orderNumber: string | undefined = payment?.metadata?.order_number
  const paymentId: string | undefined = payment?.id

  if (!paymentId) return NextResponse.json({ ok: true }) // nothing to do

  const admin = createAdminClient()

  const query = admin.from('orders').select('id, status, payment_status, total_amount')
  const { data: order } = orderNumber
    ? await query.eq('order_number', orderNumber).maybeSingle()
    : await query.eq('moyasar_payment_id', paymentId).maybeSingle()

  if (!order) {
    // Nothing to reconcile against yet (e.g. /api/payments/link hasn't run
    // and metadata wasn't forwarded). Acknowledge so Moyasar doesn't retry
    // forever; the callback-url path or a manual lookup covers this case.
    return NextResponse.json({ ok: true })
  }

  // Once money has gone back, a redelivered "paid" event must not flip the
  // order back to paid.
  const settled = order.payment_status === 'refunded' || order.payment_status === 'partially_refunded'

  if (body.type === 'payment_paid' && !settled) {
    // The amount is chosen in the customer's browser (Moyasar.init), so the
    // shared secret only proves the event came from Moyasar — not that the
    // payment covers this order. Same check the callback route makes.
    if (payment.amount !== toHalalas(order.total_amount) || payment.currency !== 'SAR') {
      console.error('Webhook payment does not match order total', {
        paymentId,
        paid: payment.amount,
        expected: toHalalas(order.total_amount),
      })
      return NextResponse.json({ ok: true })
    }

    // `status` is deliberately untouched: it's controlled from the Sheet,
    // and the Sheet sync would revert any status we set here.
    await admin
      .from('orders')
      .update({ payment_status: 'paid', moyasar_payment_id: paymentId })
      .eq('id', order.id)
    await publishOrder(order.id)
  } else if (body.type === 'payment_failed' && order.payment_status !== 'paid' && !settled) {
    await admin
      .from('orders')
      .update({ payment_status: 'failed', moyasar_payment_id: paymentId })
      .eq('id', order.id)
  } else if (body.type === 'payment_refunded') {
    await recordRefund(order.id, payment)
  }

  return NextResponse.json({ ok: true })
}
