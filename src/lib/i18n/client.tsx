'use client'

import { createContext, useContext, useMemo } from 'react'
import { translate, type Locale, type TranslationKey } from './translations'

type LocaleContextValue = {
  locale: Locale
  t: (key: TranslationKey) => string
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

/** Seeded with the server-detected locale (see root layout) so client components can translate. */
export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale
  children: React.ReactNode
}) {
  const value = useMemo<LocaleContextValue>(
    () => ({ locale, t: (key: TranslationKey) => translate(locale, key) }),
    [locale]
  )
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used within a LocaleProvider')
  return ctx
}
