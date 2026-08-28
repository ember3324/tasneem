'use server'

import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentProfile } from '@/lib/profile'
import { isWithinServiceArea, type ServiceZone } from '@/lib/geo'
import { getLocale, t } from '@/lib/i18n/server'

export type AddressActionResult =
  | { error: string }
  | { outsideServiceArea: true }
  | { success: true }

export async function saveAddressAndCheckServiceArea(
  _prevState: AddressActionResult | null,
  formData: FormData
): Promise<AddressActionResult> {
  const locale = await getLocale()
  const profile = await getCurrentProfile()
  if (!profile) return { error: t(locale, 'address.error.mustBeLoggedIn') }

  const lat = parseFloat(String(formData.get('lat') ?? ''))
  const lng = parseFloat(String(formData.get('lng') ?? ''))
  const defaultLabel = t(locale, 'address.labelPlaceholder')
  const label = String(formData.get('label') ?? defaultLabel).trim() || defaultLabel
  const addressLine = String(formData.get('addressLine') ?? '').trim()
  const city = String(formData.get('city') ?? '').trim()

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return { error: t(locale, 'address.error.needLocation') }
  }

  const admin = createAdminClient()
  const { data: zones } = await admin
    .from('service_zones')
    .select('id, name, polygon, active')
    .eq('active', true)
    .returns<ServiceZone[]>()

  const inServiceArea = isWithinServiceArea(lat, lng, zones ?? [])

  const { data: address, error } = await admin
    .from('addresses')
    .insert({
      user_id: profile.id,
      label,
      address_line: addressLine || null,
      city: city || null,
      lat,
      lng,
      in_service_area: inServiceArea,
    })
    .select('id')
    .single()

  if (error || !address) {
    return { error: error?.message ?? t(locale, 'address.error.couldNotSave') }
  }

  if (!inServiceArea) {
    return { outsideServiceArea: true }
  }

  redirect(`/checkout?address=${address.id}`)
}
