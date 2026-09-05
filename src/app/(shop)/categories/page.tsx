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

      <div className="mt-6 grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-5">
        {products.map((product, i) => (
          <div
            key={product.id}
            style={{ animationDelay: `${i * 40}ms` }}
            className="flex animate-fade-in-up flex-col overflow-hidden rounded-lg border-2 border-ocean-300 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-ocean-500 hover:shadow-md"
          >
            <Link href={`/products/${product.slug}`} className="relative block aspect-square w-full bg-neutral-100">
              {product.image_url && (
                <Image
                  src={product.image_url}
                  alt={translateProductName(locale, product)}
                  fill
                  sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 20vw"
                  className="object-contain"
                />
              )}
            </Link>
            <div className="flex flex-1 flex-col gap-1.5 p-2">
              <Link
                href={`/products/${product.slug}`}
                className="rounded-md bg-ocean-50 px-1.5 py-1 text-center text-xs font-semibold text-neutral-900"
              >
                {translateProductName(locale, product)}
              </Link>
              <div className="flex gap-1.5">
                {product.unit && (
                  <span className="flex-1 rounded-md bg-neutral-50 px-1 py-1 text-center text-[11px] text-neutral-600">
                    {product.unit}
                  </span>
                )}
                <span dir="ltr" className="flex-1 rounded-md bg-neutral-50 px-1 py-1 text-center text-[11px] font-semibold text-neutral-900">
                  {product.price.toFixed(2)} SAR
                </span>
              </div>
              <div className="mt-auto">
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
