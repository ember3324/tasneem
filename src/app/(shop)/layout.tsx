import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentProfile } from '@/lib/profile'
import { getLocale } from '@/lib/i18n/server'
import { ShopHeader } from '@/components/shop/shop-header'
import { WhatsAppButton } from '@/components/shop/whatsapp-button'

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const [profile, locale] = await Promise.all([getCurrentProfile(), getLocale()])

  let cartCount = 0
  if (profile) {
    const admin = createAdminClient()
    const { data } = await admin.from('cart_items').select('quantity').eq('user_id', profile.id)
    cartCount = (data ?? []).reduce((sum, item) => sum + item.quantity, 0)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <ShopHeader loggedIn={!!profile} cartCount={cartCount} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
      <WhatsAppButton locale={locale} />
    </div>
  )
}
