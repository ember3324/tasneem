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
        <h1 className="section-title text-2xl">{t(locale, 'orders.current')}</h1>
        {current.length === 0 ? (
          <p className="mt-6 text-sm text-neutral-500">{t(locale, 'orders.noActive')}</p>
        ) : (
          <div className="mt-4 space-y-3">
            {current.map((order) => (
              <OrderRow key={order.id} order={order} locale={locale} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="section-title text-xl">{t(locale, 'orders.past')}</h2>
        {past.length === 0 ? (
          <p className="mt-6 text-sm text-neutral-500">{t(locale, 'orders.noPast')}</p>
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
      className="surface surface-hover flex items-center justify-between p-4"
    >
      <div className="min-w-0 flex-1">
        <p dir="ltr" className="font-medium text-neutral-900">{order.order_number}</p>
        <p className="truncate text-sm text-neutral-500">{order.items_summary}</p>
      </div>
      <div className="ms-4 shrink-0 text-end">
        <p className="inline-block rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700">
          {t(locale, `status.${order.status}`)}
        </p>
        <p dir="ltr" className="mt-1 text-sm font-bold text-accent-600">{order.total_amount.toFixed(2)} ر.س</p>
      </div>
    </Link>
  )
}
