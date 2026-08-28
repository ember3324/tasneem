import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentProfile } from '@/lib/profile'

// Called client-side the instant Moyasar's on_completed fires (see
// src/components/checkout/moyasar-card-form.tsx). This just records which
// Moyasar payment belongs to which order — it does NOT mark the order as
// paid. That only ever happens after re-verifying the payment's status
// directly with Moyasar (see /api/payments/callback and /api/payments/webhook).
export async function POST(request: Request) {
  const profile = await getCurrentProfile()
  if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const orderNumber = body?.orderNumber
  const moyasarPaymentId = body?.moyasarPaymentId
  if (!orderNumber || !moyasarPaymentId) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Scoped to the caller's own session — only returns a row if this order is theirs.
  const { data: order } = await admin
    .from('orders')
    .select('id')
    .eq('order_number', orderNumber)
    .eq('user_id', profile.id)
    .maybeSingle()

  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

  await admin.from('orders').update({ moyasar_payment_id: moyasarPaymentId }).eq('id', order.id)

  return NextResponse.json({ ok: true })
}
