import { AddressForm } from '@/components/checkout/address-form'
import { getLocale, t } from '@/lib/i18n/server'

export default async function CheckoutAddressPage() {
  const locale = await getLocale()

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-semibold text-neutral-900">{t(locale, 'address.title')}</h1>
      <p className="mt-1 text-sm text-neutral-500">{t(locale, 'address.subtitle')}</p>
      <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <AddressForm />
      </div>
    </div>
  )
}
