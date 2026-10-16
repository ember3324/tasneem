// Refreshes public/data/mosques.geojson — the mosques shown on the delivery map
// (src/components/checkout/location-picker.tsx).
//
// Source: OpenStreetMap via the Overpass API (© OpenStreetMap contributors, ODbL;
// the basemap's own attribution already credits it). Downloading once and
// serving a static file keeps the map free of per-request search costs.
//
// Run from the project root whenever you want fresher data:
//   node scripts/update-mosques.mjs
//
// The bounding box matches the delivery zone (Mecca + Mina/Arafat/Muzdalifah);
// widen it here if the zone grows.

import { writeFile, mkdir } from 'node:fs/promises'

const BBOX = '21.28,39.65,21.52,40.05' // south,west,north,east
const QUERY = `[out:json][timeout:120];
(
  node["amenity"="place_of_worship"]["religion"="muslim"](${BBOX});
  way["amenity"="place_of_worship"]["religion"="muslim"](${BBOX});
  node["building"="mosque"](${BBOX});
  way["building"="mosque"](${BBOX});
);
out center tags;`

const ARABIC = /[؀-ۿ]/

const res = await fetch('https://overpass-api.de/api/interpreter', {
  method: 'POST',
  // Overpass rejects requests without a User-Agent (HTTP 406).
  headers: { 'User-Agent': 'nabaa-makkiyoon-build/1.0', Accept: 'application/json' },
  body: new URLSearchParams({ data: QUERY }),
})
if (!res.ok) throw new Error(`Overpass responded ${res.status}`)
const { elements } = await res.json()

const seen = new Set()
const features = []
for (const el of elements) {
  const lat = el.lat ?? el.center?.lat
  const lng = el.lon ?? el.center?.lon
  if (lat == null || lng == null) continue

  // A mosque is often mapped twice (the building and a point inside it).
  const key = `${lat.toFixed(4)},${lng.toFixed(4)}`
  if (seen.has(key)) continue
  seen.add(key)

  // The site is Arabic-only: use the Arabic name, or any name written in Arabic.
  const candidates = [el.tags?.['name:ar'], el.tags?.name].filter(Boolean)
  const name = candidates.find((n) => ARABIC.test(n)) ?? ''

  features.push({
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [Number(lng.toFixed(5)), Number(lat.toFixed(5))] },
    properties: { name },
  })
}

// Named mosques first, so the map's collision handling keeps their labels.
features.sort((a, b) => Number(!!b.properties.name) - Number(!!a.properties.name))

await mkdir('public/data', { recursive: true })
await writeFile('public/data/mosques.geojson', JSON.stringify({ type: 'FeatureCollection', features }))
console.log(`${features.length} mosques (${features.filter((f) => f.properties.name).length} named)`)
