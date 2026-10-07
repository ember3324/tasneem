/** Wordmark: the name, the brand swoosh, and the latin line underneath.
 *  Swap this for the real logo file once it exists. */
export function BrandMark({ className = '' }: { className?: string }) {
  return (
    <span className={`flex flex-col items-center leading-none ${className}`}>
      <span className="text-xl font-extrabold tracking-tight text-brand-700 sm:text-2xl">نبع مكيون</span>
      <svg viewBox="0 0 120 14" className="mt-0.5 h-3 w-24" aria-hidden="true">
        <path
          d="M2 9C18 2 34 12 52 8s32-9 48-3"
          fill="none"
          stroke="#f0801d"
          strokeWidth="3.4"
          strokeLinecap="round"
        />
      </svg>
      <span className="mt-0.5 text-[9px] font-bold tracking-[0.28em] text-brand-700 sm:text-[10px]">
        NABAA MAKKIYOON
      </span>
    </span>
  )
}
