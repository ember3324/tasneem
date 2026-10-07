'use client'

import { useActionState, useState, useTransition } from 'react'
import { saveProduct, deleteProduct } from '@/lib/actions/products'
import type { Product } from '@/lib/types'

const FIELD =
  'w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100'
const LABEL = 'block text-xs font-bold text-neutral-600'

/** One editable product. `product` is null for the "add new" form. */
export function ProductRow({ product }: { product: Product | null }) {
  const [state, formAction, pending] = useActionState(saveProduct, null)
  const [confirming, setConfirming] = useState(false)
  const [removing, startRemove] = useTransition()
  const [removed, setRemoved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (removed) return null

  return (
    <form action={formAction} className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <input type="hidden" name="id" value={product?.id ?? ''} />

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={LABEL} htmlFor={`name-${product?.id ?? 'new'}`}>
            الاسم المعروض
          </label>
          <input
            id={`name-${product?.id ?? 'new'}`}
            name="name"
            defaultValue={product?.name ?? ''}
            placeholder="مياه ٣٣٠ مل"
            className={`${FIELD} mt-1`}
            required
          />
        </div>

        <div>
          <label className={LABEL} htmlFor={`price-${product?.id ?? 'new'}`}>
            السعر بالريال
          </label>
          <input
            id={`price-${product?.id ?? 'new'}`}
            name="price"
            type="number"
            step="0.01"
            min="0"
            dir="ltr"
            defaultValue={product?.price ?? ''}
            placeholder="15.99"
            className={`${FIELD} mt-1`}
            required
          />
        </div>

        <div>
          <label className={LABEL} htmlFor={`unit-${product?.id ?? 'new'}`}>
            الوحدة (وش يحصل الزبون مقابل السعر)
          </label>
          <input
            id={`unit-${product?.id ?? 'new'}`}
            name="unit"
            defaultValue={product?.unit ?? ''}
            placeholder="حزمة ٢٠ عبوة"
            className={`${FIELD} mt-1`}
          />
        </div>

        <div>
          <label className={LABEL} htmlFor={`slug-${product?.id ?? 'new'}`}>
            المعرّف في الرابط (إنجليزي بدون مسافات)
          </label>
          <input
            id={`slug-${product?.id ?? 'new'}`}
            name="slug"
            dir="ltr"
            defaultValue={product?.slug ?? ''}
            placeholder="330ml"
            className={`${FIELD} mt-1`}
            required
          />
        </div>

        <div>
          <label className={LABEL} htmlFor={`image-${product?.id ?? 'new'}`}>
            مسار الصورة
          </label>
          <input
            id={`image-${product?.id ?? 'new'}`}
            name="image_url"
            dir="ltr"
            defaultValue={product?.image_url ?? ''}
            placeholder="/products/330ml.jpeg"
            className={`${FIELD} mt-1`}
          />
        </div>

        <div className="sm:col-span-2">
          <label className={LABEL} htmlFor={`desc-${product?.id ?? 'new'}`}>
            وصف مختصر (اختياري — يظهر في صفحة المنتج)
          </label>
          <textarea
            id={`desc-${product?.id ?? 'new'}`}
            name="description"
            rows={2}
            defaultValue={product?.description ?? ''}
            className={`${FIELD} mt-1`}
          />
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm font-bold text-neutral-700">
            <input
              type="checkbox"
              name="in_stock"
              defaultChecked={product?.in_stock ?? true}
              className="h-4 w-4 accent-brand-600"
            />
            متوفر للبيع
          </label>

          <label className="flex items-center gap-2 text-sm font-bold text-neutral-700">
            الترتيب
            <input
              name="sort_order"
              type="number"
              dir="ltr"
              defaultValue={product?.sort_order ?? 0}
              className="w-20 rounded-lg border border-neutral-300 px-2 py-1 text-sm"
            />
          </label>
        </div>
      </div>

      {state && 'error' in state && <p className="mt-3 text-sm text-red-600">{state.error}</p>}
      {state && 'ok' in state && <p className="mt-3 text-sm text-green-700">تم الحفظ.</p>}
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <div className="mt-4 flex items-center gap-3">
        <button type="submit" disabled={pending} className="btn btn-primary px-5 py-2 text-sm">
          {pending ? 'يحفظ...' : product ? 'حفظ التعديلات' : 'إضافة المنتج'}
        </button>

        {product &&
          (confirming ? (
            <>
              <span className="text-sm text-neutral-600">متأكد؟</span>
              <button
                type="button"
                disabled={removing}
                onClick={() => {
                  setError(null)
                  startRemove(async () => {
                    const result = await deleteProduct(product.id)
                    if (result.error) setError(result.error)
                    else setRemoved(true)
                  })
                }}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
              >
                {removing ? 'يحذف...' : 'نعم، احذفه'}
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="text-sm text-neutral-500 underline"
              >
                تراجع
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="text-sm font-semibold text-red-600 hover:underline"
            >
              حذف
            </button>
          ))}
      </div>
    </form>
  )
}
