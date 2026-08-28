import { booleanPointInPolygon, point, polygon } from '@turf/turf'

export type ServiceZone = {
  id: string
  name: string
  polygon: GeoJSON.Polygon
  active: boolean
}

/**
 * Returns true if (lat, lng) falls inside any of the given active service
 * zones. Zones are stored as GeoJSON Polygon geometry (lng, lat order, per
 * the GeoJSON spec) in `service_zones.polygon`.
 */
export function isWithinServiceArea(
  lat: number,
  lng: number,
  zones: ServiceZone[]
): boolean {
  const customerPoint = point([lng, lat])

  return zones
    .filter((z) => z.active)
    .some((z) => {
      try {
        const zonePolygon = polygon(z.polygon.coordinates)
        return booleanPointInPolygon(customerPoint, zonePolygon)
      } catch {
        // Malformed polygon data shouldn't crash the checkout flow.
        return false
      }
    })
}
