import Link from 'next/link'

export function ShopHeader() {
  return (
    <header className="border-b border-ocean-200 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-center px-4 py-4">
        <Link href="/categories" className="text-lg font-semibold text-ocean-700">
          التسنيم المكي
        </Link>
      </div>
    </header>
  )
}
