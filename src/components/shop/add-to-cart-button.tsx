'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { addToCart } from '@/lib/actions/cart'
import { useLocale } from '@/lib/i18n/client'

export function AddToCartButton({ productId, loggedIn }: { productId: string; loggedIn: boolean }) {
  const [isPending, startTransition] = useTransition()
  const [added, setAdded] = useState(false)
  const router = useRouter()
  const { t } = useLocale()

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!loggedIn) {
          router.push('/login')
          return
        }
        startTransition(async () => {
          await addToCart(productId)
          setAdded(true)
          setTimeout(() => setAdded(false), 1500)
        })
      }}
      className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand-600 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-50"
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 4h2l2.4 12.2a2 2 0 002 1.8h7.2a2 2 0 002-2L20 8H6M9 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" />
      </svg>
      {isPending ? t('shop.adding') : added ? t('shop.added') : t('shop.addToCart')}
    </button>
  )
}
