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
  const { data: address } = await admin
    .from('addresses')
    .select('*')
    .eq('id', addressId)
    .eq('user_id', profile.id)
    .maybeSingle<Address>()

  if (!address || !address.in_service_area) redirect('/checkout/address')

  type CartRow = { id: string; quantity: number; product: Product }
  const { data: cartItems } = await admin
    .from('cart_items')
    .select('id, quantity, product:products(*)')
    .eq('user_id', profile.id)
    .returns<CartRow[]>()

  if (!cartItems || cartItems.length === 0) redirect('/cart')

  const total = cartItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
  const locale = await getLocale()

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-semibold text-neutral-900">{t(locale, 'checkout.title')}</h1>

      <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-medium text-neutral-700">{t(locale, 'checkout.deliveringTo')}</h2>
        <p className="mt-1 text-sm text-neutral-600">
          {[address.address_line, address.city].filter(Boolean).join(', ')}
        </p>

        <h2 className="mt-4 text-sm font-medium text-neutral-700">{t(locale, 'checkout.items')}</h2>
        <ul className="mt-1 space-y-1 text-sm text-neutral-600">
          {cartItems.map((item) => (
            <li key={item.id} className="flex justify-between">
              <span>
                {item.quantity}x {item.product.name}
              </span>
              <span dir="ltr">{(item.product.price * item.quantity).toFixed(2)} SAR</span>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex justify-between border-t border-neutral-200 pt-4 text-base font-semibold text-neutral-900">
          <span>{t(locale, 'checkout.total')}</span>
          <span dir="ltr">{total.toFixed(2)} SAR</span>
        </div>

        <div className="mt-6">
          <CheckoutForm addressId={address.id} total={total} />
        </div>
      </div>
    </div>
  )
}
