import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentProfile } from '@/lib/profile'
import { AddToCartButton } from '@/components/shop/add-to-cart-button'
import type { Product } from '@/lib/types'

export default async function ProductPage(props: PageProps<'/products/[slug]'>) {
  const { slug } = await props.params
  const admin = createAdminClient()

  const { data: product } = await admin
    .from('products')
    .select('*')
    .eq('slug', slug)
    .maybeSingle<Product>()

  if (!product) notFound()

  const profile = await getCurrentProfile()

  return (
    <div className="mx-auto max-w-lg rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-neutral-900">{product.name}</h1>
      {product.unit && <p className="mt-1 text-sm text-neutral-500">{product.unit}</p>}
      {product.description && <p className="mt-4 text-neutral-700">{product.description}</p>}
      <p className="mt-4 text-2xl font-semibold text-neutral-900">
        {product.price.toFixed(2)} SAR
      </p>

      <div className="mt-6">
        {product.in_stock ? (
          <AddToCartButton productId={product.id} loggedIn={!!profile} />
        ) : (
          <span className="block text-center text-sm text-neutral-400">Out of stock</span>
        )}
      </div>
    </div>
  )
}
