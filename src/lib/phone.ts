/**
 * Normalizes a Saudi mobile number to E.164 (+9665XXXXXXXX) for Supabase
 * phone auth. Accepts local (05xxxxxxxx), international with/without "+",
 * or with spaces/dashes.
 *
 * The site is Arabic, so numbers are often typed with Arabic-Indic digits
 * (٠٥٩٥…) or pasted with invisible bidi marks — both are normalised first,
 * otherwise a perfectly good number is rejected as invalid.
 */
export function normalizeSaudiPhone(raw: string): string | null {
  const digits = raw
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660)) // ٠-٩
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0)) // ۰-۹
    .replace(/[\s\-().‎‏‪-‮]/g, '')

  if (/^\+9665\d{8}$/.test(digits)) return digits
  if (/^9665\d{8}$/.test(digits)) return `+${digits}`
  if (/^009665\d{8}$/.test(digits)) return `+${digits.slice(2)}`
  if (/^05\d{8}$/.test(digits)) return `+966${digits.slice(1)}`
  if (/^5\d{8}$/.test(digits)) return `+966${digits}`

  return null
}
