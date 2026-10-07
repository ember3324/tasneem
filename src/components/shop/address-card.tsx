'use client'

import { useState, useTransition } from 'react'
import { deleteAddress } from '@/lib/actions/address'
import { useLocale } from '@/lib/i18n/client'
import type { Address } from '@/lib/types'

export function AddressCard({ address }: { address: Address }) {
  const [isPending, startTransition] = useTransition()
  const [removed, setRemoved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { t } = useLocale()

  if (removed) return null

  return (
    <div className="surface surface-hover flex items-start justify-between gap-4 p-4">
      <div className="flex min-w-0 gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 21s7-5.5 7-11a7 7 0 10-14 0c0 5.5 7 11 7 11z" />
            <circle cx="12" cy="10" r="2.5" />
          </svg>
        </span>
        <div className="min-w-0">
          <p className="text-sm font-bold text-neutral-800">{address.label}</p>
          <p className="text-sm text-neutral-500">
            {[address.address_line, address.city].filter(Boolean).join(', ')}
          </p>
          <span
            className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${
              address.in_service_area ? 'bg-brand-50 text-brand-700' : 'bg-neutral-100 text-neutral-500'
            }`}
          >
            {address.in_service_area ? t('account.withinArea') : t('account.outsideArea')}
          </span>
          {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
      </div>
      <button
        type="button"
        disabled={isPending}
        aria-label={t('cart.remove')}
        onClick={() => {
          setError(null)
          // Wait for the real result instead of hiding immediately — a
          // removal that silently fails (e.g. this address is tied to a
          // past order) must not look like it succeeded.
          startTransition(async () => {
            const result = await deleteAddress(address.id)
            if (result.error) {
              setError(result.error)
            } else {
              setRemoved(true)
            }
          })
        }}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
        </svg>
      </button>
    </div>
  )
}
