'use server'

import { randomUUID } from 'crypto'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentProfile } from '@/lib/profile'
import { isWithinServiceArea, type ServiceZone } from '@/lib/geo'
import { appendOrderRow, ensureSheetHeader } from '@/lib/sheets'
import { getLocale, t } from '@/lib/i18n/server'
import type { Address, PaymentMethod, Product } from '@/lib/types'

function generateOrderNumber() {
  return `WB-${randomUUID().slice(0, 8).toUpperCase()}`
}

export async function createOrder(
  _prevState: { error: string } | null | undefined,
  formData: FormData
): Promise<{ error: string } | undefined> {
  const locale = await getLocale()
  const addressId = String(formData.get('addressId') ?? '')
  const paymentMethod = String(formData.get('paymentMethod') ?? '') as PaymentMethod

  if (!addressId) return { error: t(locale, 'checkout.error.missingAddress') }
  if (paymentMethod !== 'cash' && paymentMethod !== 'card') {
    return { error: t(locale, 'checkout.error.choosePayment') }
  }

  const profile = await getCurrentProfile()
  if (!profile) return { error: t(locale, 'checkout.error.mustBeLoggedIn') }

  const admin = createAdminClient()

  const { data: address } = await admin
    .from('addresses')
    .select('*')
    .eq('id', addressId)
    .eq('user_id', profile.id)
    .maybeSingle<Address>()
  if (!address) return { error: t(locale, 'checkout.error.addressNotFound') }

  // Re-verify against current zones — the address may have been saved a
  // while ago, or zones may have changed since.
  const { data: zones } = await admin
    .from('service_zones')
    .select('id, name, polygon, active')
    .eq('active', true)
    .returns<ServiceZone[]>()
  if (!isWithinServiceArea(address.lat, address.lng, zones ?? [])) {
    return { error: t(locale, 'checkout.error.outsideArea') }
  }

  type CartRow = { id: string; quantity: number; product: Product }
  const { data: cartItems } = await admin
    .from('cart_items')
    .select('id, quantity, product:products(*)')
    .eq('user_id', profile.id)
    .returns<CartRow[]>()

  if (!cartItems || cartItems.length === 0) {
    return { error: t(locale, 'checkout.error.emptyCart') }
  }

  const totalAmount = cartItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
  const itemsSummary = cartItems.map((i) => `${i.quantity}x ${i.product.name}`).join('; ')

  const orderNumber = generateOrderNumber()

  const { data: order, error: orderError } = await admin
    .from('orders')
    .insert({
      order_number: orderNumber,
      user_id: profile.id,
      address_id: address.id,
      customer_name: profile.full_name,
      customer_phone: profile.phone,
      lat: address.lat,
      lng: address.lng,
      items_summary: itemsSummary,
      total_amount: totalAmount,
      payment_method: paymentMethod,
      payment_status: paymentMethod === 'cash' ? 'cod_pending' : 'pending',
    })
    .select('id, order_number, created_at')
    .single()

  if (orderError || !order) {
    return { error: orderError?.message ?? t(locale, 'checkout.error.couldNotCreate') }
  }

  await admin.from('order_items').insert(
    cartItems.map((i) => ({
      order_id: order.id,
      product_id: i.product.id,
      product_name: i.product.name,
      unit_price: i.product.price,
      quantity: i.quantity,
      line_total: i.product.price * i.quantity,
    }))
  )

  await admin.from('cart_items').delete().eq('user_id', profile.id)

  // Best-effort: the order already exists in our DB regardless of whether
  // the sheet write succeeds. A missing sheet row just means the periodic
  // sync job has nothing to reconcile yet — it won't block checkout.
  try {
    await ensureSheetHeader()
    const rowNumber = await appendOrderRow({
      orderNumber: order.order_number,
      customerName: profile.full_name,
      customerPhone: profile.phone,
      lat: address.lat,
      lng: address.lng,
      itemsSummary,
      totalAmount,
      paymentMethod,
      status: 'pending',
      createdAt: order.created_at,
      addressDetails: address.address_line,
    })
    await admin
      .from('orders')
      .update({ sheet_row_number: rowNumber, sheet_synced_at: new Date().toISOString() })
      .eq('id', order.id)
  } catch (err) {
    console.error('Failed to append order to Google Sheet', err)
  }

  if (paymentMethod === 'cash') {
    redirect(`/orders/${order.order_number}`)
  } else {
    redirect(`/checkout/pay/${order.order_number}`)
  }
}
