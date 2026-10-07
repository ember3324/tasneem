'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BrandMark } from './brand-mark'

const WHATSAPP_NUMBER = '966590300780'

const PROMISES = [
  {
    label: 'جودة ومواصفات عالية',
    icon: 'M12 3l7 4v5c0 4-3 7.4-7 9-4-1.6-7-5-7-9V7l7-4zm-3 9l2 2 4-4',
  },
  {
    label: 'خدمة مخصصة للمساجد والمؤسسات',
    icon: 'M4 21V10l8-6 8 6v11M9 21v-6h6v6M12 7.5v.01',
  },
  {
    label: 'توصيل داخل مكة في نفس اليوم',
    icon: 'M3 16V7a1 1 0 011-1h9v10H3zm10-7h4l3 3v4h-7V9zM7 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm10 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3z',
  },
]

export function ShopHeader({
  loggedIn,
  cartCount,
}: {
  loggedIn: boolean
  cartCount: number
}) {
  const pathname = usePathname()

  return (
    <header className="sticky z-40 shadow-sm" style={{ top: 'env(safe-area-inset-top, 0px)' }}>
      {/* Promise strip. On a phone the three promises wrap onto two tight
          rows rather than being dropped. */}
      <div className="bg-brand-700 text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-4 gap-y-1 px-3 py-1.5 text-[10px] font-bold sm:gap-6 sm:px-4 sm:py-2 sm:text-[11px] lg:gap-10 lg:text-xs">
          {PROMISES.map((promise, i) => (
            <span key={promise.label} className="flex items-center gap-1.5 sm:gap-2">
              {i > 0 && <span aria-hidden="true" className="me-4 hidden h-4 w-px bg-white/25 sm:block" />}
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d={promise.icon} />
              </svg>
              {promise.label}
            </span>
          ))}
        </div>
      </div>

      <div className="border-b border-ocean-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
          {/* Navigation on the start side; the floating bottom bar covers
              this on phones. */}
          <nav className="hidden flex-1 items-center gap-6 lg:flex">
            <Link href="/categories" className="nav-link" data-active={pathname === '/categories'}>
              الرئيسية
            </Link>
            <Link href="/categories#products" className="nav-link" data-active={false}>
              المنتجات
            </Link>
            {loggedIn && (
              <Link href="/orders" className="nav-link" data-active={pathname.startsWith('/orders')}>
                طلباتي
              </Link>
            )}
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="nav-link"
              data-active={false}
            >
              تواصل معنا
            </a>
          </nav>

          <Link href="/categories" aria-label="نبع مكيون" className="shrink-0 lg:flex-1 lg:justify-center lg:flex">
            <BrandMark />
          </Link>

          <div className="flex flex-1 items-center justify-end gap-3">
            <Link
              href={loggedIn ? '/account' : '/login'}
              className="hidden shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-brand-700 py-1.5 pe-5 ps-1.5 text-sm font-bold text-white transition hover:bg-brand-600 sm:flex"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 12a4 4 0 100-8 4 4 0 000 8zm-7 8c0-3.3 3.1-6 7-6s7 2.7 7 6" />
                </svg>
              </span>
              {loggedIn ? 'حسابي' : 'تسجيل الدخول'}
            </Link>

            <Link
              href="/cart"
              aria-label={`السلة (${cartCount})`}
              className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-ocean-200 bg-white text-brand-700 transition hover:border-brand-300 hover:text-brand-600"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 4h2l2.4 12.2a2 2 0 002 1.8h7.2a2 2 0 002-2L20 8H6M9 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" />
              </svg>
              <span className="absolute -top-1 -left-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-500 px-1 text-[11px] font-bold text-white">
                {cartCount}
              </span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
