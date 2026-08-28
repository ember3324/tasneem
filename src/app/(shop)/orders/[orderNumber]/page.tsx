import Image from 'next/image'
import { notFound, redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentProfile } from '@/lib/profile'
import { getLocale, t } from '@/lib/i18n/server'
import type { Order, OrderItem, OrderStatus } from '@/lib/types'

const STATUS_ORDER: OrderStatus[] = ['pending', 'confirmed', 'out_for_delivery', 'completed']

export default async function OrderDetailPage(props: PageProps<'/orders/[orderNumber]'>) {
  const { orderNumber } = await props.params
  const profile = await getCurrentProfile()
  if (!profile) redirect(`/login?next=/orders/${orderNumber}`)

  const admin = createAdminClient()
  const { data: order } = await admin
    .from('orders')
    .select('*')
    .eq('order_number', orderNumber)
    .eq('user_id', profile.id)
    .maybeSingle<Order>()

  if (!order) notFound()

  const { data: items } = await admin
    .from('order_items')
    .select('*')
    .eq('order_id', order.id)
    .returns<OrderItem[]>()

  const locale = await getLocale()
  const currentStepIndex = STATUS_ORDER.indexOf(order.status)

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-semibold text-neutral-900">
        {t(locale, 'orders.order')} <span dir="ltr">{order.order_number}</span>
      </h1>
      <p className="mt-1 text-sm text-neutral-500">
        {t(locale, 'orders.placed')}{' '}
        <span dir="ltr">
          {new Date(order.created_at).toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-SA')}
        </span>
      </p>

      {order.status === 'cancelled' ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {t(locale, 'orders.cancelled')}
        </div>
      ) : (
        <ol className="mt-6 flex justify-between">
          {STATUS_ORDER.map((step, i) => (
            <li key={step} className="flex flex-1 flex-col items-center text-center">
              <div
                className={`h-3 w-3 rounded-full ${
                  i <= currentStepIndex ? 'bg-neutral-900' : 'bg-neutral-200'
                }`}
              />
              <span
                className={`mt-2 text-xs ${
                  i <= currentStepIndex ? 'font-medium text-neutral-900' : 'text-neutral-400'
                }`}
              >
                {t(locale, `status.${step}`)}
              </span>
            </li>
          ))}
        </ol>
      )}

      <div className="mt-8 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-medium text-neutral-700">{t(locale, 'orders.items')}</h2>
        <ul className="mt-2 space-y-1 text-sm text-neutral-600">
          {(items ?? []).map((item) => (
            <li key={item.id} className="flex justify-between">
              <span dir="ltr">
                {item.quantity}x {item.product_name}
              </span>
              <span dir="ltr">{item.line_total.toFixed(2)} SAR</span>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex justify-between border-t border-neutral-200 pt-4 text-base font-semibold text-neutral-900">
          <span>{t(locale, 'orders.total')}</span>
          <span dir="ltr">{order.total_amount.toFixed(2)} SAR</span>
        </div>

        <dl className="mt-4 space-y-1 text-sm text-neutral-600">
          <div className="flex justify-between">
            <dt>{t(locale, 'orders.payment')}</dt>
            <dd>
              {order.payment_method === 'card'
                ? t(locale, 'orders.paidOnline')
                : t(locale, 'orders.cashOnDelivery')}
              {order.payment_method === 'card' && order.payment_status !== 'paid' && (
                <span className="ms-1 text-amber-600">{t(locale, 'orders.pendingSuffix')}</span>
              )}
            </dd>
          </div>
        </dl>

        {order.status === 'completed' && order.proof_photo_url && (
          <div className="mt-4">
            <h2 className="text-sm font-medium text-neutral-700">{t(locale, 'orders.deliveryProof')}</h2>
            <div className="relative mt-2 h-64 w-full overflow-hidden rounded-lg border border-neutral-200">
              <Image
                src={order.proof_photo_url}
                alt={t(locale, 'orders.deliveryProof')}
                fill
                unoptimized
                className="object-cover"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
