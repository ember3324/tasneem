'use client'

import { useTransition } from 'react'
import { deleteAddress } from '@/lib/actions/address'
import { useLocale } from '@/lib/i18n/client'

export function RemoveAddressButton({ addressId }: { addressId: string }) {
  const [isPending, startTransition] = useTransition()
  const { t } = useLocale()

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => deleteAddress(addressId))}
      className="text-sm text-neutral-400 hover:text-red-600 disabled:opacity-50"
    >
      {t('cart.remove')}
    </button>
  )
}
