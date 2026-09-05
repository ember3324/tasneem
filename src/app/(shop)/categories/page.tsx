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
      <p className="mt-1 text-sm text-neutral-500">اختر الكمية المناسبة لاحتياجك</p>

      <div className="mt-6 grid grid-cols-2 gap-4">
        {products.map((product, i) => (
          <div
            key={product.id}
            style={{ animationDelay: `${i * 40}ms` }}
            className="flex animate-fade-in-up flex-col overflow-hidden rounded-xl bg-white shadow-md transition duration-200 hover:-translate-y-0.5 hover:shadow-lg"
          >
            <Link href={`/products/${product.slug}`} className="relative block aspect-square w-full bg-neutral-100">
              {product.image_url && (
                <Image
                  src={product.image_url}
                  alt={translateProductName(locale, product)}
                  fill
                  sizes="(max-width: 640px) 50vw, 40vw"
                  className="object-contain"
                />
              )}
            </Link>
            <div className="flex flex-1 flex-col items-center gap-1.5 p-3 text-center">
              <Link href={`/products/${product.slug}`} className="text-sm font-semibold text-neutral-800">
                مياه 330 مل
              </Link>
              {product.unit && (
                <span className="inline-flex items-center gap-1 text-sm text-neutral-500">
                  {product.unit}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 8l-9-5-9 5 9 5 9-5zM3 8v8l9 5 9-5V8M12 13v8" />
                  </svg>
                </span>
              )}
              <span dir="ltr" className="text-lg font-bold text-neutral-900">
                {product.price.toFixed(2)} SAR
              </span>
              <div className="mt-1 w-full">
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
