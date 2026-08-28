'use client'

import Image from 'next/image'
import { useLocale } from '@/lib/i18n/client'

export function CartLineItem({
  name,
  unit,
  price,
  quantity,
  imageUrl,
  onIncrement,
  onDecrement,
  onRemove,
}: {
  name: string
  unit: string | null
  price: number
  quantity: number
  imageUrl: string | null
  onIncrement: () => void
  onDecrement: () => void
  onRemove: () => void
}) {
  const { t } = useLocale()

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-100 py-4 last:border-0">
      <div className="flex min-w-0 items-center gap-3">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
          {imageUrl && <Image src={imageUrl} alt={name} fill sizes="56px" className="object-contain" />}
        </div>
        <div className="min-w-0">
          <p className="truncate font-medium text-neutral-900">{name}</p>
          {unit && (
            <p className="text-xs text-neutral-500">
              <span dir="ltr">{unit}</span>
            </p>
          )}
          <p className="text-sm text-neutral-600">
            <span dir="ltr">{price.toFixed(2)} SAR</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-lg border border-neutral-300">
          <button type="button" className="px-3 py-1 text-neutral-600 hover:text-neutral-900" onClick={onDecrement}>
            −
          </button>
          <span className="w-8 text-center text-sm">{quantity}</span>
          <button type="button" className="px-3 py-1 text-neutral-600 hover:text-neutral-900" onClick={onIncrement}>
            +
          </button>
        </div>

        <button type="button" onClick={onRemove} className="text-sm text-neutral-400 hover:text-red-600">
          {t('cart.remove')}
        </button>
      </div>
    </div>
  )
}
