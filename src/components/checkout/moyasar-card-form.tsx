'use client'

import { useEffect, useRef, useState } from 'react'

const MOYASAR_JS_URL = 'https://cdn.moyasar.com/mpf/1.15.0/moyasar.js'
const MOYASAR_CSS_URL = 'https://cdn.moyasar.com/mpf/1.15.0/moyasar.css'

// Temporary Apple Pay diagnostics. Apple Pay only runs in Safari on an Apple
// device, and when merchant validation fails the sheet closes with no error
// anywhere — not in the page, not in the Moyasar dashboard. These hooks print
// the real reason on screen so it can be read off the phone directly.
// Remove this block (and the banner below) once Apple Pay works.
const APPLE_PAY_DEBUG = true

declare global {
  interface Window {
    Moyasar?: {
      init: (options: Record<string, unknown>) => void
    }
    ApplePaySession?: {
      canMakePayments: () => boolean
      supportsVersion: (v: number) => boolean
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
  const [diag, setDiag] = useState<string[]>([])

  useEffect(() => {
    if (!APPLE_PAY_DEBUG) return
    const add = (line: string) =>
      setDiag((prev) => (prev.includes(line) ? prev : [...prev, line]))

    let host = '-'
    try {
      host = window.location.host
    } catch {}
    const ap = window.ApplePaySession
    add(
      `host=${host} · ApplePaySession=${ap ? 'yes' : 'no'}` +
        (ap ? ` · canMakePayments=${(() => { try { return String(ap.canMakePayments()) } catch (e) { return 'threw:' + String(e) } })()}` : ''),
    )

    const isValidate = (url: string) => /applepay|apple_pay|initiate/i.test(url)

    // --- fetch
    const realFetch = window.fetch
    window.fetch = async function (...args: Parameters<typeof fetch>) {
      const url = typeof args[0] === 'string' ? args[0] : String((args[0] as Request)?.url ?? '')
      try {
        const res = await realFetch(...args)
        if (isValidate(url) && !res.ok) {
          const body = await res.clone().text()
          add(`validate ${res.status}: ${body.slice(0, 300)}`)
        }
        return res
      } catch (e) {
        if (isValidate(url)) add(`validate network error: ${String(e)}`)
        throw e
      }
    } as typeof window.fetch

    // --- XMLHttpRequest (older mpf builds use this)
    const realOpen = XMLHttpRequest.prototype.open
    const realSend = XMLHttpRequest.prototype.send
    XMLHttpRequest.prototype.open = function (
      this: XMLHttpRequest & { __url?: string },
      method: string,
      url: string | URL,
      ...rest: unknown[]
    ) {
      this.__url = String(url)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (realOpen as any).call(this, method, url, ...rest)
    } as typeof XMLHttpRequest.prototype.open
    XMLHttpRequest.prototype.send = function (
      this: XMLHttpRequest & { __url?: string },
      ...rest: unknown[]
    ) {
      const u = this.__url || ''
      if (isValidate(u)) {
        this.addEventListener('load', () => {
          if (this.status >= 400) add(`validate ${this.status}: ${String(this.responseText).slice(0, 300)}`)
        })
        this.addEventListener('error', () => add(`validate network error on ${u}`))
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (realSend as any).apply(this, rest)
    } as typeof XMLHttpRequest.prototype.send

    const onErr = (e: ErrorEvent) => add(`js error: ${e.message}`)
    const onRej = (e: PromiseRejectionEvent) => add(`rejected: ${String(e.reason).slice(0, 300)}`)
    window.addEventListener('error', onErr)
    window.addEventListener('unhandledrejection', onRej)

    return () => {
      window.fetch = realFetch
      XMLHttpRequest.prototype.open = realOpen
      XMLHttpRequest.prototype.send = realSend
      window.removeEventListener('error', onErr)
      window.removeEventListener('unhandledrejection', onRej)
    }
  }, [])

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
        // Apple Pay only renders on devices/browsers that support it; everyone
        // else just sees the card form.
        methods: ['applepay', 'creditcard'],
        supported_networks: ['visa', 'mastercard', 'mada'],
        // moyasar.js has no default for this: leaving it out makes the form
        // refuse to render at all with "Validate Merchat URL is required for
        // Apple Pay", which also hides the card form. It must stay.
        apple_pay: {
          country: 'SA',
          label: 'نبع مكيون',
          validate_merchant_url: 'https://api.moyasar.com/v1/applepay/initiate',
        },
        metadata: { order_number: orderNumber },
        on_completed: async function (payment: { id: string }) {
          try {
            await fetch('/api/payments/link', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderNumber, moyasarPaymentId: payment.id }),
            })
          } finally {
            // Apple Pay (and a card with no 3-D Secure step) never goes through
            // callback_url, so send the customer there ourselves: it re-verifies
            // the payment with Moyasar and marks the order paid before they land
            // on the order page, instead of leaving it to the webhook's timing.
            const callback = new URL('/api/payments/callback', window.location.origin)
            callback.searchParams.set('order', orderNumber)
            callback.searchParams.set('id', payment.id)
            window.location.href = callback.toString()
          }
        },
      })
    }

    init()
    return () => {
      cancelled = true
    }
  }, [orderNumber, amountSar, publishableKey])

  return (
    <>
      <div ref={containerRef} className="mysr-form" />
      {APPLE_PAY_DEBUG && diag.length > 0 && (
        <pre
          dir="ltr"
          className="mt-4 max-h-60 overflow-auto rounded-lg bg-neutral-100 p-3 text-[11px] leading-relaxed whitespace-pre-wrap text-neutral-700"
        >
          {diag.join('\n')}
        </pre>
      )}
    </>
  )
}
