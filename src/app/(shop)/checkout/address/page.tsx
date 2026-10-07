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
      <h1 className="section-title text-2xl">{t(locale, 'address.title')}</h1>
      <p className="mt-4 text-sm text-neutral-500">{t(locale, 'address.subtitle')}</p>

      {savedAddresses.length > 0 && (
        <div className="mt-6 space-y-3">
          <h2 className="text-sm font-bold text-brand-700">{t(locale, 'address.chooseAddress')}</h2>
          {savedAddresses.map((address) => (
            <div key={address.id} className="surface surface-hover flex items-center justify-between gap-4 p-4">
              <div className="flex min-w-0 gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 21s7-5.5 7-11a7 7 0 10-14 0c0 5.5 7 11 7 11z" />
                    <circle cx="12" cy="10" r="2.5" />
                  </svg>
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-neutral-800">{address.label}</p>
                  <p className="text-sm text-neutral-500">
                    {[address.address_line, address.city].filter(Boolean).join(', ')}
                  </p>
                </div>
              </div>
              {address.in_service_area ? (
                <Link href={`/checkout?address=${address.id}`} className="btn btn-primary shrink-0 px-4 py-2 text-xs">
                  {t(locale, 'address.deliverHere')}
                </Link>
              ) : (
                <span className="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-semibold text-neutral-500">
                  {t(locale, 'account.outsideArea')}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="surface mt-6 p-6">
        {savedAddresses.length > 0 && (
          <h2 className="mb-4 text-sm font-bold text-brand-700">{t(locale, 'address.addNew')}</h2>
        )}
        <AddressForm />
      </div>
    </div>
  )
}
