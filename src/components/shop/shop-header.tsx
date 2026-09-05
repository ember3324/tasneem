import Link from 'next/link'

export function ShopHeader() {
  return (
    <header
      className="border-b border-ocean-200 backdrop-blur-md"
      style={{
        // Background image at ~60% strength over a solid white base, so
        // the decorative pattern reads as an actual visible color instead
        // of a faint wash, while the base still stops scrolled content
        // from ever bleeding through.
        backgroundColor: '#ffffff',
        backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.4)), url(/headerbg.jpeg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-center px-4 py-4">
        <Link href="/categories" className="text-xl font-bold text-brand-700">
          التسنيم المكي
        </Link>
      </div>
    </header>
  )
}
