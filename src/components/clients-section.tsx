'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

import { clients } from '@/data/landing'

/**
 * Returns how many client logos should show based on viewport width.
 * @returns Visible logo count for the current breakpoint
 */
const getVisibleCount = () => {
  if (typeof window === 'undefined') return 1
  if (window.innerWidth < 640) return 1
  if (window.innerWidth < 1024) return 2
  return 3
}

/**
 * Clients logo carousel matching Bubble's slick slideshow.
 * Adapts visible logo count for mobile, tablet, and desktop.
 */
export const ClientsSection = () => {
  const [active, setActive] = useState(0)
  const [visibleCount, setVisibleCount] = useState(1)
  const maxIndex = Math.max(0, clients.length - visibleCount)

  useEffect(() => {
    const updateVisibleCount = () => {
      setVisibleCount(getVisibleCount())
    }

    updateVisibleCount()
    window.addEventListener('resize', updateVisibleCount)
    return () => window.removeEventListener('resize', updateVisibleCount)
  }, [])

  useEffect(() => {
    setActive((current) => Math.min(current, maxIndex))
  }, [maxIndex])

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((current) => (current >= maxIndex ? 0 : current + 1))
    }, 4000)

    return () => window.clearInterval(timer)
  }, [maxIndex])

  const slideWidth = 100 / visibleCount

  return (
    <section id="clients" className="bg-[#f7f7f7] px-4 py-12 md:px-6 md:py-16">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-6 text-center font-[family-name:var(--font-righteous)] text-xl text-[#1a1a1a] sm:text-2xl md:mb-8">
          Our Respected Clients
        </h2>

        <div className="overflow-hidden rounded-[20px] bg-white p-4 shadow-sm sm:p-6 md:p-10">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${active * slideWidth}%)` }}
          >
            {clients.map((client) => (
              <div
                key={client.id}
                className="flex shrink-0 flex-col items-center justify-center px-3 sm:px-4"
                style={{ width: `${slideWidth}%` }}
              >
                <div className="relative h-28 w-28 sm:h-36 sm:w-36 md:h-40 md:w-40">
                  <Image
                    src={client.image}
                    alt={client.name}
                    fill
                    className="rounded-[20px] object-contain"
                    sizes="(max-width: 640px) 112px, 160px"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
