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
    <div className="flex items-start justify-between gap-4 rounded-xl border border-ocean-200 bg-white p-4 shadow-sm">
      <div className="min-w-0">
        <p className="font-medium text-neutral-900">{address.label}</p>
        <p className="text-sm text-neutral-500">{[address.address_line, address.city].filter(Boolean).join(', ')}</p>
        <p className="mt-1 text-xs text-neutral-400">
          {address.in_service_area ? t('account.withinArea') : t('account.outsideArea')}
        </p>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
      <button
        type="button"
        disabled={isPending}
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
        className="shrink-0 text-sm text-neutral-400 hover:text-red-600 disabled:opacity-50"
      >
        {t('cart.remove')}
      </button>
    </div>
  )
}
