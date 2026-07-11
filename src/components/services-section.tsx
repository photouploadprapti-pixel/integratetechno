import Image from 'next/image'
import Link from 'next/link'

import { brochureUrl, services } from '@/data/landing'

/**
 * Services grid — Bubble uses a 3-column repeating group of products.
 */
export const ServicesSection = () => {
  return (
    <section id="services" className="bg-white px-4 py-12 md:px-6 md:py-16">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-6 text-center font-[family-name:var(--font-righteous)] text-xl text-[#1a1a1a] sm:text-2xl md:mb-8">
          Our Services
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {services.map((service) => (
            <article
              key={service.id}
              className="overflow-hidden rounded-md border border-[#e6e6e6] bg-white"
            >
              <div className="relative h-44 w-full bg-white sm:h-52">
                <Image
                  src={service.image}
                  alt={service.name}
                  fill
                  className="object-contain p-3"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
                />
              </div>
              <div className="px-3 py-3 text-center sm:px-4">
                <h3 className="text-sm font-medium leading-snug text-[#2c3d94] sm:text-base">
                  {service.name}
                </h3>
                <p className="mt-1 text-xs text-[#525252] sm:text-sm">
                  Company: {service.company}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 flex justify-center md:mt-10">
          <Link
            href={brochureUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 w-full max-w-xs items-center justify-center rounded-[20px] bg-[#0c29ab] px-6 text-base font-medium text-white transition-opacity hover:opacity-90 sm:w-auto"
          >
            Download Brochure
          </Link>
        </div>
      </div>
    </section>
  )
}
