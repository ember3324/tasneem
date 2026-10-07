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
      <div className="surface mt-6 flex flex-col items-center gap-3 p-10 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-500">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 4h2l2.4 12.2a2 2 0 002 1.8h7.2a2 2 0 002-2L20 8H6M9 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" />
          </svg>
        </span>
        <p className="text-sm text-neutral-500">{t('cart.empty')}</p>
        <Link href="/categories" className="btn btn-primary px-5 py-2.5 text-sm">
          {t('cart.startShopping')}
        </Link>
      </div>
    )
  }

  return (
    <div className="surface mt-6 p-4 sm:p-6">
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
          onQuantityChange={(quantity) => setQuantity(item.id, quantity)}
          onRemove={() => remove(item.id)}
        />
      ))}

      <div className="mt-4 flex items-center justify-between rounded-xl bg-brand-50/70 px-4 py-3">
        <span className="text-sm font-bold text-brand-700">{t('cart.total')}</span>
        <span dir="ltr" className="text-xl font-extrabold text-accent-600">
          {total.toFixed(2)} ر.س
        </span>
      </div>

      <Link href="/checkout/address" className="btn btn-primary mt-4 w-full py-3 text-sm">
        {t('cart.checkout')}
      </Link>
    </div>
  )
}
