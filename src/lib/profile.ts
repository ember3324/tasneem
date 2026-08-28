import { cache } from 'react'
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
 *
 * Wrapped in React's cache() because every shop page calls this in addition
 * to the (shop) layout — without memoization that's the same profile query
 * running twice (or more) per request.
 */
export const getCurrentProfile = cache(async (): Promise<CurrentProfile | null> => {
  const profileId = await getSessionProfileId()
  if (!profileId) return null

  const admin = createAdminClient()
  const { data } = await admin
    .from('profiles')
    .select('id, full_name, phone, is_admin')
    .eq('id', profileId)
    .maybeSingle<CurrentProfile>()

  return data ?? null
})
