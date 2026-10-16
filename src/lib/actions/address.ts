'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
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
  const mosqueName = String(formData.get('mosqueName') ?? '').trim().slice(0, 120)
  const defaultLabel = t(locale, 'address.labelPlaceholder')
  const rawLabel = String(formData.get('label') ?? '').trim()
  // The untouched default label ("المنزل") says nothing for a mosque delivery —
  // name the saved address after the mosque instead.
  const label = rawLabel && rawLabel !== defaultLabel ? rawLabel : mosqueName || defaultLabel
  const details = String(formData.get('addressLine') ?? '').trim()
  // No separate DB column: the mosque name leads address_line, which is what
  // the order Telegram message, the Sheet and the address card already show.
  const addressLine = [mosqueName, details].filter(Boolean).join(' — ')

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return { error: t(locale, 'address.error.needLocation') }
  }
  if (!mosqueName) {
    return { error: t(locale, 'address.error.needMosqueName') }
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
      lat,
      lng,
      in_service_area: inServiceArea,
    })
    .select('id')
    .single()

  if (error || !address) {
    return { error: error?.message ?? t(locale, 'address.error.couldNotSave') }
  }

  revalidatePath('/account')
  revalidatePath('/checkout/address')

  if (!inServiceArea) {
    return { outsideServiceArea: true }
  }

  redirect(`/checkout?address=${address.id}`)
}

// Scoped to user_id since the service-role admin client bypasses RLS — see
// the note in lib/actions/cart.ts for why this check is required here.
//
// Addresses referenced by a past order are protected by the
// orders_address_id_fkey foreign key constraint (Postgres error 23503), so
// the delete fails for those — this used to be swallowed silently, which
// looked like a successful removal (the optimistic UI hid the card) until
// the next real page load showed the address was never actually gone.
export async function deleteAddress(addressId: string): Promise<{ error?: string }> {
  const locale = await getLocale()
  const profile = await getCurrentProfile()
  if (!profile) return { error: t(locale, 'address.error.mustBeLoggedIn') }

  const admin = createAdminClient()
  const { error } = await admin.from('addresses').delete().eq('id', addressId).eq('user_id', profile.id)

  if (error) {
    if (error.code === '23503') {
      return { error: t(locale, 'account.addressInUse') }
    }
    return { error: error.message }
  }

  revalidatePath('/account')
  revalidatePath('/checkout/address')
  return {}
}
