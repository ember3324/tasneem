import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/profile'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile()
  if (!profile) redirect('/login?next=/admin/products')
  if (!profile.is_admin) redirect('/')

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white px-4 py-4">
        <div className="mx-auto flex max-w-3xl items-center gap-5">
          <span className="text-lg font-bold text-neutral-900">لوحة التحكم</span>
          <nav className="flex items-center gap-4 text-sm font-bold text-brand-700">
            <Link href="/admin/products" className="hover:underline">
              المنتجات
            </Link>
            <Link href="/admin/zones" className="hover:underline">
              مناطق التوصيل
            </Link>
            <Link href="/categories" className="text-neutral-500 hover:underline">
              المتجر
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>
    </div>
  )
}
