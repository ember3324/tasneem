import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentProfile } from '@/lib/profile'
import { AddressForm } from '@/components/checkout/address-form'
import { getLocale, t } from '@/lib/i18n/server'
import type { Address } from '@/lib/types'

export default async function CheckoutAddressPage() {
  const [profile, locale] = await Promise.all([getCurrentProfile(), getLocale()])

  let savedAddresses: Address[] = []
  if (profile) {
    const admin = createAdminClient()
    const { data } = await admin
      .from('addresses')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .returns<Address[]>()
    savedAddresses = data ?? []
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-semibold text-neutral-900">{t(locale, 'address.title')}</h1>
      <p className="mt-1 text-sm text-neutral-500">{t(locale, 'address.subtitle')}</p>

      {savedAddresses.length > 0 && (
        <div className="mt-6 space-y-3">
          <h2 className="text-sm font-medium text-neutral-700">{t(locale, 'address.chooseAddress')}</h2>
          {savedAddresses.map((address) => (
            <div
              key={address.id}
              className="flex items-start justify-between gap-4 rounded-xl border border-ocean-200 bg-white p-4 shadow-sm"
            >
              <div className="min-w-0">
                <p className="font-medium text-neutral-900">{address.label}</p>
                <p className="text-sm text-neutral-500">
                  {[address.address_line, address.city].filter(Boolean).join(', ')}
                </p>
              </div>
              {address.in_service_area ? (
                <Link
                  href={`/checkout?address=${address.id}`}
                  className="shrink-0 rounded-lg border border-ocean-400 bg-white px-3 py-1.5 text-sm font-semibold text-ocean-700 transition hover:border-ocean-500 hover:bg-ocean-50"
                >
                  {t(locale, 'address.deliverHere')}
                </Link>
              ) : (
                <span className="shrink-0 text-xs text-neutral-400">{t(locale, 'account.outsideArea')}</span>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        {savedAddresses.length > 0 && (
          <h2 className="mb-4 text-sm font-medium text-neutral-700">{t(locale, 'address.addNew')}</h2>
        )}
        <AddressForm />
      </div>
    </div>
  )
}
