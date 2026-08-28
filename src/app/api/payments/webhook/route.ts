import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isValidMoyasarWebhook } from '@/lib/moyasar'

// Configure this URL in the Moyasar dashboard (or via POST /v1/webhooks)
// listening for payment_paid and payment_failed, with `shared_secret` set
// to MOYASAR_WEBHOOK_SECRET. This is the authoritative confirmation path —
// it fires server-to-server even if the customer closes the tab before the
// callback_url redirect completes.
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

  const query = admin.from('orders').select('id, status, payment_status')
  const { data: order } = orderNumber
    ? await query.eq('order_number', orderNumber).maybeSingle()
    : await query.eq('moyasar_payment_id', paymentId).maybeSingle()

  if (!order) {
    // Nothing to reconcile against yet (e.g. /api/payments/link hasn't run
    // and metadata wasn't forwarded). Acknowledge so Moyasar doesn't retry
    // forever; the callback-url path or a manual lookup covers this case.
    return NextResponse.json({ ok: true })
  }

  if (body.type === 'payment_paid') {
    await admin
      .from('orders')
      .update({
        payment_status: 'paid',
        moyasar_payment_id: paymentId,
        ...(order.status === 'pending' ? { status: 'confirmed' } : {}),
      })
      .eq('id', order.id)
  } else if (body.type === 'payment_failed' && order.payment_status !== 'paid') {
    await admin
      .from('orders')
      .update({ payment_status: 'failed', moyasar_payment_id: paymentId })
      .eq('id', order.id)
  }

  return NextResponse.json({ ok: true })
}
