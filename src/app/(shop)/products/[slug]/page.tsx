import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProductBySlug } from '@/lib/catalog'
import { getCurrentProfile } from '@/lib/profile'
import { AddToCartButton } from '@/components/shop/add-to-cart-button'
import { getLocale, t } from '@/lib/i18n/server'
import { translateProductName } from '@/lib/i18n/translations'

export default async function ProductPage(props: PageProps<'/products/[slug]'>) {
  const { slug } = await props.params

  const [product, profile, locale] = await Promise.all([
    getProductBySlug(slug),
    getCurrentProfile(),
    getLocale(),
  ])

  if (!product) notFound()

  const name = translateProductName(locale, product)

  return (
    <div className="mx-auto max-w-3xl">
      {/* Breadcrumb back to the grid — on a phone the browser back button
          is one tap, but on desktop there was no way back from here. */}
      <Link
        href="/categories#products"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 transition hover:text-brand-700"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M9 18l6-6-6-6" />
        </svg>
        المنتجات
      </Link>

      <div className="surface mt-4 overflow-hidden md:grid md:grid-cols-2">
        {product.image_url && (
          <div className="relative aspect-square w-full bg-gradient-to-b from-brand-50/70 to-white">
            <Image
              src={product.image_url}
              alt={name}
              fill
              sizes="(max-width: 768px) 100vw, 384px"
              className="object-contain p-4"
              priority
            />
          </div>
        )}

        <div className="flex flex-col border-t border-ocean-100 p-6 md:border-s md:border-t-0">
          <h1 className="section-title text-2xl">{name}</h1>
          {product.unit && <p className="mt-4 text-sm text-neutral-500">{product.unit}</p>}
          {product.description && (
            <p className="mt-3 text-sm leading-relaxed text-neutral-600">{product.description}</p>
          )}

          <p dir="ltr" className="mt-5 text-3xl font-extrabold text-accent-600">
            {product.price.toFixed(2)} ر.س
          </p>

          <div className="mt-6">
            {product.in_stock ? (
              <AddToCartButton productId={product.id} loggedIn={!!profile} />
            ) : (
              <span className="block rounded-xl bg-neutral-100 py-3 text-center text-sm text-neutral-400">
                {t(locale, 'shop.outOfStock')}
              </span>
            )}
          </div>

          <a
            href="https://wa.me/966590300780"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 text-center text-xs font-semibold text-brand-600 underline"
          >
            تبغى كمية كبيرة؟ راسلنا على واتساب
          </a>
        </div>
      </div>
    </div>
  )
}
