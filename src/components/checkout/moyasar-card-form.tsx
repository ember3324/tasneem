'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

const MOYASAR_JS_URL = 'https://cdn.moyasar.com/mpf/1.15.0/moyasar.js'
const MOYASAR_CSS_URL = 'https://cdn.moyasar.com/mpf/1.15.0/moyasar.css'

// See src/lib/moyasar.ts for the overall payment flow and why the
// /api/payments/link call right after on_completed matters.
declare global {
  interface Window {
    Moyasar?: {
      init: (options: Record<string, unknown>) => void
    }
  }
}

export function MoyasarCardForm({
  orderNumber,
  amountSar,
  publishableKey,
}: {
  orderNumber: string
  amountSar: number
  publishableKey: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    let cancelled = false

    function loadScript(src: string) {
      return new Promise<void>((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve()
        const script = document.createElement('script')
        script.src = src
        script.onload = () => resolve()
        script.onerror = () => reject(new Error(`Failed to load ${src}`))
        document.head.appendChild(script)
      })
    }

    function loadStyle(href: string) {
      if (document.querySelector(`link[href="${href}"]`)) return
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = href
      document.head.appendChild(link)
    }

    async function init() {
      loadStyle(MOYASAR_CSS_URL)
      await loadScript(MOYASAR_JS_URL)
      if (cancelled || !window.Moyasar || !containerRef.current) return

      window.Moyasar.init({
        element: '.mysr-form',
        amount: Math.round(amountSar * 100),
        currency: 'SAR',
        description: `Order ${orderNumber}`,
        publishable_api_key: publishableKey,
        callback_url: `${window.location.origin}/api/payments/callback?order=${orderNumber}`,
        methods: ['creditcard'],
        metadata: { order_number: orderNumber },
        on_completed: async function (payment: { id: string }) {
          try {
            await fetch('/api/payments/link', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderNumber, moyasarPaymentId: payment.id }),
            })
          } finally {
            router.push(`/orders/${orderNumber}`)
          }
        },
      })
    }

    init()
    return () => {
      cancelled = true
    }
  }, [orderNumber, amountSar, publishableKey, router])

  return <div ref={containerRef} className="mysr-form" />
}
