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
      className="w-full rounded-lg bg-neutral-900 py-2 text-sm font-medium text-white disabled:opacity-50"
    >
      {isPending ? t('shop.adding') : added ? t('shop.added') : t('shop.addToCart')}
    </button>
  )
}
