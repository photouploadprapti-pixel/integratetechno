'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

import type { LandingContent } from '@/types/cms'

type HeroCarouselProps = {
  content: Pick<LandingContent, 'heroSlides' | 'logoUrl' | 'wordmarkUrl' | 'brandName'>
}

/**
 * Hero slideshow matching Bubble's dynamic carosol_images carousel.
 * @param content - CMS-driven slides and brand assets
 */
export const HeroCarousel = ({ content }: HeroCarouselProps) => {
  const [active, setActive] = useState(0)
  const slides = content.heroSlides

  useEffect(() => {
    if (slides.length === 0) return
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length)
    }, 5000)

    return () => window.clearInterval(timer)
  }, [slides.length])

  useEffect(() => {
    setActive((current) => Math.min(current, Math.max(0, slides.length - 1)))
  }, [slides.length])

  if (slides.length === 0) {
    return <section id="home" className="min-h-[40vh] bg-[#0c29ab]" />
  }

  return (
    <section id="home" className="relative isolate min-h-[min(100svh,720px)] overflow-hidden md:min-h-[80vh]">
      {slides.map((slide, index) => (
        <Image
          key={slide.id}
          src={slide.image}
          alt=""
          fill
          priority={index === 0}
          className={
            index === active
              ? 'object-cover opacity-100 transition-opacity duration-700'
              : 'object-cover opacity-0 transition-opacity duration-700'
          }
          sizes="100vw"
        />
      ))}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.45)_0%,rgba(0,0,0,0.35)_40%,rgba(255,255,255,0.75)_100%)]" />

      <div className="relative mx-auto flex min-h-[min(100svh,720px)] max-w-6xl flex-col items-center justify-center px-4 py-16 text-center sm:py-20 md:min-h-[80vh] md:px-6 md:py-24">
        <div className="mb-5 flex w-full max-w-xl flex-col items-center rounded-[24px] bg-white/92 px-4 py-5 shadow-[0_12px_40px_rgba(0,0,0,0.28)] backdrop-blur-md sm:rounded-[28px] sm:px-6 sm:py-7 md:mb-6 md:px-10 md:py-8">
          <Image
            src={content.logoUrl}
            alt={content.brandName}
            width={120}
            height={120}
            className="mb-3 h-16 w-16 rounded-full shadow-md sm:mb-4 sm:h-24 sm:w-24 md:h-28 md:w-28"
          />
          <Image
            src={content.wordmarkUrl}
            alt={content.brandName}
            width={560}
            height={70}
            className="h-auto w-full max-w-[240px] sm:max-w-md md:max-w-lg"
          />
        </div>
        <p className="max-w-xl px-2 text-sm font-medium text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.65)] sm:text-base md:text-lg">
          {slides[active]?.label}
        </p>

        <div className="mt-8 flex items-center gap-3 sm:mt-10" aria-label="Slide indicators">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === active}
              onClick={() => setActive(index)}
              className={
                index === active
                  ? 'h-10 w-10 rounded-full bg-white text-sm font-semibold text-[#0c29ab] shadow-md sm:h-8 sm:w-8'
                  : 'h-10 w-10 rounded-full bg-white/55 text-sm font-semibold text-white shadow-sm hover:bg-white/80 sm:h-8 sm:w-8'
              }
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
