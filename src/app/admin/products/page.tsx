import { createAdminClient } from '@/lib/supabase/admin'
import { ProductRow } from '@/components/admin/product-row'
import type { Product } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function AdminProductsPage() {
  // Admin gating already happened in the admin layout.
  const admin = createAdminClient()
  const { data: products } = await admin
    .from('products')
    .select('*')
    .order('sort_order')
    .returns<Product[]>()

  return (
    <div className="space-y-8" dir="rtl">
      <section>
        <h1 className="text-xl font-bold text-neutral-900">المنتجات والأسعار</h1>
        <p className="mt-1 text-sm text-neutral-500">
          أي تعديل هنا يظهر في المتجر مباشرة. السعر هو سعر الوحدة الواحدة (الحزمة).
        </p>
      </section>

      <section className="space-y-4">
        {(products ?? []).map((product) => (
          <ProductRow key={product.id} product={product} />
        ))}
        {(!products || products.length === 0) && (
          <p className="text-sm text-neutral-500">ما فيه منتجات — أضف واحد من الأسفل.</p>
        )}
      </section>

      <section>
        <h2 className="text-lg font-bold text-neutral-900">إضافة منتج جديد</h2>
        <div className="mt-3">
          <ProductRow product={null} />
        </div>
      </section>
    </div>
  )
}
