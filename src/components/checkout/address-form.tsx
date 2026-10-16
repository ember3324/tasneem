'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { saveAddressAndCheckServiceArea } from '@/lib/actions/address'
import { useLocale } from '@/lib/i18n/client'

// mapbox-gl is a large library used only on this page — load it only once
// this component actually mounts client-side instead of bundling it into
// every render of the address form.
const mapPlaceholder = () => <div className="h-80 w-full animate-pulse rounded-xl border border-ocean-200 bg-ocean-50" />

// Google Maps (complete mosque coverage) when its key is configured; otherwise
// the Mapbox picker with the OpenStreetMap mosque file.
const LocationPicker = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY
  ? dynamic(() => import('./google-location-picker').then((m) => m.GoogleLocationPicker), {
      ssr: false,
      loading: mapPlaceholder,
    })
  : dynamic(() => import('./location-picker').then((m) => m.LocationPicker), {
      ssr: false,
      loading: mapPlaceholder,
    })

export function AddressForm() {
  const [state, formAction, pending] = useActionState(saveAddressAndCheckServiceArea, null)
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [mosqueName, setMosqueName] = useState('')
  const [autoName, setAutoName] = useState('')
  const { t } = useLocale()

  // Choosing a named mosque on the map fills the mosque-name field — but never
  // over something the customer typed themselves. Mosques missing from the map
  // (or unnamed there) are handled by the customer typing the name.
  function handleLocation(next: { lat: number; lng: number }, place?: { name: string }) {
    setCoords(next)
    if (!place) return
    if (mosqueName === '' || mosqueName === autoName) {
      setMosqueName(place.name)
      setAutoName(place.name)
    }
  }

  if (state && 'outsideServiceArea' in state) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center">
        <h2 className="text-lg font-bold text-amber-900">{t('address.outsideTitle')}</h2>
        <p className="mt-2 text-sm text-amber-800">{t('address.outsideBody')}</p>
        <Link href="/cart" className="mt-4 inline-block text-sm font-semibold underline">
          {t('address.backToCart')}
        </Link>
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="lat" value={coords?.lat ?? ''} />
      <input type="hidden" name="lng" value={coords?.lng ?? ''} />

      <LocationPicker onChange={handleLocation} />

      <div>
        <label htmlFor="mosqueName" className="field-label">
          {t('address.mosqueName')}
        </label>
        <input
          id="mosqueName"
          name="mosqueName"
          type="text"
          required
          value={mosqueName}
          onChange={(e) => setMosqueName(e.target.value)}
          placeholder={t('address.mosqueNamePlaceholder')}
          className="field"
        />
        <p className="mt-1 text-xs text-neutral-500">{t('address.mosqueNameHint')}</p>
      </div>

      <div>
        <label htmlFor="label" className="field-label">
          {t('address.label')}
        </label>
        <input
          id="label"
          name="label"
          type="text"
          defaultValue={t('address.labelPlaceholder')}
          className="field"
        />
      </div>

      <div>
        <label htmlFor="addressLine" className="field-label">
          {t('address.details')}
        </label>
        <input
          id="addressLine"
          name="addressLine"
          type="text"
          className="field"
        />
      </div>

      {state && 'error' in state && <p className="text-sm text-red-600">{state.error}</p>}

      <button type="submit" disabled={pending || !coords} className="btn btn-primary w-full py-3 text-sm">
        {pending ? t('address.checking') : t('address.continue')}
      </button>
    </form>
  )
}
