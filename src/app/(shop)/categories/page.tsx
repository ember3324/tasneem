import Link from 'next/link'
import { getCategories } from '@/lib/catalog'
import { getLocale, t } from '@/lib/i18n/server'
import { translateCategoryName } from '@/lib/i18n/translations'

export default async function CategoriesPage() {
  const [categories, locale] = await Promise.all([getCategories(), getLocale()])

  return (
    <div>
      <h1 className="text-2xl font-semibold text-neutral-900">{t(locale, 'shop.byCategory')}</h1>

      <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            className="flex aspect-square flex-col items-center justify-center rounded-lg border border-ocean-200 bg-white p-2.5 text-center shadow-sm transition hover:border-ocean-400 hover:bg-ocean-50"
          >
            <span className="text-xs font-medium text-neutral-900 sm:text-sm">
              {translateCategoryName(locale, category)}
            </span>
          </Link>
        ))}
      </div>

      {categories.length === 0 && (
        <p className="mt-6 text-sm text-neutral-500">{t(locale, 'shop.noCategories')}</p>
      )}
    </div>
  )
}
