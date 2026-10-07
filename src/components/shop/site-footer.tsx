import Link from 'next/link'
import { POLICIES } from '@/lib/policies'

const WHATSAPP_NUMBER = '966590300780'

export function SiteFooter() {
  return (
    <footer
      className="mt-12 border-t border-brand-600 text-white"
      style={{
        backgroundColor: '#1d4363',
        backgroundImage: 'linear-gradient(rgba(29, 67, 99, 0.93), rgba(29, 67, 99, 0.93)), url(/footerbg.jpeg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <p className="text-lg font-extrabold text-white">نبع مكيون</p>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-white/75">
            مياه معبأة بجودة عالية، توصيل داخل مكة المكرمة والمناطق المجاورة.
          </p>
        </div>

        <div>
          <p className="text-sm font-bold text-accent-400">السياسات</p>
          <nav className="mt-3 flex flex-col gap-2 text-sm text-white/75">
            {POLICIES.map((policy) => (
              <Link key={policy.slug} href={`/policies/${policy.slug}`} className="transition hover:text-white">
                {policy.navLabel}
              </Link>
            ))}
          </nav>
        </div>

        <div>
          <p className="text-sm font-bold text-accent-400">تواصل معنا</p>
          <div className="mt-3 flex flex-col items-start gap-3 text-sm text-white/75">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-3 py-2 font-semibold text-white transition hover:bg-[#1ebe5a]"
            >
              <svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
                <path d="M16.001 3C9.107 3 3.5 8.607 3.5 15.5c0 2.393.664 4.63 1.816 6.54L3 29l7.146-2.276A12.44 12.44 0 0 0 16.001 28C22.894 28 28.5 22.393 28.5 15.5S22.894 3 16.001 3Zm0 22.7a10.16 10.16 0 0 1-5.176-1.418l-.371-.22-4.24 1.35 1.373-4.132-.242-.386A10.15 10.15 0 0 1 5.8 15.5c0-5.633 4.568-10.2 10.201-10.2 5.632 0 10.199 4.567 10.199 10.2 0 5.632-4.567 10.2-10.199 10.2Z" />
              </svg>
              راسلنا على واتساب
            </a>
            <span dir="ltr" className="font-medium">+966 59 030 0780</span>
          </div>
        </div>
      </div>

      <div className="border-t border-white/15 py-4">
        <p className="text-center text-xs text-white/55">نبع مكيون — جميع الحقوق محفوظة</p>
      </div>
    </footer>
  )
}
