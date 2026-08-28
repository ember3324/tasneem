'use client'

import { Suspense, useActionState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { signUpOrLogIn } from '@/lib/actions/auth'

function SignupForm() {
  const next = useSearchParams().get('next') ?? '/'
  const [state, formAction, pending] = useActionState(signUpOrLogIn, null)

  return (
    <div>
      <h1 className="text-xl font-semibold text-neutral-900">Create your account</h1>
      <p className="mt-1 text-sm text-neutral-500">Just your name and number — no password.</p>

      <form action={formAction} className="mt-6 space-y-4">
        <input type="hidden" name="next" value={next} />

        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-neutral-700">
            Full name
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            required
            autoComplete="name"
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-neutral-700">
            Mobile number
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            placeholder="05XXXXXXXX"
            required
            autoComplete="tel"
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
          />
        </div>

        {state && 'error' in state && <p className="text-sm text-red-600">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-neutral-900 py-2.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {pending ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-500">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-neutral-900 underline">
          Log in
        </Link>
      </p>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  )
}
