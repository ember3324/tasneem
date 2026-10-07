import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentProfile } from '@/lib/profile'
import { CheckoutForm } from '@/components/checkout/checkout-form'
import { getLocale, t } from '@/lib/i18n/server'
import type { Address, Product } from '@/lib/types'

export default async function CheckoutPage(props: PageProps<'/checkout'>) {
  const searchParams = await props.searchParams
  const addressId = typeof searchParams.address === 'string' ? searchParams.address : ''

  const profile = await getCurrentProfile()
  if (!profile) redirect('/login?next=/checkout')

  if (!addressId) redirect('/checkout/address')

  const admin = createAdminClient()
  type CartRow = { id: string; quantity: number; product: Product }

  // address and cartItems both only depend on profile.id, not on each
  // other — fetch them together instead of one after the other.
  const [{ data: address }, { data: cartItems }, locale] = await Promise.all([
    admin.from('addresses').select('*').eq('id', addressId).eq('user_id', profile.id).maybeSingle<Address>(),
    admin.from('cart_items').select('id, quantity, product:products(*)').eq('user_id', profile.id).returns<CartRow[]>(),
    getLocale(),
  ])

  if (!address || !address.in_service_area) redirect('/checkout/address')
  if (!cartItems || cartItems.length === 0) redirect('/cart')

  const total = cartItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0)

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="section-title text-2xl">{t(locale, 'checkout.title')}</h1>

      <div className="surface mt-8 p-6">
        <h2 className="text-sm font-bold text-brand-700">{t(locale, 'checkout.deliveringTo')}</h2>
        <p className="mt-1 text-sm text-neutral-600">
          {[address.address_line, address.city].filter(Boolean).join(', ')}
        </p>

        <h2 className="mt-6 text-sm font-bold text-brand-700">{t(locale, 'checkout.items')}</h2>
        <ul className="mt-2 divide-y divide-ocean-100 text-sm text-neutral-600">
          {cartItems.map((item) => (
            <li key={item.id} className="flex justify-between py-2">
              <span>
                {item.quantity}× {item.product.name}
              </span>
              <span dir="ltr" className="font-semibold text-neutral-700">
                {(item.product.price * item.quantity).toFixed(2)} ر.س
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex items-center justify-between rounded-xl bg-brand-50/70 px-4 py-3">
          <span className="text-sm font-bold text-brand-700">{t(locale, 'checkout.total')}</span>
          <span dir="ltr" className="text-xl font-extrabold text-accent-600">
            {total.toFixed(2)} ر.س
          </span>
        </div>

        <div className="mt-6">
          <CheckoutForm addressId={address.id} total={total} />
        </div>
      </div>
    </div>
  )
}
