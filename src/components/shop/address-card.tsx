'use client'

import { useState, useTransition } from 'react'
import { deleteAddress } from '@/lib/actions/address'
import { useLocale } from '@/lib/i18n/client'
import type { Address } from '@/lib/types'

export function AddressCard({ address }: { address: Address }) {
  const [isPending, startTransition] = useTransition()
  const [removed, setRemoved] = useState(false)
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
      </div>
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          // Hide immediately rather than waiting for the round-trip + revalidation.
          setRemoved(true)
          startTransition(() => deleteAddress(address.id))
        }}
        className="text-sm text-neutral-400 hover:text-red-600 disabled:opacity-50"
      >
        {t('cart.remove')}
      </button>
    </div>
  )
}
