'use client'

import { useTransition } from 'react'
import { setLocale } from '@/lib/actions/locale'
import { useLocale } from '@/lib/i18n/client'

export function LanguageToggle() {
  const { locale, t } = useLocale()
  const [isPending, startTransition] = useTransition()

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => setLocale(locale === 'en' ? 'ar' : 'en'))}
      className="rounded-lg border border-neutral-300 px-2.5 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
    >
      {t('lang.toggle')}
    </button>
  )
}
