import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentProfile } from '@/lib/profile'
import { AddToCartButton } from '@/components/shop/add-to-cart-button'
import { getLocale, t } from '@/lib/i18n/server'
import { translateCategoryName } from '@/lib/i18n/translations'
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
  const locale = await getLocale()

  return (
    <div>
      <Link
        href="/categories"
        className="mb-4 inline-flex items-center gap-1.5 rounded-lg border border-ocean-200 px-3 py-1.5 text-sm font-medium text-ocean-700 hover:border-ocean-400 hover:bg-ocean-50"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="rtl:rotate-180"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
        {t(locale, 'shop.backToCategories')}
      </Link>

      <h1 className="text-2xl font-semibold text-neutral-900">{translateCategoryName(locale, category)}</h1>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {(products ?? []).map((product) => (
          <div
            key={product.id}
            className="flex flex-col overflow-hidden rounded-lg border-2 border-ocean-300 bg-white shadow-sm transition hover:border-ocean-500"
          >
            <Link href={`/products/${product.slug}`} className="relative block aspect-square w-full bg-neutral-100">
              {product.image_url && (
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-contain"
                />
              )}
            </Link>
            <div className="flex flex-1 flex-col p-2.5">
              <Link href={`/products/${product.slug}`} className="text-sm font-medium text-neutral-900">
                {product.name}
              </Link>
              {product.unit && (
                <p className="text-xs text-neutral-500">
                  <span dir="ltr">{product.unit}</span>
                </p>
              )}
              <p className="mt-1.5 text-sm font-semibold text-neutral-900">
                <span dir="ltr">{product.price.toFixed(2)} SAR</span>
              </p>
              <div className="mt-2">
                {product.in_stock ? (
                  <AddToCartButton productId={product.id} loggedIn={!!profile} />
                ) : (
                  <span className="block text-center text-xs text-neutral-400">{t(locale, 'shop.outOfStock')}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {(!products || products.length === 0) && (
        <p className="mt-6 text-sm text-neutral-500">{t(locale, 'shop.noProducts')}</p>
      )}
    </div>
  )
}
