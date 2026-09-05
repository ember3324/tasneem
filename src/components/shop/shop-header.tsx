import Link from 'next/link'

export function ShopHeader() {
  return (
    <header
      className="border-b border-ocean-200 backdrop-blur-md"
      style={{
        // Background image at 30% strength (i.e. 70% transparent) over a
        // solid white base, so the decorative pattern shows through faintly
        // without ever letting scrolled page content bleed through.
        backgroundColor: '#ffffff',
        backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.7)), url(/headerbg.jpeg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-center px-4 py-4">
        <Link href="/categories" className="text-lg font-semibold text-ocean-700">
          التسنيم المكي
        </Link>
      </div>
    </header>
  )
}
