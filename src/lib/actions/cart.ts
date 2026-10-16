'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentProfile } from '@/lib/profile'

// Same cap the cart UI applies (cart-line-item.tsx). Server actions are
// callable with any arguments, so the limit has to hold here too — an
// unbounded quantity would produce an absurd total and, at the far end, an
// amount Moyasar rejects.
const MAX_QUANTITY = 99999

function sanitizeQuantity(quantity: number): number {
  return Number.isFinite(quantity) ? Math.min(Math.floor(quantity), MAX_QUANTITY) : 0
}

async function requireProfile() {
  const profile = await getCurrentProfile()
  if (!profile) throw new Error('Must be logged in')
  return { admin: createAdminClient(), profile }
}

export async function addToCart(productId: string, quantity = 1) {
  const { admin, profile } = await requireProfile()

  const amount = sanitizeQuantity(quantity)
  if (amount <= 0) return

  // Only products that are actually on sale can be added; the shop hides
  // out-of-stock ones, but the action can be called with any id.
  const { data: product } = await admin
    .from('products')
    .select('id')
    .eq('id', productId)
    .eq('in_stock', true)
    .maybeSingle()
  if (!product) return

  const { data: existing } = await admin
    .from('cart_items')
    .select('id, quantity')
    .eq('user_id', profile.id)
    .eq('product_id', productId)
    .maybeSingle()

  if (existing) {
    await admin
      .from('cart_items')
      .update({ quantity: Math.min(existing.quantity + amount, MAX_QUANTITY) })
      .eq('id', existing.id)
  } else {
    await admin.from('cart_items').insert({ user_id: profile.id, product_id: productId, quantity: amount })
  }

  revalidatePath('/cart')
  revalidatePath('/categories', 'layout')
}

// Using the service-role client bypasses RLS entirely, so ownership must be
// checked explicitly here — scoping every mutation to `user_id: profile.id`
// stops a logged-in customer from tampering with another customer's cart
// item by guessing its id.
export async function updateCartQuantity(cartItemId: string, quantity: number) {
  const { admin, profile } = await requireProfile()

  const amount = sanitizeQuantity(quantity)
  if (amount <= 0) {
    await admin.from('cart_items').delete().eq('id', cartItemId).eq('user_id', profile.id)
  } else {
    await admin
      .from('cart_items')
      .update({ quantity: amount })
      .eq('id', cartItemId)
      .eq('user_id', profile.id)
  }

  revalidatePath('/cart')
}

export async function removeFromCart(cartItemId: string) {
  const { admin, profile } = await requireProfile()
  await admin.from('cart_items').delete().eq('id', cartItemId).eq('user_id', profile.id)
  revalidatePath('/cart')
}
