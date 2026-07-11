import Image from 'next/image'

import { aboutCopy } from '@/data/landing'

/**
 * About Us section with company copy and CEO profile from Bubble.
 */
export const AboutSection = () => {
  return (
    <section id="about" className="bg-[#f7f7f7] px-4 py-12 md:px-6 md:py-16">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start lg:gap-10">
        <div>
          <h2 className="mb-4 font-[family-name:var(--font-righteous)] text-xl text-[#1a1a1a] sm:mb-5 sm:text-2xl">
            About Us
          </h2>
          <p className="text-sm leading-relaxed text-[#1a1a1a] sm:text-base">
            {aboutCopy}
          </p>
        </div>

        <div className="flex flex-col items-center text-center">
          <div className="relative h-[280px] w-full max-w-[450px] overflow-hidden rounded-[20px] shadow-md sm:h-[340px] md:h-[380px]">
            <Image
              src="/assets/ceo.jpg"
              alt="Engr. Bijoy Prosad, CEO"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 450px"
            />
          </div>
          <p className="mt-4 font-[family-name:var(--font-righteous)] text-base text-[#1a1a1a]">
            Engr. Bijoy Prosad
          </p>
          <p className="text-sm font-bold text-[#ef2f15]">CEO</p>
        </div>
      </div>
    </section>
  )
}
