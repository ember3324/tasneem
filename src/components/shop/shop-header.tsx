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
    <header className="sticky top-0 z-10 border-b border-ocean-200 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/categories" className="text-lg font-semibold text-ocean-700">
          AquaShop
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-2 text-sm font-medium text-neutral-600 sm:flex">
          <Link
            href="/categories"
            className="rounded-lg border border-ocean-200 px-3 py-1.5 hover:border-ocean-400 hover:bg-ocean-50 hover:text-ocean-600"
          >
            {t('nav.shop')}
          </Link>
          {loggedIn && (
            <Link
              href="/orders"
              className="rounded-lg border border-ocean-200 px-3 py-1.5 hover:border-ocean-400 hover:bg-ocean-50 hover:text-ocean-600"
            >
              {t('nav.orders')}
            </Link>
          )}
          <Link
            href="/cart"
            className="rounded-lg border border-ocean-200 px-3 py-1.5 hover:border-ocean-400 hover:bg-ocean-50 hover:text-ocean-600"
          >
            {cartLabel}
          </Link>
          {loggedIn ? (
            <>
              <Link
                href="/account"
                className="rounded-lg border border-ocean-200 px-3 py-1.5 hover:border-ocean-400 hover:bg-ocean-50 hover:text-ocean-600"
              >
                {t('nav.account')}
              </Link>
              <form action={signOut}>
                <button
                  type="submit"
                  className="rounded-lg border border-ocean-200 px-3 py-1.5 hover:border-ocean-400 hover:bg-ocean-50 hover:text-ocean-600"
                >
                  {t('nav.logout')}
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-lg border border-ocean-200 px-3 py-1.5 hover:border-ocean-400 hover:bg-ocean-50 hover:text-ocean-600"
            >
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
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-ocean-300 hover:bg-ocean-50"
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
        <nav className="border-t border-ocean-200 bg-white/95 backdrop-blur-md px-4 py-3 text-sm font-medium text-neutral-700 sm:hidden">
          <div className="flex flex-col gap-1.5">
            <Link
              href="/categories"
              className="rounded-lg border border-ocean-200 px-2 py-2 hover:bg-ocean-50"
              onClick={() => setMenuOpen(false)}
            >
              {t('nav.shop')}
            </Link>
            {loggedIn && (
              <Link
                href="/orders"
                className="rounded-lg border border-ocean-200 px-2 py-2 hover:bg-ocean-50"
                onClick={() => setMenuOpen(false)}
              >
                {t('nav.orders')}
              </Link>
            )}
            <Link
              href="/cart"
              className="rounded-lg border border-ocean-200 px-2 py-2 hover:bg-ocean-50"
              onClick={() => setMenuOpen(false)}
            >
              {cartLabel}
            </Link>
            {loggedIn ? (
              <>
                <Link
                  href="/account"
                  className="rounded-lg border border-ocean-200 px-2 py-2 hover:bg-ocean-50"
                  onClick={() => setMenuOpen(false)}
                >
                  {t('nav.account')}
                </Link>
                <form action={signOut}>
                  <button
                    type="submit"
                    className="w-full rounded-lg border border-ocean-200 px-2 py-2 text-left hover:bg-ocean-50 rtl:text-right"
                  >
                    {t('nav.logout')}
                  </button>
                </form>
              </>
            ) : (
              <Link
                href="/login"
                className="rounded-lg border border-ocean-200 px-2 py-2 hover:bg-ocean-50"
                onClick={() => setMenuOpen(false)}
              >
                {t('nav.login')}
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}
