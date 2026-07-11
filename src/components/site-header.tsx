'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

import { navLinks } from '@/data/landing'
import { cn } from '@/lib/utils'

/**
 * Sticky top navigation matching the Bubble floating header.
 * Collapses to a mobile menu below the large breakpoint.
 */
export const SiteHeader = () => {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#f7f7f7] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
      <div className="flex w-full items-center justify-between gap-3 px-4 py-3 sm:gap-4 md:px-6 lg:px-10">
        <Link
          href="/#home"
          className="flex min-w-0 shrink items-center gap-2"
          aria-label="Integrate Techno Trade home"
        >
          <Image
            src="/assets/logo.png"
            alt="ITT logo"
            width={48}
            height={48}
            className="h-10 w-10 shrink-0 rounded-full object-cover md:h-12 md:w-12"
            priority
          />
          <Image
            src="/assets/wordmark.png"
            alt="Integrate Techno Trade"
            width={300}
            height={37}
            className="hidden h-7 w-auto max-w-[160px] object-contain sm:block md:h-9 md:max-w-none"
            priority
          />
        </Link>

        <nav className="ml-auto hidden items-center gap-0.5 xl:flex" aria-label="Primary">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="rounded px-2 py-2 text-sm font-medium text-[#2c3d94] transition-colors hover:text-[#000b3a] lg:px-2.5"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className="ml-auto inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-[#e6e6e6] px-3 text-sm font-medium text-[#2c3d94] xl:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? 'Close' : 'Menu'}
        </button>
      </div>

      <div
        id="mobile-nav"
        className={cn(
          'border-t border-[#f2f2f2] bg-white px-4 py-3 xl:hidden',
          open ? 'block' : 'hidden',
        )}
      >
        <nav className="flex flex-col gap-1" aria-label="Mobile">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="rounded-md px-3 py-3 text-base font-medium text-[#2c3d94]"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
