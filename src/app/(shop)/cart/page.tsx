import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentProfile } from '@/lib/profile'
import { CartItems } from '@/components/shop/cart-items'
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

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold text-neutral-900">{t(locale, 'cart.title')}</h1>
      <CartItems items={items ?? []} />
    </div>
  )
}
