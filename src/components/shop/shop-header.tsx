'use client'

import Link from 'next/link'
import { signOut } from '@/lib/actions/auth'
import { useLocale } from '@/lib/i18n/client'

const linkClass =
  'rounded-lg border border-ocean-200 px-3 py-1.5 text-sm font-medium text-neutral-600 transition hover:border-ocean-400 hover:bg-ocean-50 hover:text-ocean-600'

export function ShopHeader({
  loggedIn,
  cartCount,
}: {
  loggedIn: boolean
  cartCount: number
}) {
  const { t } = useLocale()
  const cartLabel = cartCount > 0 ? `${t('nav.cart')} (${cartCount})` : t('nav.cart')

  return (
    <header className="sticky top-0 z-10 border-b border-ocean-200 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4">
        <Link href="/categories" className="text-lg font-semibold text-ocean-700">
          التسنيم المكي
        </Link>

        {/* Flat, always-visible nav — wraps naturally on narrow screens
            instead of collapsing behind a hamburger/dropdown. */}
        <nav className="flex flex-wrap items-center gap-2">
          <Link href="/categories" className={linkClass}>
            {t('nav.shop')}
          </Link>
          {loggedIn && (
            <Link href="/orders" className={linkClass}>
              {t('nav.orders')}
            </Link>
          )}
          <Link href="/cart" className={linkClass}>
            {cartLabel}
          </Link>
          {loggedIn ? (
            <>
              <Link href="/account" className={linkClass}>
                {t('nav.account')}
              </Link>
              <form action={signOut}>
                <button type="submit" className={linkClass}>
                  {t('nav.logout')}
                </button>
              </form>
            </>
          ) : (
            <Link href="/login" className={linkClass}>
              {t('nav.login')}
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
