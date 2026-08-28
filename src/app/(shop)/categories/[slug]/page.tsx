import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentProfile } from '@/lib/profile'
import { AddToCartButton } from '@/components/shop/add-to-cart-button'
import type { Category, Product } from '@/lib/types'

export default async function CategoryPage(props: PageProps<'/categories/[slug]'>) {
  const { slug } = await props.params
  const admin = createAdminClient()

  const { data: category } = await admin
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .maybeSingle<Category>()

  if (!category) notFound()

  const { data: products } = await admin
    .from('products')
    .select('*')
    .eq('category_id', category.id)
    .order('sort_order')
    .returns<Product[]>()

  const profile = await getCurrentProfile()

  return (
    <div>
      <h1 className="text-2xl font-semibold text-neutral-900">{category.name}</h1>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(products ?? []).map((product) => (
          <div
            key={product.id}
            className="flex flex-col rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"
          >
            <Link href={`/products/${product.slug}`} className="font-medium text-neutral-900">
              {product.name}
            </Link>
            {product.unit && <p className="text-xs text-neutral-500">{product.unit}</p>}
            <p className="mt-2 text-lg font-semibold text-neutral-900">
              {product.price.toFixed(2)} SAR
            </p>
            <div className="mt-3">
              {product.in_stock ? (
                <AddToCartButton productId={product.id} loggedIn={!!profile} />
              ) : (
                <span className="block text-center text-sm text-neutral-400">Out of stock</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {(!products || products.length === 0) && (
        <p className="mt-6 text-sm text-neutral-500">No products in this category yet.</p>
      )}
    </div>
  )
}
