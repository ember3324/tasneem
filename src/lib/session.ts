import { createHmac, timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'

// Lightweight MVP auth: a phone number + name is enough to get an account —
// no password, no SMS/OTP verification. That means anyone who knows (or
// guesses) a phone number can "log in" as that account; there is no proof
// the phone actually belongs to them. Acceptable trade-off for an MVP, but
// revisit before handling anything more sensitive than water bottle orders.
//
// Sessions are a signed cookie (profileId + HMAC-SHA256), verified with
// SESSION_SECRET. Proxy defaults to the Node.js runtime in Next.js 16
// (see AGENTS.md), so Node's `crypto` module works fine here.

const COOKIE_NAME = 'session'
const MAX_AGE_SECONDS = 60 * 60 * 24 * 180 // 180 days

function requireSecret(): string {
  const secret = process.env.SESSION_SECRET
  if (!secret) throw new Error('Missing SESSION_SECRET — see .env.example')
  return secret
}

export function signSession(profileId: string): string {
  const sig = createHmac('sha256', requireSecret()).update(profileId).digest('hex')
  return `${profileId}.${sig}`
}

export function verifySessionCookie(cookieValue: string): string | null {
  const [profileId, sig] = cookieValue.split('.')
  if (!profileId || !sig) return null

  const expected = createHmac('sha256', requireSecret()).update(profileId).digest('hex')
  const sigBuf = Buffer.from(sig)
  const expectedBuf = Buffer.from(expected)
  if (sigBuf.length !== expectedBuf.length) return null

  return timingSafeEqual(sigBuf, expectedBuf) ? profileId : null
}

export async function createSessionCookie(profileId: string) {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, signSession(profileId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE_SECONDS,
  })
}

export async function destroySessionCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

/** Reads and verifies the session cookie server-side. Returns the profile id, or null. */
export async function getSessionProfileId(): Promise<string | null> {
  const cookieStore = await cookies()
  const raw = cookieStore.get(COOKIE_NAME)?.value
  if (!raw) return null
  return verifySessionCookie(raw)
}
