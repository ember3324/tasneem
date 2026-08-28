'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentProfile } from '@/lib/profile'

async function requireAdmin() {
  const profile = await getCurrentProfile()
  if (!profile) throw new Error('Not logged in')
  if (!profile.is_admin) throw new Error('Not an admin')
}

export async function createZone(name: string, polygon: GeoJSON.Polygon) {
  await requireAdmin()
  const admin = createAdminClient()
  await admin.from('service_zones').insert({ name, polygon, active: true })
  revalidatePath('/admin/zones')
}

export async function toggleZoneActive(id: string, active: boolean) {
  await requireAdmin()
  const admin = createAdminClient()
  await admin.from('service_zones').update({ active }).eq('id', id)
  revalidatePath('/admin/zones')
}

export async function deleteZone(id: string) {
  await requireAdmin()
  const admin = createAdminClient()
  await admin.from('service_zones').delete().eq('id', id)
  revalidatePath('/admin/zones')
}
