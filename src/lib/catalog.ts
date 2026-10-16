import { unstable_cache } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Product } from '@/lib/types'

// Catalog data (products) changes rarely — admin edits happen via one-off
// scripts, not live traffic — so it's safe to cache for a couple of minutes
// instead of hitting Supabase on every single page view. Cart, profile, and
// order data stay uncached since those change constantly and are
// user-specific.

// The shop lists every product directly with no category-picking step, so
// this pulls one flat, sort_order-ranked list rather than scoping to a
// category. Only products marked as shown appear: a product that is tied to
// past orders cannot be deleted (the order history points at it), so
// unticking it in the admin page is how it leaves the shop.
export const getAllProducts = unstable_cache(
  async (): Promise<Product[]> => {
    const admin = createAdminClient()
    const { data } = await admin
      .from('products')
      .select('*')
      .eq('in_stock', true)
      .order('sort_order')
      .returns<Product[]>()
    return data ?? []
  },
  ['all-products'],
  // Tagged so an admin edit can drop the cache immediately instead of
  // leaving the shop two minutes behind.
  { revalidate: 120, tags: ['products'] }
)

export const getProductBySlug = unstable_cache(
  async (slug: string): Promise<Product | null> => {
    const admin = createAdminClient()
    const { data } = await admin.from('products').select('*').eq('slug', slug).maybeSingle<Product>()
    return data ?? null
  },
  ['product-by-slug'],
  { revalidate: 120, tags: ['products'] }
)

// Pack sizes of the same item are separate product rows whose slugs share a
// stem: "330ml" (one pack), "330ml-10", "330ml-25"… The shop shows one card per
// stem (the lowest sort_order row — its picture, name and price) and lists the
// pack sizes as text in the add-to-cart picker.
export function slugStem(slug: string): string {
  return slug.replace(/-\d+$/, '')
}

export type ProductGroup = { main: Product; packs: Product[] }

export function groupProducts(products: Product[]): ProductGroup[] {
  const groups = new Map<string, ProductGroup>()
  for (const p of products) {
    const stem = slugStem(p.slug)
    const g = groups.get(stem)
    if (g) g.packs.push(p)
    else groups.set(stem, { main: p, packs: [p] })
  }
  return [...groups.values()]
}
