import Image from 'next/image'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentProfile } from '@/lib/profile'
import { AddToCartButton } from '@/components/shop/add-to-cart-button'
import { getLocale, t } from '@/lib/i18n/server'
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
  const locale = await getLocale()

  return (
    <div className="mx-auto max-w-lg overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
      {product.image_url && (
        <div className="relative aspect-square w-full bg-neutral-100">
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, 512px"
            className="object-cover"
            priority
          />
        </div>
      )}
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-neutral-900">{product.name}</h1>
        {product.unit && (
          <p className="mt-1 text-sm text-neutral-500">
            <span dir="ltr">{product.unit}</span>
          </p>
        )}
        {product.description && <p className="mt-4 text-neutral-700">{product.description}</p>}
        <p className="mt-4 text-2xl font-semibold text-neutral-900">
          <span dir="ltr">{product.price.toFixed(2)} SAR</span>
        </p>

        <div className="mt-6">
          {product.in_stock ? (
            <AddToCartButton productId={product.id} loggedIn={!!profile} />
          ) : (
            <span className="block text-center text-sm text-neutral-400">{t(locale, 'shop.outOfStock')}</span>
          )}
        </div>
      </div>
    </div>
  )
}
