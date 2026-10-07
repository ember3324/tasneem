import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentProfile } from '@/lib/profile'
import { getLocale, t } from '@/lib/i18n/server'
import { AddressCard } from '@/components/shop/address-card'
import type { Address } from '@/lib/types'

export default async function AccountPage() {
  const profile = await getCurrentProfile()
  if (!profile) redirect('/login?next=/account')

  const admin = createAdminClient()
  const [{ data: addresses }, locale] = await Promise.all([
    admin.from('addresses').select('*').eq('user_id', profile.id).order('created_at', { ascending: false }).returns<Address[]>(),
    getLocale(),
  ])

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <section>
        <h1 className="section-title text-2xl">{t(locale, 'account.title')}</h1>
        <div className="surface mt-6 p-6">
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-neutral-500">{t(locale, 'account.name')}</dt>
              <dd className="font-medium text-neutral-900">{profile.full_name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-500">{t(locale, 'account.phone')}</dt>
              <dd dir="ltr" className="font-medium text-neutral-900">{profile.phone}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section>
        <h2 className="section-title text-lg">{t(locale, 'account.savedAddresses')}</h2>
        {(!addresses || addresses.length === 0) ? (
          <p className="mt-2 text-sm text-neutral-500">{t(locale, 'account.noAddresses')}</p>
        ) : (
          <div className="mt-4 space-y-3">
            {addresses.map((address) => (
              <AddressCard key={address.id} address={address} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
