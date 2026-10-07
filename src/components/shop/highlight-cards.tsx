import Image from 'next/image'
import Link from 'next/link'

export type Highlight = {
  title: string
  body: string
  ctaLabel?: string
  ctaHref?: string
  /** Card photo in /public/cards. Until one exists the card falls back to
   *  the brand gradient with its icon, so a missing file never breaks it. */
  image?: string
  icon: keyof typeof ICONS
}

const ICONS = {
  kaaba: 'M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3zm0 0v18m8-13.5L12 12 4 7.5',
  truck: 'M3 16V7a1 1 0 011-1h9v10H3zm10-7h4l3 3v4h-7V9zM7 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm10 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3z',
  shield: 'M12 3l7 4v5c0 4-3 7.4-7 9-4-1.6-7-5-7-9V7l7-4zm-3 9l2 2 4-4',
}

/** Three fixed cards under the banner — no movement, each with its own
 *  picture. The order here is the order on the page. */
export function HighlightCards({ cards }: { cards: Highlight[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {cards.map((card, i) => (
        <article
          key={card.title}
          style={{ animationDelay: `${i * 60}ms` }}
          className="surface surface-hover animate-fade-in-up flex flex-col overflow-hidden"
        >
          <div className="relative aspect-[3/2] w-full bg-gradient-to-l from-brand-600 to-brand-700">
            {card.image ? (
              <Image
                src={card.image}
                alt=""
                fill
                sizes="(max-width: 640px) 100vw, 33vw"
                className="object-cover"
              />
            ) : (
              <span className="absolute inset-0 flex items-center justify-center text-white/90">
                <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d={ICONS[card.icon]} />
                </svg>
              </span>
            )}
          </div>

          <div className="flex flex-1 flex-col gap-2 p-5">
            <h3 className="text-base font-extrabold text-brand-700">{card.title}</h3>
            <p className="flex-1 text-sm leading-relaxed text-neutral-600">{card.body}</p>
            {card.ctaLabel && card.ctaHref && (
              card.ctaHref.startsWith('http') ? (
                <a
                  href={card.ctaHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline mt-1 self-start px-4 py-2 text-xs"
                >
                  {card.ctaLabel}
                </a>
              ) : (
                <Link href={card.ctaHref} className="btn btn-outline mt-1 self-start px-4 py-2 text-xs">
                  {card.ctaLabel}
                </Link>
              )
            )}
          </div>
        </article>
      ))}
    </div>
  )
}
