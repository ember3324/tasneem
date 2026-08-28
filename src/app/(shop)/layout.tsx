import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentProfile } from '@/lib/profile'
import { signOut } from '@/lib/actions/auth'

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile()

  let cartCount = 0
  if (profile) {
    const admin = createAdminClient()
    const { data } = await admin.from('cart_items').select('quantity').eq('user_id', profile.id)
    cartCount = (data ?? []).reduce((sum, item) => sum + item.quantity, 0)
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link href="/categories" className="text-lg font-semibold text-neutral-900">
            AquaShop
          </Link>

          <nav className="flex items-center gap-5 text-sm font-medium text-neutral-600">
            <Link href="/categories" className="hover:text-neutral-900">
              Shop
            </Link>
            {profile && (
              <Link href="/orders" className="hover:text-neutral-900">
                Orders
              </Link>
            )}
            <Link href="/cart" className="hover:text-neutral-900">
              Cart{cartCount > 0 && ` (${cartCount})`}
            </Link>
            {profile ? (
              <>
                <Link href="/account" className="hover:text-neutral-900">
                  Account
                </Link>
                <form action={signOut}>
                  <button type="submit" className="hover:text-neutral-900">
                    Log out
                  </button>
                </form>
              </>
            ) : (
              <Link href="/login" className="hover:text-neutral-900">
                Log in
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  )
}
