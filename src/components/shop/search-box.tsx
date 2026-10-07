'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

/** Filters the product grid. Submitting goes to the shop page with ?q=,
 *  which the page reads server-side — so the result is a real, shareable
 *  URL rather than client-only state. */
export function SearchBox({ className = '' }: { className?: string }) {
  const router = useRouter()
  const initial = useSearchParams().get('q') ?? ''
  const [value, setValue] = useState(initial)

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault()
        const q = value.trim()
        router.push(q ? `/categories?q=${encodeURIComponent(q)}#products` : '/categories#products')
      }}
      className={`relative ${className}`}
    >
      <label htmlFor="shop-search" className="sr-only">
        ابحث عن منتج
      </label>
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 start-4 my-auto text-brand-600"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3.5-3.5" />
      </svg>
      <input
        id="shop-search"
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="ابحث عن منتج ..."
        className="w-full rounded-full border border-ocean-100 bg-ocean-50 py-2.5 pe-4 ps-12 text-sm text-neutral-700 transition placeholder:text-neutral-400 focus:border-brand-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
      />
    </form>
  )
}
