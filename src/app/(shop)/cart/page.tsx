import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentProfile } from '@/lib/profile'
import { CartLineItem } from '@/components/shop/cart-line-item'
import { getLocale, t } from '@/lib/i18n/server'
import type { Product } from '@/lib/types'

type CartRow = {
  id: string
  quantity: number
  product: Product
}

export default async function CartPage() {
  const profile = await getCurrentProfile()
  if (!profile) redirect('/login?next=/cart')

  const admin = createAdminClient()
  const { data: items } = await admin
    .from('cart_items')
    .select('id, quantity, product:products(*)')
    .eq('user_id', profile.id)
    .returns<CartRow[]>()

  const locale = await getLocale()
  const cartItems = items ?? []
  const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold text-neutral-900">{t(locale, 'cart.title')}</h1>

      {cartItems.length === 0 ? (
        <p className="mt-6 text-sm text-neutral-500">
          {t(locale, 'cart.empty')}{' '}
          <Link href="/categories" className="underline">
            {t(locale, 'cart.startShopping')}
          </Link>
          .
        </p>
      ) : (
        <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
          {cartItems.map((item) => (
            <CartLineItem
              key={item.id}
              cartItemId={item.id}
              name={item.product.name}
              unit={item.product.unit}
              price={item.product.price}
              quantity={item.quantity}
              imageUrl={item.product.image_url}
            />
          ))}

          <div className="mt-4 flex items-center justify-between border-t border-neutral-200 pt-4">
            <span className="font-medium text-neutral-900">{t(locale, 'cart.total')}</span>
            <span dir="ltr" className="text-lg font-semibold text-neutral-900">
              {total.toFixed(2)} SAR
            </span>
          </div>

          <Link
            href="/checkout/address"
            className="mt-4 block w-full rounded-lg bg-neutral-900 py-2.5 text-center text-sm font-medium text-white"
          >
            {t(locale, 'cart.checkout')}
          </Link>
        </div>
      )}
    </div>
  )
}
