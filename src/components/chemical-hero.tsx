'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils'
import type { ChemicalContent } from '@/types/cms'

type ChemicalHeroProps = {
  content: Pick<ChemicalContent, 'heroTitle' | 'brandsCtaLabel' | 'heroSlides'>
}

/**
 * Full-bleed hero carousel for Chemical Division (Raw Materials + Brands CTA).
 * @param content - CMS-driven hero fields
 */
export const ChemicalHero = ({ content }: ChemicalHeroProps) => {
  const [active, setActive] = useState(0)
  const slides = content.heroSlides

  useEffect(() => {
    if (slides.length === 0) return
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length)
    }, 5000)

    return () => window.clearInterval(timer)
  }, [slides.length])

  /**
   * Moves the carousel by a relative offset.
   * @param delta - Steps to move (negative = previous)
   */
  const move = (delta: number) => {
    setActive((current) => {
      const next = current + delta
      if (next < 0) return slides.length - 1
      if (next >= slides.length) return 0
      return next
    })
  }

  return (
    <section id="intro" className="relative isolate min-h-[min(70svh,560px)] overflow-hidden md:min-h-[70vh]">
      {slides.map((slide, index) => (
        <Image
          key={slide.id}
          src={slide.image}
          alt=""
          fill
          priority={index === 0}
          className={cn(
            'object-cover transition-opacity duration-700',
            index === active ? 'opacity-100' : 'opacity-0',
          )}
          sizes="100vw"
        />
      ))}

      <div
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,30,124,0.55)_0%,rgba(12,41,171,0.35)_45%,rgba(0,0,0,0.45)_100%)]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex min-h-[min(70svh,560px)] max-w-6xl flex-col items-center justify-center px-4 py-16 text-center md:min-h-[70vh] md:px-6">
        <h1 className="font-[family-name:var(--font-righteous)] text-4xl text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)] sm:text-5xl md:text-6xl">
          {content.heroTitle}
        </h1>
        <a
          href="#brands"
          className="mt-8 inline-flex min-h-11 items-center justify-center rounded-[20px] bg-[#0c29ab] px-8 text-base font-medium text-white transition-opacity hover:opacity-90"
        >
          {content.brandsCtaLabel}
        </a>
      </div>

      {slides.length > 1 ? (
        <>
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => move(-1)}
            className="absolute left-3 top-1/2 z-20 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-2xl text-[#0c29ab] shadow-md transition-opacity hover:opacity-100 sm:left-6"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => move(1)}
            className="absolute right-3 top-1/2 z-20 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-2xl text-[#0c29ab] shadow-md transition-opacity hover:opacity-100 sm:right-6"
          >
            ›
          </button>
        </>
      ) : null}
    </section>
  )
}
