'use client'

import Link from 'next/link'
import { useOptimistic, useTransition } from 'react'
import { updateCartQuantity, removeFromCart } from '@/lib/actions/cart'
import { useLocale } from '@/lib/i18n/client'
import { translateProductName } from '@/lib/i18n/translations'
import { CartLineItem } from './cart-line-item'
import type { Product } from '@/lib/types'

type CartRow = { id: string; quantity: number; product: Product }

type OptimisticAction = { type: 'quantity'; id: string; quantity: number } | { type: 'remove'; id: string }

function applyOptimisticAction(state: CartRow[], action: OptimisticAction): CartRow[] {
  if (action.type === 'remove' || action.quantity <= 0) {
    return state.filter((item) => item.id !== action.id)
  }
  return state.map((item) => (item.id === action.id ? { ...item, quantity: action.quantity } : item))
}

// Cart quantity/remove clicks used to sit and wait for a full server
// round-trip before anything on screen changed, which read as sluggish —
// useOptimistic updates the list (and the total) immediately, then
// reconciles with the server action's result in the background.
export function CartItems({ items }: { items: CartRow[] }) {
  const [optimisticItems, applyOptimistic] = useOptimistic(items, applyOptimisticAction)
  const [, startTransition] = useTransition()
  const { locale, t } = useLocale()

  const total = optimisticItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  function setQuantity(id: string, quantity: number) {
    startTransition(async () => {
      applyOptimistic({ type: 'quantity', id, quantity })
      await updateCartQuantity(id, quantity)
    })
  }

  function remove(id: string) {
    startTransition(async () => {
      applyOptimistic({ type: 'remove', id })
      await removeFromCart(id)
    })
  }

  if (optimisticItems.length === 0) {
    return (
      <p className="mt-6 text-sm text-neutral-500">
        {t('cart.empty')}{' '}
        <Link href="/categories" className="underline">
          {t('cart.startShopping')}
        </Link>
        .
      </p>
    )
  }

  return (
    <div className="mt-6 rounded-xl border-2 border-ocean-300 bg-white p-4 shadow-sm">
      {optimisticItems.map((item) => (
        <CartLineItem
          key={item.id}
          name={translateProductName(locale, item.product)}
          unit={item.product.unit}
          price={item.product.price}
          quantity={item.quantity}
          imageUrl={item.product.image_url}
          onIncrement={() => setQuantity(item.id, item.quantity + 1)}
          onDecrement={() => setQuantity(item.id, item.quantity - 1)}
          onRemove={() => remove(item.id)}
        />
      ))}

      <div className="mt-4 flex items-center justify-between border-t border-neutral-200 pt-4">
        <span className="font-medium text-neutral-900">{t('cart.total')}</span>
        <span dir="ltr" className="text-lg font-semibold text-neutral-900">
          {total.toFixed(2)} SAR
        </span>
      </div>

      <Link
        href="/checkout/address"
        className="mt-4 block w-full rounded-lg border border-ocean-400 bg-white py-2.5 text-center text-sm font-semibold text-ocean-700 transition hover:border-ocean-500 hover:bg-ocean-50"
      >
        {t('cart.checkout')}
      </Link>
    </div>
  )
}
