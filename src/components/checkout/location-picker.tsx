'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useLocale } from '@/lib/i18n/client'

// Default view centered on the Grand Mosque, Mecca — the only service area for now.
const DEFAULT_CENTER: [number, number] = [39.8262, 21.4225]

// Mosques are drawn from a static file (public/data/mosques.geojson, built from
// OpenStreetMap by scripts/update-mosques.mjs). The basemap itself only labels a
// handful of famous ones, and a live search API would bill every pan of the map.
// Each badge is tappable: it is a one-tap way to place the pin on a mosque.
const MOSQUE_SOURCE = 'mosques-data'
const MOSQUE_LAYER = 'mosques'
const MOSQUE_ICON = 'mosque-icon'

/** A green round badge with a white dome and minarets, drawn here to avoid shipping an image. */
function drawMosqueIcon(): ImageData {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#0f7b4f'
  ctx.beginPath()
  ctx.arc(32, 32, 29, 0, Math.PI * 2)
  ctx.fill()
  ctx.lineWidth = 4
  ctx.strokeStyle = '#ffffff'
  ctx.stroke()

  ctx.fillStyle = '#ffffff'
  ctx.beginPath() // dome
  ctx.arc(32, 36, 12, Math.PI, 0)
  ctx.fill()
  ctx.fillRect(20, 36, 24, 11) // hall
  for (const x of [13, 47]) {
    ctx.fillRect(x, 24, 4, 23) // minaret shaft
    ctx.beginPath() // minaret tip
    ctx.moveTo(x - 1, 24)
    ctx.lineTo(x + 2, 17)
    ctx.lineTo(x + 5, 24)
    ctx.fill()
  }
  return ctx.getImageData(0, 0, size, size)
}

export function LocationPicker({
  onChange,
}: {
  onChange: (coords: { lat: number; lng: number }, place?: { name: string }) => void
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
      // Close enough that the mosque badges (shown from zoom 12) are visible at once.
      zoom: 13,
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

    map.on('load', () => {
      map.addImage(MOSQUE_ICON, drawMosqueIcon(), { pixelRatio: 2 })
      map.addSource(MOSQUE_SOURCE, { type: 'geojson', data: '/data/mosques.geojson' })
      map.addLayer({
        id: MOSQUE_LAYER,
        type: 'symbol',
        source: MOSQUE_SOURCE,
        minzoom: 12,
        layout: {
          'icon-image': MOSQUE_ICON,
          'icon-size': ['interpolate', ['linear'], ['zoom'], 12, 0.45, 16, 0.85],
          // Overlapping badges are hidden rather than piled up; the file lists
          // named mosques first, so they win, and zooming in reveals the rest.
          'icon-allow-overlap': false,
          'text-field': ['get', 'name'],
          'text-size': 11,
          'text-offset': [0, 1.2],
          'text-anchor': 'top',
          'text-optional': true,
        },
        paint: {
          'text-color': '#0b5d3b',
          'text-halo-color': '#ffffff',
          'text-halo-width': 1.4,
        },
      })

      map.on('mouseenter', MOSQUE_LAYER, () => (map.getCanvas().style.cursor = 'pointer'))
      map.on('mouseleave', MOSQUE_LAYER, () => (map.getCanvas().style.cursor = ''))

      // Tapping a mosque puts the pin on it and tells the form its name.
      map.on('click', MOSQUE_LAYER, (e) => {
        const feature = e.features?.[0]
        if (!feature || feature.geometry.type !== 'Point') return
        const [lng, lat] = feature.geometry.coordinates
        const name = (feature.properties?.name_ar ?? feature.properties?.name) as string | undefined

        marker.setLngLat([lng, lat])
        map.easeTo({ center: [lng, lat] })
        setCoords({ lat, lng })
        onChange({ lat, lng }, name ? { name } : undefined)
      })
    })

    map.on('click', (e) => {
      // A tap on a mosque is handled above; don't also drop the pin under the finger.
      if (map.getLayer(MOSQUE_LAYER) && map.queryRenderedFeatures(e.point, { layers: [MOSQUE_LAYER] }).length) return
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
      <p className="mt-1 text-xs text-neutral-500">{t('address.mosqueHint')}</p>
    </div>
  )
}
