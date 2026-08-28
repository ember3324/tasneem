import { cookies } from 'next/headers'
import { DEFAULT_LOCALE, LOCALES, translate, type Locale, type TranslationKey } from './translations'

export const LOCALE_COOKIE = 'locale'

/** Reads the current locale from the cookie — use in Server Components and Server Actions. */
export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies()
  const value = cookieStore.get(LOCALE_COOKIE)?.value
  return LOCALES.includes(value as Locale) ? (value as Locale) : DEFAULT_LOCALE
}

export function t(locale: Locale, key: TranslationKey): string {
  return translate(locale, key)
}
