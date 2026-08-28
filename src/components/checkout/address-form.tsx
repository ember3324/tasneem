'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { LocationPicker } from './location-picker'
import { saveAddressAndCheckServiceArea } from '@/lib/actions/address'
import { useLocale } from '@/lib/i18n/client'

export function AddressForm() {
  const [state, formAction, pending] = useActionState(saveAddressAndCheckServiceArea, null)
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const { t } = useLocale()

  if (state && 'outsideServiceArea' in state) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center">
        <h2 className="text-lg font-semibold text-amber-900">{t('address.outsideTitle')}</h2>
        <p className="mt-2 text-sm text-amber-800">{t('address.outsideBody')}</p>
        <Link href="/cart" className="mt-4 inline-block text-sm font-medium underline">
          {t('address.backToCart')}
        </Link>
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="lat" value={coords?.lat ?? ''} />
      <input type="hidden" name="lng" value={coords?.lng ?? ''} />

      <LocationPicker onChange={setCoords} />

      <div>
        <label htmlFor="label" className="block text-sm font-medium text-neutral-700">
          {t('address.label')}
        </label>
        <input
          id="label"
          name="label"
          type="text"
          defaultValue={t('address.labelPlaceholder')}
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="addressLine" className="block text-sm font-medium text-neutral-700">
          {t('address.details')}
        </label>
        <input
          id="addressLine"
          name="addressLine"
          type="text"
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="city" className="block text-sm font-medium text-neutral-700">
          {t('address.city')}
        </label>
        <input
          id="city"
          name="city"
          type="text"
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
        />
      </div>

      {state && 'error' in state && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending || !coords}
        className="w-full rounded-lg bg-neutral-900 py-2.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? t('address.checking') : t('address.continue')}
      </button>
    </form>
  )
}
