import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { fetchSheetUpdates } from '@/lib/sheets'

// Pulls admin edits (Status, Proof Photo URL) from the Google Sheet into the
// `orders` table. Trigger this on a schedule — see SETUP.md for why native
// Vercel Cron (Hobby plan) can't run more than once/day, and how to trigger
// this endpoint every 1-2 minutes instead via a free external scheduler.
//
// Auth: accepts either Vercel Cron's own `Authorization: Bearer <CRON_SECRET>`
// header, or `?secret=<CRON_SECRET>` for external schedulers that can't set
// custom headers.
function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false

  const authHeader = request.headers.get('authorization')
  if (authHeader === `Bearer ${secret}`) return true

  const url = new URL(request.url)
  return url.searchParams.get('secret') === secret
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  const updates = await fetchSheetUpdates()

  let changed = 0
  for (const update of updates) {
    const { data: order } = await admin
      .from('orders')
      .select('id, status, proof_photo_url')
      .eq('order_number', update.orderId)
      .maybeSingle()

    if (!order) continue

    const patch: Record<string, string> = {}
    if (update.status && update.status !== order.status) patch.status = update.status
    if (update.proofPhotoUrl && update.proofPhotoUrl !== order.proof_photo_url) {
      patch.proof_photo_url = update.proofPhotoUrl
    }

    if (Object.keys(patch).length > 0) {
      await admin.from('orders').update(patch).eq('id', order.id)
      changed++
    }
  }

  return NextResponse.json({ ok: true, rowsRead: updates.length, ordersUpdated: changed })
}
