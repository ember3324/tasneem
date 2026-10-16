'use client'

/* eslint-disable @typescript-eslint/no-explicit-any -- the Google Maps JS API is
   loaded from Google's CDN at runtime; no @types/google.maps package is installed. */

import { useEffect, useRef, useState } from 'react'
import { useLocale } from '@/lib/i18n/client'

// Google's own basemap shows (almost) every mosque in Mecca with its name, which
// the OpenStreetMap file used by the Mapbox picker does not. Nothing is copied
// out of Google: the customer taps a place on Google's map and we keep only what
// the customer chose for their own order (the pin and the place name).
//
// Enabled by setting NEXT_PUBLIC_GOOGLE_MAPS_KEY (Maps JavaScript API + Places
// API (New), key restricted to the site's domains). Without it the address form
// falls back to the Mapbox picker.

const DEFAULT_CENTER = { lat: 21.4225, lng: 39.8262 } // the Grand Mosque

declare global {
  interface Window {
    google?: any
    __gmapsLoading?: Promise<void>
  }
}

function loadGoogleMaps(key: string): Promise<void> {
  if (window.google?.maps?.Map) return Promise.resolve()
  if (window.__gmapsLoading) return window.__gmapsLoading
  window.__gmapsLoading = new Promise<void>((resolve, reject) => {
    const cb = '__gmapsReady'
    ;(window as any)[cb] = () => resolve()
    const s = document.createElement('script')
    s.src =
      `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}` +
      `&libraries=places&language=ar&region=SA&loading=async&callback=${cb}`
    s.async = true
    s.onerror = () => {
      window.__gmapsLoading = undefined
      reject(new Error('Google Maps failed to load'))
    }
    document.head.appendChild(s)
  })
  return window.__gmapsLoading
}

export function GoogleLocationPicker({
  onChange,
}: {
  onChange: (coords: { lat: number; lng: number }, place?: { name: string }) => void
}) {
  const container = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const [locating, setLocating] = useState(false)
  const [failed, setFailed] = useState(false)
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const { t } = useLocale()

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? ''
    let cancelled = false

    loadGoogleMaps(key)
      .then(async () => {
        if (cancelled || !container.current) return
        const g = window.google
        const { Map } = await g.maps.importLibrary('maps')
        const { Place } = await g.maps.importLibrary('places')

        const map = new Map(container.current, {
          center: DEFAULT_CENTER,
          zoom: 15,
          clickableIcons: true, // mosque icons on the basemap are tappable
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          gestureHandling: 'greedy',
        })
        mapRef.current = map

        const marker = new g.maps.Marker({ position: DEFAULT_CENTER, map, draggable: true })
        markerRef.current = marker

        const setPin = (lat: number, lng: number, place?: { name: string }) => {
          marker.setPosition({ lat, lng })
          setCoords({ lat, lng })
          onChange({ lat, lng }, place)
        }

        marker.addListener('dragend', () => {
          const p = marker.getPosition()
          setPin(p.lat(), p.lng())
        })

        map.addListener('click', async (e: any) => {
          if (!e.latLng) return
          if (!e.placeId) {
            setPin(e.latLng.lat(), e.latLng.lng())
            return
          }
          // A tap on a place icon (e.g. a mosque): keep Google's info window
          // closed, put the pin on the place and pass its name to the form.
          e.stop()
          setPin(e.latLng.lat(), e.latLng.lng())
          try {
            const place = new Place({ id: e.placeId, requestedLanguage: 'ar' })
            await place.fetchFields({ fields: ['displayName', 'location'] })
            const loc = place.location
            const name: string | undefined = place.displayName ?? undefined
            if (loc) setPin(loc.lat(), loc.lng(), name ? { name } : undefined)
            else if (name) onChange({ lat: e.latLng.lat(), lng: e.latLng.lng() }, { name })
          } catch {
            // Name lookup failed — the pin is already placed; the customer types the name.
          }
        })
      })
      .catch(() => !cancelled && setFailed(true))

    return () => {
      cancelled = true
      markerRef.current?.setMap?.(null)
      mapRef.current = null
      markerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function useMyLocation() {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        mapRef.current?.panTo({ lat, lng })
        mapRef.current?.setZoom(17)
        markerRef.current?.setPosition({ lat, lng })
        setCoords({ lat, lng })
        onChange({ lat, lng })
        setLocating(false)
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={useMyLocation}
          disabled={locating}
          className="rounded-lg border border-ocean-300 px-3 py-1.5 text-sm font-medium text-ocean-700 hover:bg-ocean-50 disabled:opacity-50"
        >
          {locating ? t('address.locating') : t('address.useMyLocation')}
        </button>
        {coords && (
          <span dir="ltr" className="text-xs text-neutral-500">
            {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
          </span>
        )}
      </div>
      <div ref={container} className="h-80 w-full rounded-lg border border-neutral-200" />
      {failed && <p className="mt-2 text-xs text-red-600">{t('address.mapFailed')}</p>}
      <p className="mt-2 text-xs text-neutral-500">{t('address.dragPinHint')}</p>
      <p className="mt-1 text-xs text-neutral-500">{t('address.googleMosqueHint')}</p>
    </div>
  )
}
