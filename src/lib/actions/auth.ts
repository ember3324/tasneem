'use server'

import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { createSessionCookie, destroySessionCookie } from '@/lib/session'
import { normalizeSaudiPhone } from '@/lib/phone'
import { getLocale, t } from '@/lib/i18n/server'

export type ActionResult = { error: string } | { success: true }

/**
 * Creates an account (if the phone number is new) or logs in (if it
 * already exists) — no password, no OTP. See src/lib/session.ts for the
 * trade-off this implies.
 */
export async function signUpOrLogIn(
  _prevState: ActionResult | null | undefined,
  formData: FormData
): Promise<ActionResult> {
  const locale = await getLocale()
  const phoneRaw = String(formData.get('phone') ?? '')
  const fullName = String(formData.get('fullName') ?? '').trim()
  const next = String(formData.get('next') ?? '/')

  const phone = normalizeSaudiPhone(phoneRaw)
  if (!phone) {
    return { error: t(locale, 'auth.error.invalidPhone') }
  }

  const admin = createAdminClient()

  const { data: existing } = await admin
    .from('profiles')
    .select('id')
    .eq('phone', phone)
    .maybeSingle()

  let profileId = existing?.id

  if (!profileId) {
    if (!fullName) {
      return { error: t(locale, 'auth.error.unrecognizedNumber') }
    }

    const { data: created, error } = await admin
      .from('profiles')
      .insert({ phone, full_name: fullName })
      .select('id')
      .single()

    if (error || !created) return { error: error?.message ?? t(locale, 'auth.error.couldNotCreate') }
    profileId = created.id
  }

  await createSessionCookie(profileId)
  redirect(next)
}

export async function signOut() {
  await destroySessionCookie()
  redirect('/')
}
