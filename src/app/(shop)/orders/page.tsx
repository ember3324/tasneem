import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentProfile } from '@/lib/profile'
import { getLocale, t } from '@/lib/i18n/server'
import type { Locale } from '@/lib/i18n/translations'
import type { Order } from '@/lib/types'

export default async function OrdersPage() {
  const profile = await getCurrentProfile()
  if (!profile) redirect('/login?next=/orders')

  const admin = createAdminClient()
  const [{ data: orders }, locale] = await Promise.all([
    admin.from('orders').select('*').eq('user_id', profile.id).order('created_at', { ascending: false }).returns<Order[]>(),
    getLocale(),
  ])
  const all = orders ?? []
  const current = all.filter((o) => o.status !== 'completed' && o.status !== 'cancelled')
  const past = all.filter((o) => o.status === 'completed' || o.status === 'cancelled')

  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <section>
        <h1 className="text-2xl font-semibold text-neutral-900">{t(locale, 'orders.current')}</h1>
        {current.length === 0 ? (
          <p className="mt-4 text-sm text-neutral-500">{t(locale, 'orders.noActive')}</p>
        ) : (
          <div className="mt-4 space-y-3">
            {current.map((order) => (
              <OrderRow key={order.id} order={order} locale={locale} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold text-neutral-900">{t(locale, 'orders.past')}</h2>
        {past.length === 0 ? (
          <p className="mt-4 text-sm text-neutral-500">{t(locale, 'orders.noPast')}</p>
        ) : (
          <div className="mt-4 space-y-3">
            {past.map((order) => (
              <OrderRow key={order.id} order={order} locale={locale} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function OrderRow({ order, locale }: { order: Order; locale: Locale }) {
  return (
    <Link
      href={`/orders/${order.order_number}`}
      className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-4 shadow-sm hover:border-neutral-400"
    >
      <div className="min-w-0 flex-1">
        <p dir="ltr" className="font-medium text-neutral-900">{order.order_number}</p>
        <p className="truncate text-sm text-neutral-500">{order.items_summary}</p>
      </div>
      <div className="ms-4 shrink-0 text-end">
        <p className="text-sm font-medium text-neutral-900">
          {t(locale, `status.${order.status}`)}
        </p>
        <p dir="ltr" className="text-sm text-neutral-500">{order.total_amount.toFixed(2)} SAR</p>
      </div>
    </Link>
  )
}
