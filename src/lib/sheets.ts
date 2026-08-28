import { google } from 'googleapis'

// ─────────────────────────────────────────────────────────────
// Sheet layout (row 1 is the header, admin edits start at row 2):
//   A: Order ID           (join key -> orders.order_number)
//   B: Customer Name
//   C: Phone Number
//   D: GPS Coordinates    ("lat, lng", read-only display)
//   E: Items              ("2x 5-Gallon Bottle; 1x Dispenser")
//   F: Total (SAR)
//   G: Payment Type       ("Cash" | "Credit")
//   H: Status             admin-edited dropdown, see STATUS_TO_SHEET below
//   I: Proof Photo URL    admin pastes this in once delivered
//   J: Created At
// ─────────────────────────────────────────────────────────────

const SHEET_NAME = 'Orders'
const DATA_RANGE = `${SHEET_NAME}!A2:J`
const HEADER_RANGE = `${SHEET_NAME}!A1:J1`

export const HEADER_ROW = [
  'Order ID',
  'Customer Name',
  'Phone Number',
  'GPS Coordinates',
  'Items',
  'Total (SAR)',
  'Payment Type',
  'Status',
  'Proof Photo URL',
  'Created At',
]

// DB enum <-> human-readable sheet text. Keep in sync with the `status`
// check constraint on the `orders` table (see supabase/migrations/0001_init.sql).
export const STATUS_TO_SHEET: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  out_for_delivery: 'Out for Delivery',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export const SHEET_TO_STATUS: Record<string, string> = Object.fromEntries(
  Object.entries(STATUS_TO_SHEET).map(([db, sheet]) => [sheet.toLowerCase(), db])
)

function getAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const key = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n')

  if (!email || !key) {
    throw new Error('Google service account credentials are not configured')
  }

  return new google.auth.JWT({
    email,
    key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
}

function getSheetsClient() {
  return google.sheets({ version: 'v4', auth: getAuth() })
}

export type OrderForSheet = {
  orderNumber: string
  customerName: string
  customerPhone: string
  lat: number
  lng: number
  itemsSummary: string
  totalAmount: number
  paymentMethod: 'cash' | 'card'
  status: string
  createdAt: string
}

/** Ensures the header row exists (idempotent — safe to call every time). */
export async function ensureSheetHeader() {
  const sheets = getSheetsClient()
  const sheetId = process.env.GOOGLE_SHEET_ID!

  const existing = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: HEADER_RANGE,
  })

  if (!existing.data.values || existing.data.values.length === 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: HEADER_RANGE,
      valueInputOption: 'RAW',
      requestBody: { values: [HEADER_ROW] },
    })
  }
}

/** Appends a new order as a row. Returns the 1-indexed row number it landed on. */
export async function appendOrderRow(order: OrderForSheet): Promise<number> {
  const sheets = getSheetsClient()
  const sheetId = process.env.GOOGLE_SHEET_ID!

  const row = [
    order.orderNumber,
    order.customerName,
    order.customerPhone,
    `${order.lat}, ${order.lng}`,
    order.itemsSummary,
    order.totalAmount.toFixed(2),
    order.paymentMethod === 'cash' ? 'Cash' : 'Credit',
    STATUS_TO_SHEET[order.status] ?? order.status,
    '',
    order.createdAt,
  ]

  const result = await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: DATA_RANGE,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [row] },
  })

  // updatedRange looks like "Orders!A5:J5" — pull the row number out of it.
  const updatedRange = result.data.updates?.updatedRange ?? ''
  const match = updatedRange.match(/!A(\d+)/)
  return match ? parseInt(match[1], 10) : -1
}

export type SheetRowUpdate = {
  rowNumber: number
  orderId: string
  status: string | null
  proofPhotoUrl: string | null
}

/**
 * Reads every data row and returns each one's Order ID, Status, and Proof
 * Photo URL — the three columns admins actually edit. Used by the polling
 * cron job to detect and apply changes. Status is translated back to the
 * DB enum value; unrecognized text is passed through as null (ignored).
 */
export async function fetchSheetUpdates(): Promise<SheetRowUpdate[]> {
  const sheets = getSheetsClient()
  const sheetId = process.env.GOOGLE_SHEET_ID!

  const result = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: DATA_RANGE,
  })

  const rows = result.data.values ?? []

  return rows
    .map((row, index): SheetRowUpdate | null => {
      const orderId = row[0]?.trim()
      if (!orderId) return null

      const statusText = row[7]?.trim().toLowerCase() ?? ''
      const proofPhotoUrl = row[8]?.trim() || null
      const status: string | undefined = SHEET_TO_STATUS[statusText]

      return {
        rowNumber: index + 2, // +2: 1-indexed, plus the header row
        orderId,
        status: status ?? null,
        proofPhotoUrl,
      }
    })
    .filter((r): r is SheetRowUpdate => r !== null)
}
