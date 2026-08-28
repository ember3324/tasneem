'use client'

import { useTransition } from 'react'
import { updateCartQuantity, removeFromCart } from '@/lib/actions/cart'

export function CartLineItem({
  cartItemId,
  name,
  unit,
  price,
  quantity,
}: {
  cartItemId: string
  name: string
  unit: string | null
  price: number
  quantity: number
}) {
  const [isPending, startTransition] = useTransition()

  return (
    <div className="flex items-center justify-between gap-4 border-b border-neutral-100 py-4 last:border-0">
      <div>
        <p className="font-medium text-neutral-900">{name}</p>
        {unit && <p className="text-xs text-neutral-500">{unit}</p>}
        <p className="text-sm text-neutral-600">{price.toFixed(2)} SAR</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-lg border border-neutral-300">
          <button
            type="button"
            disabled={isPending}
            className="px-3 py-1 text-neutral-600 hover:text-neutral-900"
            onClick={() =>
              startTransition(() => updateCartQuantity(cartItemId, quantity - 1))
            }
          >
            −
          </button>
          <span className="w-8 text-center text-sm">{quantity}</span>
          <button
            type="button"
            disabled={isPending}
            className="px-3 py-1 text-neutral-600 hover:text-neutral-900"
            onClick={() =>
              startTransition(() => updateCartQuantity(cartItemId, quantity + 1))
            }
          >
            +
          </button>
        </div>

        <button
          type="button"
          disabled={isPending}
          onClick={() => startTransition(() => removeFromCart(cartItemId))}
          className="text-sm text-neutral-400 hover:text-red-600"
        >
          Remove
        </button>
      </div>
    </div>
  )
}
