'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

import { heroSlides } from '@/data/landing'

/**
 * Hero slideshow matching Bubble's dynamic carosol_images carousel.
 */
export const HeroCarousel = () => {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % heroSlides.length)
    }, 5000)

    return () => window.clearInterval(timer)
  }, [])

  return (
    <section id="home" className="relative isolate min-h-[min(100svh,720px)] overflow-hidden md:min-h-[80vh]">
      {heroSlides.map((slide, index) => (
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
            src="/assets/logo.png"
            alt="Integrate Techno Trade"
            width={120}
            height={120}
            className="mb-3 h-16 w-16 rounded-full shadow-md sm:mb-4 sm:h-24 sm:w-24 md:h-28 md:w-28"
          />
          <Image
            src="/assets/wordmark.png"
            alt="Integrate Techno Trade"
            width={560}
            height={70}
            className="h-auto w-full max-w-[240px] sm:max-w-md md:max-w-lg"
          />
        </div>
        <p className="max-w-xl px-2 text-sm font-medium text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.65)] sm:text-base md:text-lg">
          {heroSlides[active]?.label}
        </p>

        <div className="mt-8 flex items-center gap-3 sm:mt-10" aria-label="Slide indicators">
          {heroSlides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              aria-label={`Go to slide ${slide.id}`}
              aria-current={index === active}
              onClick={() => setActive(index)}
              className={
                index === active
                  ? 'h-10 w-10 rounded-full bg-white text-sm font-semibold text-[#0c29ab] shadow-md sm:h-8 sm:w-8'
                  : 'h-10 w-10 rounded-full bg-white/55 text-sm font-semibold text-white shadow-sm hover:bg-white/80 sm:h-8 sm:w-8'
              }
            >
              {slide.id}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
