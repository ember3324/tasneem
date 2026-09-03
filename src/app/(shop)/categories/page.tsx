import Image from 'next/image'
import Link from 'next/link'
import { getAllProducts } from '@/lib/catalog'
import { getCurrentProfile } from '@/lib/profile'
import { AddToCartButton } from '@/components/shop/add-to-cart-button'
import { getLocale, t } from '@/lib/i18n/server'
import { translateProductName } from '@/lib/i18n/translations'

export default async function ShopPage() {
  const [products, profile, locale] = await Promise.all([getAllProducts(), getCurrentProfile(), getLocale()])

  return (
    <div>
      <h1 className="text-2xl font-semibold text-neutral-900">{t(locale, 'shop.title')}</h1>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="flex flex-col overflow-hidden rounded-lg border-2 border-ocean-300 bg-white shadow-sm transition hover:border-ocean-500"
          >
            <Link href={`/products/${product.slug}`} className="relative block aspect-square w-full bg-neutral-100">
              {product.image_url && (
                <Image
                  src={product.image_url}
                  alt={translateProductName(locale, product)}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-contain"
                />
              )}
            </Link>
            <div className="flex flex-1 flex-col p-2.5">
              <Link href={`/products/${product.slug}`} className="text-sm font-medium text-neutral-900">
                {translateProductName(locale, product)}
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

      {products.length === 0 && (
        <p className="mt-6 text-sm text-neutral-500">{t(locale, 'shop.noProducts')}</p>
      )}
    </div>
  )
}
