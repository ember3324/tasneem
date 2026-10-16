const TELEGRAM_API = 'https://api.telegram.org'

export type OrderForNotification = {
  orderNumber: string
  customerName: string
  customerPhone: string
  lat: number
  lng: number
  itemsSummary: string
  totalAmount: number
  paymentMethod: 'cash' | 'card'
  addressDetails: string | null
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/** New-order alert to the shop owner's Telegram. Best-effort — never throws. */
export async function sendOrderNotification(order: OrderForNotification): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) return

  const mapsLink = `https://www.google.com/maps?q=${order.lat},${order.lng}`
  const itemLines = order.itemsSummary
    .split('; ')
    .map((line) => `• ${escapeHtml(line)}`)
    .join('\n')

  const lines = [
    `🛒 <b>New order ${escapeHtml(order.orderNumber)}</b>`,
    '',
    `<b>Customer:</b> ${escapeHtml(order.customerName)}`,
    `<b>Phone:</b> ${escapeHtml(order.customerPhone)}`,
    '',
    `<b>Items:</b>`,
    itemLines,
    '',
    `<b>Total:</b> ${order.totalAmount.toFixed(2)} SAR`,
    `<b>Payment:</b> ${order.paymentMethod === 'cash' ? 'Cash on delivery' : 'Card (online) — PAID ✅'}`,
  ]

  if (order.addressDetails) {
    lines.push(`<b>Address:</b> ${escapeHtml(order.addressDetails)}`)
  }

  lines.push('', `📍 <a href="${mapsLink}">Delivery location</a>`)

  await postMessage(token, chatId, lines.join('\n'))
}

/** Tells the owner a card payment was refunded, since the order's Sheet row says it was paid. */
export async function sendRefundNotification(refund: {
  orderNumber: string
  customerName: string
  amountSar: number
  totalSar: number
  full: boolean
}): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) return

  const lines = [
    `💸 <b>Refund ${escapeHtml(refund.orderNumber)}</b>`,
    '',
    `<b>Customer:</b> ${escapeHtml(refund.customerName)}`,
    `<b>Refunded:</b> ${refund.amountSar.toFixed(2)} of ${refund.totalSar.toFixed(2)} SAR${refund.full ? '' : ' (partial)'}`,
  ]

  await postMessage(token, chatId, lines.join('\n'))
}

async function postMessage(token: string, chatId: string, text: string) {
  await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }),
  })
}
