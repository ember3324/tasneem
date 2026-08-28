'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signOut } from '@/lib/actions/auth'
import { useLocale } from '@/lib/i18n/client'
import { LanguageToggle } from './language-toggle'

export function ShopHeader({
  loggedIn,
  cartCount,
}: {
  loggedIn: boolean
  cartCount: number
}) {
  const { t } = useLocale()
  const [menuOpen, setMenuOpen] = useState(false)

  const cartLabel = cartCount > 0 ? `${t('nav.cart')} (${cartCount})` : t('nav.cart')

  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/categories" className="text-lg font-semibold text-neutral-900">
          AquaShop
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-5 text-sm font-medium text-neutral-600 sm:flex">
          <Link href="/categories" className="hover:text-neutral-900">
            {t('nav.shop')}
          </Link>
          {loggedIn && (
            <Link href="/orders" className="hover:text-neutral-900">
              {t('nav.orders')}
            </Link>
          )}
          <Link href="/cart" className="hover:text-neutral-900">
            {cartLabel}
          </Link>
          {loggedIn ? (
            <>
              <Link href="/account" className="hover:text-neutral-900">
                {t('nav.account')}
              </Link>
              <form action={signOut}>
                <button type="submit" className="hover:text-neutral-900">
                  {t('nav.logout')}
                </button>
              </form>
            </>
          ) : (
            <Link href="/login" className="hover:text-neutral-900">
              {t('nav.login')}
            </Link>
          )}
          <LanguageToggle />
        </nav>

        {/* Mobile: language toggle + hamburger */}
        <div className="flex items-center gap-2 sm:hidden">
          <LanguageToggle />
          <button
            type="button"
            aria-label="Menu"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-300"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              {menuOpen ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <nav className="border-t border-neutral-200 bg-white px-4 py-3 text-sm font-medium text-neutral-700 sm:hidden">
          <div className="flex flex-col gap-1">
            <Link href="/categories" className="rounded-lg px-2 py-2 hover:bg-neutral-50" onClick={() => setMenuOpen(false)}>
              {t('nav.shop')}
            </Link>
            {loggedIn && (
              <Link href="/orders" className="rounded-lg px-2 py-2 hover:bg-neutral-50" onClick={() => setMenuOpen(false)}>
                {t('nav.orders')}
              </Link>
            )}
            <Link href="/cart" className="rounded-lg px-2 py-2 hover:bg-neutral-50" onClick={() => setMenuOpen(false)}>
              {cartLabel}
            </Link>
            {loggedIn ? (
              <>
                <Link href="/account" className="rounded-lg px-2 py-2 hover:bg-neutral-50" onClick={() => setMenuOpen(false)}>
                  {t('nav.account')}
                </Link>
                <form action={signOut}>
                  <button type="submit" className="w-full rounded-lg px-2 py-2 text-left hover:bg-neutral-50 rtl:text-right">
                    {t('nav.logout')}
                  </button>
                </form>
              </>
            ) : (
              <Link href="/login" className="rounded-lg px-2 py-2 hover:bg-neutral-50" onClick={() => setMenuOpen(false)}>
                {t('nav.login')}
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}
