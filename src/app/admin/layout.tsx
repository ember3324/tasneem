import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/profile'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile()
  if (!profile) redirect('/login?next=/admin/zones')
  if (!profile.is_admin) redirect('/')

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white px-4 py-4">
        <span className="text-lg font-semibold text-neutral-900">Admin</span>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>
    </div>
  )
}
