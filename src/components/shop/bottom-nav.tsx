'use client'

import Link from 'next/link'
import { signOut } from '@/lib/actions/auth'
import { useLocale } from '@/lib/i18n/client'

const itemClass =
  'flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-medium text-neutral-600 transition hover:text-ocean-600'

export function BottomNav({
  loggedIn,
  cartCount,
}: {
  loggedIn: boolean
  cartCount: number
}) {
  const { t } = useLocale()
  const cartLabel = cartCount > 0 ? `${t('nav.cart')} (${cartCount})` : t('nav.cart')

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-ocean-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-stretch">
        <Link href="/categories" className={itemClass}>
          {t('nav.shop')}
        </Link>
        {loggedIn && (
          <Link href="/orders" className={itemClass}>
            {t('nav.orders')}
          </Link>
        )}
        <Link href="/cart" className={itemClass}>
          {cartLabel}
        </Link>
        {loggedIn ? (
          <>
            <Link href="/account" className={itemClass}>
              {t('nav.account')}
            </Link>
            <form action={signOut} className="flex flex-1">
              <button type="submit" className={`${itemClass} w-full`}>
                {t('nav.logout')}
              </button>
            </form>
          </>
        ) : (
          <Link href="/login" className={itemClass}>
            {t('nav.login')}
          </Link>
        )}
      </div>
    </nav>
  )
}
