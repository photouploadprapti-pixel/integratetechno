import Image from 'next/image'

import type { ChemicalContent } from '@/types/cms'

type ChemicalBrandsProps = {
  content: Pick<ChemicalContent, 'brandsSectionTitle' | 'brands'>
}

/**
 * Brand partners section for the Chemical Division page.
 * @param content - CMS-driven brands list and title
 */
export const ChemicalBrands = ({ content }: ChemicalBrandsProps) => {
  return (
    <section id="brands" className="bg-white px-4 py-12 md:px-6 md:py-16">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-10 text-center font-[family-name:var(--font-righteous)] text-2xl text-[#1a1a1a] sm:text-3xl">
          {content.brandsSectionTitle}
        </h2>

        <div className="flex flex-col gap-12 md:gap-16">
          {content.brands.map((brand) => (
            <article
              key={brand.id}
              className="grid items-center gap-6 md:grid-cols-[220px_1fr] md:gap-10"
            >
              <div className="flex justify-center md:justify-start">
                <div className="relative flex h-[140px] w-full max-w-[220px] items-center justify-center">
                  <Image
                    src={brand.logo}
                    alt={`${brand.name} logo`}
                    width={220}
                    height={140}
                    className="max-h-[140px] w-auto object-contain"
                  />
                </div>
              </div>
              <p className="text-base leading-relaxed text-[#1a1a1a] sm:text-lg">
                {brand.description}{' '}
                <span className="font-medium">{brand.highlight}</span>
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
