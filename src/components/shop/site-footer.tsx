import Link from 'next/link'
import { POLICIES } from '@/lib/policies'

export function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-ocean-200 bg-white/85 py-8">
      <div className="mx-auto max-w-5xl px-4 text-center">
        <p className="text-sm font-medium text-neutral-700">السياسات</p>
        <nav className="mt-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-neutral-500">
          {POLICIES.map((policy) => (
            <Link key={policy.slug} href={`/policies/${policy.slug}`} className="hover:text-ocean-600">
              {policy.navLabel}
            </Link>
          ))}
        </nav>
        <p className="mt-6 text-xs text-neutral-400">التسنيم المكي — جميع الحقوق محفوظة</p>
      </div>
    </footer>
  )
}
