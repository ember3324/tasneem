'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useLocale } from '@/lib/i18n/client'

// Default view centered on the Grand Mosque, Mecca — the only service area for now.
const DEFAULT_CENTER: [number, number] = [39.8262, 21.4225]

export function LocationPicker({
  onChange,
}: {
  onChange: (coords: { lat: number; lng: number }) => void
}) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markerRef = useRef<mapboxgl.Marker | null>(null)
  const [locating, setLocating] = useState(false)
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const { t } = useLocale()

  useEffect(() => {
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? ''
    if (!mapContainer.current || mapRef.current) return

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: DEFAULT_CENTER,
      zoom: 10,
    })
    mapRef.current = map

    const marker = new mapboxgl.Marker({ draggable: true }).setLngLat(DEFAULT_CENTER).addTo(map)
    markerRef.current = marker

    const updateFromMarker = () => {
      const { lat, lng } = marker.getLngLat()
      setCoords({ lat, lng })
      onChange({ lat, lng })
    }

    marker.on('dragend', updateFromMarker)
    map.on('click', (e) => {
      marker.setLngLat(e.lngLat)
      updateFromMarker()
    })

    return () => {
      // React (Strict Mode, dev only) runs effects twice: mount, cleanup,
      // mount again. Without resetting these refs, the guard clause above
      // sees a stale (already-removed) map on the second mount and skips
      // creating a new one, leaving the container permanently empty.
      map.remove()
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
        const lng = position.coords.longitude
        const lat = position.coords.latitude
        mapRef.current?.flyTo({ center: [lng, lat], zoom: 14 })
        markerRef.current?.setLngLat([lng, lat])
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
      <div ref={mapContainer} className="h-80 w-full rounded-lg border border-neutral-200" />
      <p className="mt-2 text-xs text-neutral-500">{t('address.dragPinHint')}</p>
    </div>
  )
}
