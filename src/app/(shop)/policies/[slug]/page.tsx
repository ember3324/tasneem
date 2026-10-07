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
  return { title: policy ? `${policy.navLabel} — نبع مكيون` : 'نبع مكيون' }
}

export default async function PolicyPage(props: PageProps<'/policies/[slug]'>) {
  const { slug } = await props.params
  const policy = getPolicy(slug)
  if (!policy) notFound()

  const { title, updated, blocks } = parsePolicy(policy)

  return (
    <div className="mx-auto max-w-2xl">
      <div className="surface p-6 sm:p-8">
        <h1 className="section-title text-2xl">{title}</h1>
        {updated && <p className="mt-4 text-xs text-neutral-500">{updated}</p>}
        <div className="mt-6">
          <PolicyContent blocks={blocks} />
        </div>
      </div>
    </div>
  )
}
