'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import 'mapbox-gl/dist/mapbox-gl.css'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import { createZone } from '@/lib/actions/zones'

// Default view centered on the Grand Mosque, Mecca — the only service area for now.
const DEFAULT_CENTER: [number, number] = [39.8262, 21.4225]

export function ZoneMapEditor() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const drawRef = useRef<MapboxDraw | null>(null)
  const [hasPolygon, setHasPolygon] = useState(false)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? ''
    if (!mapContainer.current) return

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: DEFAULT_CENTER,
      zoom: 9, // zoomed out a bit further than the customer picker, so the Mina/Arafat/Muzdalifah area is visible for drawing
    })

    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: { polygon: true, trash: true },
    })
    drawRef.current = draw
    map.addControl(draw)

    const updateHasPolygon = () => setHasPolygon(draw.getAll().features.length > 0)
    map.on('draw.create', updateHasPolygon)
    map.on('draw.delete', updateHasPolygon)
    map.on('draw.update', updateHasPolygon)

    return () => map.remove()
  }, [])

  async function handleSave() {
    const draw = drawRef.current
    if (!draw || !name.trim()) return

    const features = draw.getAll().features
    const polygonFeature = features.find((f) => f.geometry.type === 'Polygon')
    if (!polygonFeature) return

    setSaving(true)
    try {
      await createZone(name.trim(), polygonFeature.geometry as GeoJSON.Polygon)
      draw.deleteAll()
      setHasPolygon(false)
      setName('')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div ref={mapContainer} className="h-96 w-full rounded-lg border border-neutral-200" />
      <div className="mt-3 flex gap-2">
        <input
          type="text"
          placeholder="Zone name (e.g. Riyadh North)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        />
        <button
          type="button"
          disabled={!hasPolygon || !name.trim() || saving}
          onClick={handleSave}
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save zone'}
        </button>
      </div>
      <p className="mt-2 text-xs text-neutral-500">
        Use the polygon tool (top-right of the map) to draw a delivery zone, then name and save it.
      </p>
    </div>
  )
}
