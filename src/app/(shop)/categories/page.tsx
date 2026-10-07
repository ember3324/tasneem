import Image from 'next/image'
import Link from 'next/link'
import { getAllProducts } from '@/lib/catalog'
import { getCurrentProfile } from '@/lib/profile'
import { AddToCartButton } from '@/components/shop/add-to-cart-button'
import { HeroBanner } from '@/components/shop/hero-banner'
import { HighlightCards, type Highlight } from '@/components/shop/highlight-cards'
import { getLocale, t } from '@/lib/i18n/server'
import { translateProductName } from '@/lib/i18n/translations'

// The three cards under the banner. Each one's picture lives in
// /public/cards; drop the file in and set `image` to its path.
const HIGHLIGHTS: Highlight[] = [
  {
    title: 'نخدم ضيوف الرحمن',
    body: 'مياه من مصنعنا في مكة المكرمة، توصل للمساجد والفنادق وقاصدي الحرم على مدار السنة.',
    icon: 'kaaba',
    image: '/cards/makkah.jpg',
  },
  {
    title: 'توصيل في نفس اليوم',
    body: 'داخل مكة المكرمة خلال ٢٤ ساعة من الطلب، والتسليم موثّق بالصور عند الاستلام.',
    ctaLabel: 'اطلب الآن',
    ctaHref: '#products',
    icon: 'truck',
    image: '/cards/delivery.jpg',
  },
  {
    title: 'جودة مضمونة',
    body: 'عبوات من بلاستيك آمن غذائيًا، ومياه مطابقة للمواصفات السعودية ومراقبة في كل مرحلة من مراحل التعبئة.',
    icon: 'shield',
    image: '/cards/quality.jpg',
  },
]

export default async function ShopPage(props: PageProps<'/categories'>) {
  const searchParams = await props.searchParams
  const query = (typeof searchParams.q === 'string' ? searchParams.q : '').trim()

  const [allProducts, profile, locale] = await Promise.all([getAllProducts(), getCurrentProfile(), getLocale()])

  // Plain substring match over the name and the unit — the catalog is a
  // handful of rows, so there is nothing to gain from anything cleverer.
  // Digits are folded first, so searching "330" finds "٣٣٠ مل" and the
  // other way round.
  const foldDigits = (text: string) =>
    text.replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660)).toLowerCase()

  const needle = foldDigits(query)
  const products = needle
    ? allProducts.filter((p) => foldDigits(`${p.name} ${p.unit ?? ''}`).includes(needle))
    : allProducts

  return (
    <div className="space-y-8">
      {/* Fixed banner on top, with the three promises beside it; the moving
          offer strip sits underneath. */}
      {/* The banner is the shop's introduction — it runs the full width of
          the window, flush under the header, with nothing beside it. */}
      <div className="full-bleed -mt-6 sm:-mt-8">
        <HeroBanner src="/hero.jpeg" alt="نبع مكيون — نقاء من قلب مكة" />
      </div>

      <HighlightCards cards={HIGHLIGHTS} />

      <section id="products" className="band scroll-mt-32 lg:scroll-mt-40">
        <div className="flex items-center justify-between gap-4">
          <h1 className="section-title text-2xl sm:text-3xl">
            {query ? `نتائج البحث عن «${query}»` : t(locale, 'shop.title')}
          </h1>
          {/* Only useful while a search is narrowing the list. */}
          {query && (
            <Link href="/categories#products" className="btn btn-outline px-4 py-2 text-xs font-bold sm:text-sm">
              عرض جميع المنتجات
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </Link>
          )}
        </div>

        {/* Wrapping row rather than a fixed grid: with one or two products
            the cards stay centred instead of hugging one edge of an empty
            four-column track. */}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          {products.map((product, i) => (
            <div
              key={product.id}
              style={{ animationDelay: `${i * 40}ms` }}
              className="surface surface-hover animate-fade-in-up relative flex w-[calc(50%-0.5rem)] max-w-[320px] flex-col overflow-hidden lg:w-[calc(25%-0.75rem)]"
            >
              {/* The catalog is sorted by sort_order, so the first card is the
                  one the owner put at the top — but the badge only means
                  something when there is a line-up to lead. */}
              {i === 0 && products.length > 2 && (
                <span className="absolute start-3 top-3 z-10 rounded-full bg-accent-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
                  الأكثر طلباً
                </span>
              )}

              <Link href={`/products/${product.slug}`} className="relative block aspect-square w-full bg-white">
                {product.image_url && (
                  <Image
                    src={product.image_url}
                    alt={translateProductName(locale, product)}
                    fill
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-contain p-4"
                  />
                )}
              </Link>

              <div className="flex flex-1 flex-col gap-1 p-4 pt-0 text-center">
                <Link
                  href={`/products/${product.slug}`}
                  className="text-sm font-extrabold text-brand-700 transition hover:text-brand-500"
                >
                  {translateProductName(locale, product)}
                </Link>
                {product.unit && <span className="text-xs text-neutral-400">{product.unit}</span>}

                {/* Price and action share one row, as in the reference card. */}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <span dir="ltr" className="text-lg font-extrabold text-brand-700">
                    {product.price.toFixed(2)} ر.س
                  </span>
                  {/* Everything listed here is shown on purpose — the query
                      already filters the hidden ones out. */}
                  <AddToCartButton productId={product.id} loggedIn={!!profile} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <p className="mt-6 text-sm text-neutral-500">
            {query ? `ما لقينا منتج يطابق «${query}».` : t(locale, 'shop.noProducts')}
          </p>
        )}
      </section>

    </div>
  )
}
