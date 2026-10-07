import Image from 'next/image'

/** Fixed banner at the top of the shop — the artwork carries its own
 *  wording, so nothing is laid over it and nothing crops it. */
export function HeroBanner({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative aspect-[1905/825] w-full overflow-hidden bg-gradient-to-l from-brand-100 to-brand-50">
      <Image src={src} alt={alt} fill sizes="100vw" priority className="object-cover" />
    </div>
  )
}
