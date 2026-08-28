import { unstable_cache } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Category, Product } from '@/lib/types'

// Catalog data (categories/products) changes rarely — admin edits happen via
// one-off scripts, not live traffic — so it's safe to cache for a couple of
// minutes instead of hitting Supabase on every single page view. Cart,
// profile, and order data stay uncached since those change constantly and
// are user-specific.

export const getCategories = unstable_cache(
  async (): Promise<Category[]> => {
    const admin = createAdminClient()
    const { data } = await admin.from('categories').select('*').order('sort_order').returns<Category[]>()
    return data ?? []
  },
  ['categories-list'],
  { revalidate: 120 }
)

export const getCategoryBySlug = unstable_cache(
  async (slug: string): Promise<Category | null> => {
    const admin = createAdminClient()
    const { data } = await admin.from('categories').select('*').eq('slug', slug).maybeSingle<Category>()
    return data ?? null
  },
  ['category-by-slug'],
  { revalidate: 120 }
)

export const getProductsByCategoryId = unstable_cache(
  async (categoryId: string): Promise<Product[]> => {
    const admin = createAdminClient()
    const { data } = await admin
      .from('products')
      .select('*')
      .eq('category_id', categoryId)
      .order('sort_order')
      .returns<Product[]>()
    return data ?? []
  },
  ['products-by-category'],
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
