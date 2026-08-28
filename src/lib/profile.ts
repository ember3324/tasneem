import { createAdminClient } from '@/lib/supabase/admin'
import { getSessionProfileId } from '@/lib/session'

export type CurrentProfile = {
  id: string
  full_name: string
  phone: string
  is_admin: boolean
}

/**
 * The MVP auth equivalent of `supabase.auth.getUser()`. There's no Supabase
 * Auth session involved (see src/lib/session.ts) — this reads the signed
 * session cookie and looks the profile up with the service-role client,
 * since RLS's auth.uid()-based policies don't apply to these sessions.
 */
export async function getCurrentProfile(): Promise<CurrentProfile | null> {
  const profileId = await getSessionProfileId()
  if (!profileId) return null

  const admin = createAdminClient()
  const { data } = await admin
    .from('profiles')
    .select('id, full_name, phone, is_admin')
    .eq('id', profileId)
    .maybeSingle<CurrentProfile>()

  return data ?? null
}
