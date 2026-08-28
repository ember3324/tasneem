import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Service-role client: bypasses RLS entirely. Server-only — never import
// this from a Client Component or expose SUPABASE_SERVICE_ROLE_KEY to the
// browser. Used by: the Google Sheets sync cron job and the Moyasar
// payment webhook, both of which need to write order/payment status on
// behalf of the customer without a logged-in session.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error(
      'Missing Supabase config: copy .env.example to .env.local, create a Supabase project, ' +
        'and fill in NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY. See SETUP.md.'
    )
  }

  return createSupabaseClient(url, serviceRoleKey, { auth: { persistSession: false } })
}
