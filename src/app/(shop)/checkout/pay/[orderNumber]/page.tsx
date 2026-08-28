import { notFound, redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentProfile } from '@/lib/profile'
import { MoyasarCardForm } from '@/components/checkout/moyasar-card-form'
import type { Order } from '@/lib/types'

export default async function CheckoutPayPage(props: PageProps<'/checkout/pay/[orderNumber]'>) {
  const { orderNumber } = await props.params
  const profile = await getCurrentProfile()
  if (!profile) redirect(`/login?next=/checkout/pay/${orderNumber}`)

  const admin = createAdminClient()
  const { data: order } = await admin
    .from('orders')
    .select('*')
    .eq('order_number', orderNumber)
    .eq('user_id', profile.id)
    .maybeSingle<Order>()

  if (!order) notFound()
  if (order.payment_method !== 'card') redirect(`/orders/${orderNumber}`)
  if (order.payment_status === 'paid') redirect(`/orders/${orderNumber}`)

  const publishableKey = process.env.NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY
  if (!publishableKey) {
    return (
      <p className="text-sm text-red-600">
        Payments are not configured yet (missing NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY).
      </p>
    )
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-semibold text-neutral-900">Pay {order.total_amount.toFixed(2)} SAR</h1>
      <p className="mt-1 text-sm text-neutral-500">Order {order.order_number}</p>

      <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <MoyasarCardForm
          orderNumber={order.order_number}
          amountSar={order.total_amount}
          publishableKey={publishableKey}
        />
      </div>
    </div>
  )
}
