'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useLocale } from '@/lib/i18n/client'

const MAX_QUANTITY = 99999

const STEP_BUTTON =
  'flex h-8 w-8 items-center justify-center text-base font-bold text-brand-600 transition hover:bg-brand-50'

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
  // from props — once the field isn't focused. Synced during render (the
  // React-recommended way to adjust state from a changed prop) rather than
  // in an effect, which would cause an extra render pass on every change.
  const [draft, setDraft] = useState(String(quantity))
  const [editing, setEditing] = useState(false)
  const [prevQuantity, setPrevQuantity] = useState(quantity)

  if (quantity !== prevQuantity) {
    setPrevQuantity(quantity)
    if (!editing) setDraft(String(quantity))
  }

  function commit() {
    setEditing(false)
    const parsed = Math.floor(Number(draft))
    const next = Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed, MAX_QUANTITY) : quantity
    setDraft(String(next))
    if (next !== quantity) onQuantityChange(next)
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ocean-100 py-4 last:border-0">
      <div className="flex min-w-0 items-center gap-3">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-ocean-100 bg-gradient-to-b from-brand-50/60 to-white">
          {imageUrl && <Image src={imageUrl} alt={name} fill sizes="64px" className="object-contain p-1.5" />}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-neutral-800">{name}</p>
          {unit && <p className="text-xs text-neutral-500">{unit}</p>}
          <p dir="ltr" className="mt-0.5 text-sm font-semibold text-accent-600">
            {price.toFixed(2)} ر.س
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center overflow-hidden rounded-xl border border-ocean-200 bg-white">
          <button type="button" aria-label="−" className={STEP_BUTTON} onClick={onDecrement}>
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
            className="w-12 border-x border-ocean-100 bg-transparent py-1.5 text-center text-sm font-semibold focus:outline-none"
          />
          <button type="button" aria-label="+" className={STEP_BUTTON} onClick={onIncrement}>
            +
          </button>
        </div>

        <button
          type="button"
          onClick={onRemove}
          aria-label={t('cart.remove')}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-red-50 hover:text-red-600"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
          </svg>
        </button>
      </div>
    </div>
  )
}
