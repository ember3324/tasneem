'use server'

import { revalidatePath, updateTag } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentProfile } from '@/lib/profile'

export type ProductInput = {
  name: string
  slug: string
  unit: string
  price: number
  in_stock: boolean
  sort_order: number
  image_url: string
  description: string
}

async function requireAdmin() {
  const profile = await getCurrentProfile()
  if (!profile) throw new Error('Not logged in')
  if (!profile.is_admin) throw new Error('Not an admin')
}

/** The shop caches the catalog for two minutes (see lib/catalog.ts); an edit
 *  has to clear that or the change looks like it did not save. */
function refreshShop() {
  updateTag('products')
  revalidatePath('/categories')
  revalidatePath('/admin/products')
}

function parse(formData: FormData): ProductInput {
  const str = (k: string) => String(formData.get(k) ?? '').trim()
  const price = Number(str('price'))
  const sort = Number(str('sort_order'))

  return {
    name: str('name'),
    slug: str('slug').toLowerCase().replace(/\s+/g, '-'),
    unit: str('unit'),
    price: Number.isFinite(price) && price >= 0 ? price : 0,
    in_stock: formData.get('in_stock') === 'on',
    sort_order: Number.isFinite(sort) ? sort : 0,
    image_url: str('image_url'),
    description: str('description'),
  }
}

export async function saveProduct(
  _prev: { error: string } | { ok: true } | null,
  formData: FormData
): Promise<{ error: string } | { ok: true }> {
  await requireAdmin()

  const id = String(formData.get('id') ?? '')
  const values = parse(formData)

  if (!values.name) return { error: 'الاسم مطلوب' }
  if (!values.slug) return { error: 'المعرّف (slug) مطلوب' }

  const admin = createAdminClient()
  const row = {
    name: values.name,
    slug: values.slug,
    unit: values.unit || null,
    price: values.price,
    in_stock: values.in_stock,
    sort_order: values.sort_order,
    image_url: values.image_url || null,
    description: values.description || null,
  }

  const { error } = id
    ? await admin.from('products').update(row).eq('id', id)
    : await admin.from('products').insert(row)

  if (error) return { error: error.message }

  refreshShop()
  return { ok: true }
}

export async function deleteProduct(id: string): Promise<{ error?: string }> {
  await requireAdmin()
  const admin = createAdminClient()
  const { error } = await admin.from('products').delete().eq('id', id)
  if (error) return { error: error.message }
  refreshShop()
  return {}
}
