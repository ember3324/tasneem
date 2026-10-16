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
        // React Strict Mode (dev) runs this effect twice: the second run finds
        // the tag from the first run, which may not have finished loading yet.
        // Resolving immediately there left window.Moyasar undefined and the
        // form silently never rendered — so wait for the existing tag instead.
        let script = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`)
        if (script && window.Moyasar) return resolve()
        if (!script) {
          script = document.createElement('script')
          script.src = src
          document.head.appendChild(script)
        }
        script.addEventListener('load', () => resolve())
        script.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)))
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
