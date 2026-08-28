/**
 * Normalizes a Saudi mobile number to E.164 (+9665XXXXXXXX) for Supabase
 * phone auth. Accepts local (05xxxxxxxx), international with/without "+",
 * or with spaces/dashes.
 */
export function normalizeSaudiPhone(raw: string): string | null {
  const digits = raw.replace(/[\s-]/g, '')

  if (/^\+9665\d{8}$/.test(digits)) return digits
  if (/^9665\d{8}$/.test(digits)) return `+${digits}`
  if (/^05\d{8}$/.test(digits)) return `+966${digits.slice(1)}`
  if (/^5\d{8}$/.test(digits)) return `+966${digits}`

  return null
}
