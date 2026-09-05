'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from '@/lib/actions/auth'
import { useLocale } from '@/lib/i18n/client'

function Icon({ d }: { d: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  )
}

const ICONS = {
  shop: 'M3 7l1.5-3h15L21 7M3 7v11a2 2 0 002 2h14a2 2 0 002-2V7M3 7h18M9 11a3 3 0 006 0',
  orders: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M8 13h8M8 17h8',
  cart: 'M3 4h2l2.4 12.2a2 2 0 002 1.8h7.2a2 2 0 002-2L20 8H6M9 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z',
  account: 'M12 12a4 4 0 100-8 4 4 0 000 8zm-7 8c0-3.3 3.1-6 7-6s7 2.7 7 6',
  logout: 'M17 16l4-4m0 0l-4-4m4 4H7m4 6H5a2 2 0 01-2-2V6a2 2 0 012-2h6',
  login: 'M15 8l-4 4m0 0l4 4m-4-4h12m-6 6h6a2 2 0 002-2V6a2 2 0 00-2-2h-6',
}

function NavItem({
  href,
  active,
  icon,
  label,
}: {
  href: string
  active: boolean
  icon: keyof typeof ICONS
  label: string
}) {
  return (
    <Link
      href={href}
      className={`flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-2 text-[11px] font-medium transition ${
        active ? 'bg-brand-600 text-white shadow-sm' : 'text-neutral-500 hover:text-brand-600'
      }`}
    >
      <Icon d={ICONS[icon]} />
      {label}
    </Link>
  )
}

export function BottomNav({
  loggedIn,
  cartCount,
}: {
  loggedIn: boolean
  cartCount: number
}) {
  const { t } = useLocale()
  const pathname = usePathname()
  const cartLabel = cartCount > 0 ? `${t('nav.cart')} (${cartCount})` : t('nav.cart')

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 rounded-t-2xl border-t border-ocean-200 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] backdrop-blur-md"
      style={{
        // Same "image over a solid base" technique as the header, at the
        // same visible strength, so scrolled content underneath this fixed
        // bar never bleeds through.
        backgroundColor: '#ffffff',
        backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.4)), url(/footerbg.jpeg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="mx-auto flex max-w-5xl items-stretch gap-1 p-1.5">
        <NavItem href="/categories" active={pathname === '/categories'} icon="shop" label={t('nav.shop')} />
        {loggedIn && (
          <NavItem href="/orders" active={pathname.startsWith('/orders')} icon="orders" label={t('nav.orders')} />
        )}
        <NavItem href="/cart" active={pathname === '/cart'} icon="cart" label={cartLabel} />
        {loggedIn ? (
          <>
            <NavItem href="/account" active={pathname === '/account'} icon="account" label={t('nav.account')} />
            <form action={signOut} className="flex flex-1">
              <button
                type="submit"
                className="flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-2 text-[11px] font-medium text-neutral-500 transition hover:text-brand-600"
              >
                <Icon d={ICONS.logout} />
                {t('nav.logout')}
              </button>
            </form>
          </>
        ) : (
          <NavItem href="/login" active={pathname === '/login'} icon="login" label={t('nav.login')} />
        )}
      </div>
    </nav>
  )
}
