'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useLocale } from '@/lib/i18n/client'

const MAX_QUANTITY = 99999

export function CartLineItem({
  name,
  unit,
  price,
  quantity,
  imageUrl,
  onIncrement,
  onDecrement,
  onQuantityChange,
  onRemove,
}: {
  name: string
  unit: string | null
  price: number
  quantity: number
  imageUrl: string | null
  onIncrement: () => void
  onDecrement: () => void
  onQuantityChange: (quantity: number) => void
  onRemove: () => void
}) {
  const { t } = useLocale()

  // Local draft so the input can hold whatever the user is mid-typing
  // (e.g. "" while clearing the field to type "50") without the quantity
  // prop stomping it on every keystroke. Only commits — and syncs back
  // from props — once the field isn't focused.
  const [draft, setDraft] = useState(String(quantity))
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    if (!editing) setDraft(String(quantity))
  }, [quantity, editing])

  function commit() {
    setEditing(false)
    const parsed = Math.floor(Number(draft))
    const next = Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed, MAX_QUANTITY) : quantity
    setDraft(String(next))
    if (next !== quantity) onQuantityChange(next)
  }

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
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            dir="ltr"
            value={draft}
            onFocus={() => setEditing(true)}
            onChange={(e) => setDraft(e.target.value.replace(/[^0-9]/g, ''))}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                e.currentTarget.blur()
              }
            }}
            className="w-14 rounded bg-transparent text-center text-sm focus:outline-none focus:ring-1 focus:ring-ocean-400"
          />
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
