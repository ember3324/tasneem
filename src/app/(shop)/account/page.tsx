import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentProfile } from '@/lib/profile'
import { getLocale, t } from '@/lib/i18n/server'
import { RemoveAddressButton } from '@/components/shop/remove-address-button'
import type { Address } from '@/lib/types'

export default async function AccountPage() {
  const profile = await getCurrentProfile()
  if (!profile) redirect('/login?next=/account')

  const admin = createAdminClient()
  const { data: addresses } = await admin
    .from('addresses')
    .select('*')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })
    .returns<Address[]>()

  const locale = await getLocale()

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <section>
        <h1 className="text-2xl font-semibold text-neutral-900">{t(locale, 'account.title')}</h1>
        <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
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
        <h2 className="text-lg font-semibold text-neutral-900">{t(locale, 'account.savedAddresses')}</h2>
        {(!addresses || addresses.length === 0) ? (
          <p className="mt-2 text-sm text-neutral-500">{t(locale, 'account.noAddresses')}</p>
        ) : (
          <div className="mt-4 space-y-3">
            {addresses.map((address) => (
              <div
                key={address.id}
                className="flex items-start justify-between gap-4 rounded-xl border border-ocean-200 bg-white p-4 shadow-sm"
              >
                <div className="min-w-0">
                  <p className="font-medium text-neutral-900">{address.label}</p>
                  <p className="text-sm text-neutral-500">
                    {address.address_line ? `${address.address_line}, ` : ''}
                    {address.city ?? ''}
                  </p>
                  <p className="mt-1 text-xs text-neutral-400">
                    {address.in_service_area ? t(locale, 'account.withinArea') : t(locale, 'account.outsideArea')}
                  </p>
                </div>
                <RemoveAddressButton addressId={address.id} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
