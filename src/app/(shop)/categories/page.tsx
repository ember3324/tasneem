import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Category } from '@/lib/types'

export default async function CategoriesPage() {
  const admin = createAdminClient()
  const { data: categories } = await admin
    .from('categories')
    .select('*')
    .order('sort_order')
    .returns<Category[]>()

  return (
    <div>
      <h1 className="text-2xl font-semibold text-neutral-900">Shop by category</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {(categories ?? []).map((category) => (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            className="flex aspect-square flex-col items-center justify-center rounded-xl border border-neutral-200 bg-white p-4 text-center shadow-sm transition hover:border-neutral-400"
          >
            <span className="font-medium text-neutral-900">{category.name}</span>
          </Link>
        ))}
      </div>

      {(!categories || categories.length === 0) && (
        <p className="mt-6 text-sm text-neutral-500">No categories yet.</p>
      )}
    </div>
  )
}
