import Image from 'next/image'

import type { LandingContent } from '@/types/cms'

type AboutSectionProps = {
  content: Pick<
    LandingContent,
    'aboutTitle' | 'aboutCopy' | 'ceoImage' | 'ceoName' | 'ceoTitle'
  >
}

/**
 * About Us section with company copy and CEO profile.
 * @param content - CMS-driven about fields
 */
export const AboutSection = ({ content }: AboutSectionProps) => {
  return (
    <section id="about" className="bg-[#f7f7f7] px-4 py-12 md:px-6 md:py-16">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start lg:gap-10">
        <div>
          <h2 className="mb-4 font-[family-name:var(--font-righteous)] text-xl text-[#1a1a1a] sm:mb-5 sm:text-2xl">
            {content.aboutTitle}
          </h2>
          <p className="text-sm leading-relaxed text-[#1a1a1a] sm:text-base">
            {content.aboutCopy}
          </p>
        </div>

        <div className="flex flex-col items-center text-center">
          <div className="relative h-[280px] w-full max-w-[450px] overflow-hidden rounded-[20px] shadow-md sm:h-[340px] md:h-[380px]">
            <Image
              src={content.ceoImage}
              alt={`${content.ceoName}, ${content.ceoTitle}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 450px"
            />
          </div>
          <p className="mt-4 font-[family-name:var(--font-righteous)] text-base text-[#1a1a1a]">
            {content.ceoName}
          </p>
          <p className="text-sm font-bold text-[#ef2f15]">{content.ceoTitle}</p>
        </div>
      </div>
    </section>
  )
}
