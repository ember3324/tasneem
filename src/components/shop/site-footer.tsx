import Image from 'next/image'
import Link from 'next/link'
import { POLICIES } from '@/lib/policies'
import { signOut } from '@/lib/actions/auth'
import { getLocale, t } from '@/lib/i18n/server'

const WHATSAPP_NUMBER = '966590300780'

const NAV_LINK = 'transition hover:text-white'

// The one footer for the whole shop. It also carries the account links that
// used to live in a separate floating bar at the bottom of phone screens; the
// shop and cart links are not repeated here because the header always has them.
export async function SiteFooter({ loggedIn }: { loggedIn: boolean }) {
  const locale = await getLocale()

  return (
    <footer
      className="mt-10 border-t border-brand-600 text-white"
      style={{
        backgroundColor: '#1d4363',
        backgroundImage: 'linear-gradient(rgba(29, 67, 99, 0.93), rgba(29, 67, 99, 0.93)), url(/footerbg.jpeg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-4 gap-y-5 px-4 py-6 lg:grid-cols-4 lg:gap-8 lg:py-10">
        <div className="col-span-2 lg:col-span-1">
          <p className="text-lg font-extrabold text-white">نبع مكيون</p>
          <p className="mt-2 hidden max-w-xs text-sm leading-relaxed text-white/75 lg:block">
            مياه معبأة بجودة عالية، توصيل داخل مكة المكرمة والمناطق المجاورة.
          </p>
        </div>

        <div>
          <p className="text-sm font-bold text-accent-400">حسابي</p>
          <nav className="mt-2 flex flex-col items-start gap-1.5 text-sm text-white/75 lg:mt-3 lg:gap-2">
            {loggedIn ? (
              <>
                <Link href="/orders" className={NAV_LINK}>
                  {t(locale, 'nav.orders')}
                </Link>
                <Link href="/account" className={NAV_LINK}>
                  {t(locale, 'nav.account')}
                </Link>
                <form action={signOut}>
                  <button type="submit" className={NAV_LINK}>
                    {t(locale, 'nav.logout')}
                  </button>
                </form>
              </>
            ) : (
              <Link href="/login" className={NAV_LINK}>
                {t(locale, 'nav.login')}
              </Link>
            )}
          </nav>
        </div>

        <div>
          <p className="text-sm font-bold text-accent-400">السياسات</p>
          <nav className="mt-2 flex flex-col gap-1.5 text-sm text-white/75 lg:mt-3 lg:gap-2">
            {POLICIES.map((policy) => (
              <Link key={policy.slug} href={`/policies/${policy.slug}`} className={NAV_LINK}>
                {policy.navLabel}
              </Link>
            ))}
          </nav>
        </div>

        <div className="col-span-2 lg:col-span-1">
          <p className="text-sm font-bold text-accent-400">تواصل معنا</p>
          <div className="mt-2 flex flex-col items-start gap-2 text-xs text-white/75 lg:mt-3 lg:text-sm">
            <div className="flex items-center gap-3">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#1ebe5a]"
              >
                <svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
                  <path d="M16.001 3C9.107 3 3.5 8.607 3.5 15.5c0 2.393.664 4.63 1.816 6.54L3 29l7.146-2.276A12.44 12.44 0 0 0 16.001 28C22.894 28 28.5 22.393 28.5 15.5S22.894 3 16.001 3Zm0 22.7a10.16 10.16 0 0 1-5.176-1.418l-.371-.22-4.24 1.35 1.373-4.132-.242-.386A10.15 10.15 0 0 1 5.8 15.5c0-5.633 4.568-10.2 10.201-10.2 5.632 0 10.199 4.567 10.199 10.2 0 5.632-4.567 10.2-10.199 10.2Z" />
                </svg>
                راسلنا على واتساب
              </a>
              {/* The logo is a white-backed JPEG, so it sits on its own white badge. */}
              <Image
                src="/saudi-business-center.jpeg"
                alt="المركز السعودي للأعمال"
                width={300}
                height={288}
                className="h-10 w-auto rounded-md bg-white p-0.5"
              />
            </div>
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span dir="ltr" className="font-medium">+966 59 030 0780</span>
              <span className="font-semibold text-white/90">
                رقم السجل التجاري <span dir="ltr">7049601284</span>
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/15 py-3">
        <p className="text-center text-xs text-white/55">نبع مكيون — جميع الحقوق محفوظة</p>
      </div>
    </footer>
  )
}
