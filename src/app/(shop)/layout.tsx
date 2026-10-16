import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentProfile } from '@/lib/profile'
import { ShopHeader } from '@/components/shop/shop-header'
import { SiteFooter } from '@/components/shop/site-footer'

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile()

  let cartCount = 0
  if (profile) {
    const admin = createAdminClient()
    const { data } = await admin.from('cart_items').select('quantity').eq('user_id', profile.id)
    cartCount = (data ?? []).reduce((sum, item) => sum + item.quantity, 0)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <ShopHeader loggedIn={!!profile} cartCount={cartCount} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:py-8">{children}</main>
      <SiteFooter loggedIn={!!profile} />
    </div>
  )
}
