'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentProfile } from '@/lib/profile'

async function requireProfile() {
  const profile = await getCurrentProfile()
  if (!profile) throw new Error('Must be logged in')
  return { admin: createAdminClient(), profile }
}

export async function addToCart(productId: string, quantity = 1) {
  const { admin, profile } = await requireProfile()

  const { data: existing } = await admin
    .from('cart_items')
    .select('id, quantity')
    .eq('user_id', profile.id)
    .eq('product_id', productId)
    .maybeSingle()

  if (existing) {
    await admin
      .from('cart_items')
      .update({ quantity: existing.quantity + quantity })
      .eq('id', existing.id)
  } else {
    await admin.from('cart_items').insert({ user_id: profile.id, product_id: productId, quantity })
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

  if (quantity <= 0) {
    await admin.from('cart_items').delete().eq('id', cartItemId).eq('user_id', profile.id)
  } else {
    await admin
      .from('cart_items')
      .update({ quantity })
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
