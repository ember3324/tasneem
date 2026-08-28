'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { LOCALE_COOKIE } from '@/lib/i18n/server'
import type { Locale } from '@/lib/i18n/translations'

export async function setLocale(locale: Locale) {
  const cookieStore = await cookies()
  cookieStore.set(LOCALE_COOKIE, locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  })
  // The root layout reads this cookie to pick the locale for every Server
  // Component — revalidate everything so the switch takes effect immediately.
  revalidatePath('/', 'layout')
}
