'use client'

import { Suspense, useActionState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { signUpOrLogIn } from '@/lib/actions/auth'
import { useLocale } from '@/lib/i18n/client'

function LoginForm() {
  const next = useSearchParams().get('next') ?? '/'
  const [state, formAction, pending] = useActionState(signUpOrLogIn, null)
  const { t } = useLocale()

  return (
    <div>
      <h1 className="section-title text-xl">{t('auth.login.title')}</h1>
      <p className="mt-3 text-sm text-neutral-500">{t('auth.login.subtitle')}</p>

      <form action={formAction} className="mt-6 space-y-4">
        <input type="hidden" name="next" value={next} />

        <div>
          <label htmlFor="phone" className="field-label">
            {t('auth.mobileNumber')}
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            placeholder="05XXXXXXXX"
            required
            autoComplete="tel"
            className="field"
          />
        </div>

        {state && 'error' in state && <p className="text-sm text-red-600">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="btn btn-primary w-full py-3 text-sm"
        >
          {pending ? t('auth.login.submitting') : t('auth.login.submit')}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-500">
        {t('auth.login.newHere')}{' '}
        <Link href="/signup" className="font-semibold text-brand-600 underline">
          {t('auth.login.createAccount')}
        </Link>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}
