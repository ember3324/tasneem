// Moyasar integration (https://docs.moyasar.com). KSA payment gateway:
// mada, credit cards, Apple Pay, STC Pay.
//
// Flow used in this app:
//   1. Checkout page renders Moyasar's hosted card form (Moyasar.init, see
//      src/components/checkout/moyasar-card-form.tsx) for the order total.
//      Moyasar creates the payment directly from the browser — our server
//      never touches raw card data (keeps us out of PCI scope).
//   2. The moment `on_completed(payment)` fires client-side, the browser
//      calls POST /api/payments/link (see that route) to store
//      `moyasar_payment_id` on the order right away.
//   3. GET /api/payments/callback (Moyasar's callback_url) re-verifies the
//      payment server-side before confirming — never trust redirect query
//      params alone.
//   4. POST /api/payments/webhook is the authoritative, async confirmation
//      (fires even if the customer closes the tab mid-3DS-redirect).
//
// Known gap: Moyasar.init()'s exact support for a `metadata` passthrough
// isn't confirmed in the public docs at time of writing — step 2 above is
// what actually guarantees the order<->payment link; treat metadata as a
// best-effort extra, not the source of truth. Verify against a live
// Moyasar test account once you have one.

const MOYASAR_API_BASE = 'https://api.moyasar.com/v1'

export type MoyasarPayment = {
  id: string
  status: 'initiated' | 'paid' | 'failed' | 'authorized' | 'captured' | 'refunded' | 'voided'
  amount: number
  currency: string
  description: string | null
  metadata: Record<string, string> | null
}

function authHeader() {
  const secretKey = process.env.MOYASAR_SECRET_KEY
  if (!secretKey) throw new Error('MOYASAR_SECRET_KEY is not configured')
  // Basic auth: secret key as username, empty password.
  return 'Basic ' + Buffer.from(`${secretKey}:`).toString('base64')
}

/** Fetches a payment by id directly from Moyasar — the only source of truth for its status. */
export async function fetchMoyasarPayment(paymentId: string): Promise<MoyasarPayment> {
  const res = await fetch(`${MOYASAR_API_BASE}/payments/${paymentId}`, {
    headers: { Authorization: authHeader() },
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error(`Moyasar payment lookup failed: ${res.status} ${await res.text()}`)
  }

  return res.json()
}

/**
 * Verifies a webhook delivery. Moyasar webhooks carry a `secret_token`
 * field in the JSON body matching the `shared_secret` you set when creating
 * the webhook (POST /v1/webhooks) — this is a direct string compare, not an
 * HMAC signature. See https://docs.moyasar.com/api/other/webhooks/.
 */
export function isValidMoyasarWebhook(body: { secret_token?: string }): boolean {
  const expected = process.env.MOYASAR_WEBHOOK_SECRET
  if (!expected || !body.secret_token) return false
  return timingSafeEqual(body.secret_token, expected)
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}

/** SAR amounts are stored in the DB as decimal riyals; Moyasar wants halalas (integer, x100). */
export function toHalalas(sar: number): number {
  return Math.round(sar * 100)
}
