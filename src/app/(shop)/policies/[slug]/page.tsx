import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { POLICIES, getPolicy, parsePolicy } from '@/lib/policies'
import { PolicyContent } from '@/components/shop/policy-content'

export function generateStaticParams() {
  return POLICIES.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata(props: PageProps<'/policies/[slug]'>): Promise<Metadata> {
  const { slug } = await props.params
  const policy = getPolicy(slug)
  return { title: policy ? `${policy.navLabel} — التسنيم المكي` : 'التسنيم المكي' }
}

export default async function PolicyPage(props: PageProps<'/policies/[slug]'>) {
  const { slug } = await props.params
  const policy = getPolicy(slug)
  if (!policy) notFound()

  const { title, updated, blocks } = parsePolicy(policy)

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-xl border-2 border-ocean-300 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-semibold text-neutral-900">{title}</h1>
        {updated && <p className="mt-1 text-xs text-neutral-500">{updated}</p>}
        <div className="mt-6">
          <PolicyContent blocks={blocks} />
        </div>
      </div>
    </div>
  )
}
