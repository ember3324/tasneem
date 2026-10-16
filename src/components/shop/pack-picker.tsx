'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { addToCart } from '@/lib/actions/cart'
import { useLocale } from '@/lib/i18n/client'

export type PackOption = {
  productId: string
  /** e.g. "حزمة ٢٠ عبوة" or "١٠ حزم — ٢٠٠ عبوة" (the product's unit) */
  label: string
  price: number
}

// One product card, many pack sizes: each pack size is its own product row
// (so the cart, orders, Sheet and Telegram keep working unchanged), but the
// shop shows a single card and "add to cart" opens this text-only list.
export function PackPicker({ options, loggedIn }: { options: PackOption[]; loggedIn: boolean }) {
  const [open, setOpen] = useState(false)
  const [addedId, setAddedId] = useState<string | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [, startTransition] = useTransition()
  const router = useRouter()
  const { t } = useLocale()
  const box = useRef<HTMLDivElement>(null)

  // Close when tapping outside the list.
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [open])

  function choose(productId: string) {
    setPendingId(productId)
    startTransition(async () => {
      await addToCart(productId)
      setPendingId(null)
      setAddedId(productId)
      setTimeout(() => {
        setAddedId(null)
        setOpen(false)
      }, 1200)
    })
  }

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => {
          if (!loggedIn) {
            router.push('/login')
            return
          }
          setOpen((v) => !v)
        }}
        className="btn btn-outline px-3 py-2 text-xs"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 4h2l2.4 12.2a2 2 0 002 1.8h7.2a2 2 0 002-2L20 8H6M9 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" />
        </svg>
        {t('shop.addToCart')}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute bottom-full end-0 z-30 mb-2 w-64 overflow-hidden rounded-xl border border-ocean-100 bg-white text-start shadow-xl"
        >
          <p className="border-b border-ocean-100 px-4 py-2.5 text-xs font-bold text-neutral-500">
            {t('shop.choosePack')}
          </p>
          {options.map((o) => (
            <button
              key={o.productId}
              type="button"
              role="menuitem"
              disabled={pendingId !== null}
              onClick={() => choose(o.productId)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-sm transition hover:bg-brand-50 disabled:opacity-60"
            >
              <span className="font-bold text-neutral-800">{o.label}</span>
              <span dir="ltr" className="shrink-0 font-extrabold text-brand-700">
                {pendingId === o.productId
                  ? t('shop.adding')
                  : addedId === o.productId
                    ? t('shop.added')
                    : `${o.price.toFixed(2)} ر.س`}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
