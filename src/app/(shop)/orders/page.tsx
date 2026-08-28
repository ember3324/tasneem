import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentProfile } from '@/lib/profile'
import { ORDER_STATUS_LABELS, type Order } from '@/lib/types'

export default async function OrdersPage() {
  const profile = await getCurrentProfile()
  if (!profile) redirect('/login?next=/orders')

  const admin = createAdminClient()
  const { data: orders } = await admin
    .from('orders')
    .select('*')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })
    .returns<Order[]>()

  const all = orders ?? []
  const current = all.filter((o) => o.status !== 'completed' && o.status !== 'cancelled')
  const past = all.filter((o) => o.status === 'completed' || o.status === 'cancelled')

  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <section>
        <h1 className="text-2xl font-semibold text-neutral-900">Current orders</h1>
        {current.length === 0 ? (
          <p className="mt-4 text-sm text-neutral-500">No active orders.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {current.map((order) => (
              <OrderRow key={order.id} order={order} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold text-neutral-900">Past orders</h2>
        {past.length === 0 ? (
          <p className="mt-4 text-sm text-neutral-500">No past orders yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {past.map((order) => (
              <OrderRow key={order.id} order={order} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function OrderRow({ order }: { order: Order }) {
  return (
    <Link
      href={`/orders/${order.order_number}`}
      className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-4 shadow-sm hover:border-neutral-400"
    >
      <div>
        <p className="font-medium text-neutral-900">{order.order_number}</p>
        <p className="text-sm text-neutral-500">{order.items_summary}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-neutral-900">
          {ORDER_STATUS_LABELS[order.status]}
        </p>
        <p className="text-sm text-neutral-500">{order.total_amount.toFixed(2)} SAR</p>
      </div>
    </Link>
  )
}
