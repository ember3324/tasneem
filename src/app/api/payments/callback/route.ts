import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { fetchMoyasarPayment, toHalalas } from '@/lib/moyasar'

// Moyasar's callback_url — the customer's browser lands here after
// completing (or failing/cancelling) the hosted card form, with the
// payment id as a query param. Query params are never trusted directly:
// we re-fetch the payment from Moyasar's API before touching the order.
export async function GET(request: Request) {
  const url = new URL(request.url)
  const paymentId = url.searchParams.get('id')
  const orderNumber = url.searchParams.get('order')

  if (!orderNumber) return NextResponse.redirect(new URL('/cart', url))
  if (!paymentId) return NextResponse.redirect(new URL(`/orders/${orderNumber}`, url))

  const admin = createAdminClient()
  const { data: order } = await admin
    .from('orders')
    .select('id, total_amount, status, payment_status')
    .eq('order_number', orderNumber)
    .maybeSingle()

  if (!order) return NextResponse.redirect(new URL('/cart', url))

  try {
    const payment = await fetchMoyasarPayment(paymentId)
    const amountMatches = payment.amount === toHalalas(order.total_amount)

    if (payment.status === 'paid' && amountMatches && payment.currency === 'SAR') {
      await admin
        .from('orders')
        .update({
          payment_status: 'paid',
          moyasar_payment_id: payment.id,
          // Only auto-advance from 'pending' — never overwrite progress an
          // admin has already made in the Sheet (out_for_delivery, etc.).
          ...(order.status === 'pending' ? { status: 'confirmed' } : {}),
        })
        .eq('id', order.id)
    } else if (payment.status === 'failed' && order.payment_status !== 'paid') {
      await admin
        .from('orders')
        .update({ payment_status: 'failed', moyasar_payment_id: payment.id })
        .eq('id', order.id)
    }
  } catch (err) {
    console.error('Payment callback verification failed', err)
  }

  return NextResponse.redirect(new URL(`/orders/${orderNumber}`, url))
}
