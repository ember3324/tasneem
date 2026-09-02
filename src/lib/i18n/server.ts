import { translate, type Locale, type TranslationKey } from './translations'

/** The app is Arabic-only — kept as a function (not a constant) so every
 * call site that reads "the current locale" still works unchanged if a
 * second locale is ever reintroduced. */
export async function getLocale(): Promise<Locale> {
  return 'ar'
}

export function t(locale: Locale, key: TranslationKey): string {
  return translate(locale, key)
}
