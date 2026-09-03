import { unstable_cache } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Product } from '@/lib/types'

// Catalog data (products) changes rarely — admin edits happen via one-off
// scripts, not live traffic — so it's safe to cache for a couple of minutes
// instead of hitting Supabase on every single page view. Cart, profile, and
// order data stay uncached since those change constantly and are
// user-specific.

// The shop lists every product directly with no category-picking step, so
// this pulls everything in one flat, sort_order-ranked list rather than
// scoping to a category.
export const getAllProducts = unstable_cache(
  async (): Promise<Product[]> => {
    const admin = createAdminClient()
    const { data } = await admin.from('products').select('*').order('sort_order').returns<Product[]>()
    return data ?? []
  },
  ['all-products'],
  { revalidate: 120 }
)

export const getProductBySlug = unstable_cache(
  async (slug: string): Promise<Product | null> => {
    const admin = createAdminClient()
    const { data } = await admin.from('products').select('*').eq('slug', slug).maybeSingle<Product>()
    return data ?? null
  },
  ['product-by-slug'],
  { revalidate: 120 }
)
