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
      className="w-full rounded-md border border-ocean-400 bg-ocean-50 py-1 text-[11px] font-semibold text-ocean-700 transition hover:border-ocean-500 hover:bg-ocean-100 disabled:opacity-50"
    >
      {isPending ? t('shop.adding') : added ? t('shop.added') : t('shop.addToCart')}
    </button>
  )
}
