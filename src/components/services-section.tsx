'use client'

import Image from 'next/image'
import { useEffect, useId, useState } from 'react'

import { ContactForm } from '@/components/contact-form'
import type { LandingContent } from '@/types/cms'

type ServicesSectionProps = {
  content: Pick<
    LandingContent,
    | 'servicesTitle'
    | 'services'
    | 'brochureUrl'
    | 'brochureButtonLabel'
    | 'brochureModalTitle'
    | 'brochureModalHint'
    | 'contactEmail'
  >
}

/**
 * Services grid with a gated Download Brochure button (contact form required).
 * @param content - CMS-driven services and brochure fields
 */
export const ServicesSection = ({ content }: ServicesSectionProps) => {
  const [isContactOpen, setIsContactOpen] = useState(false)
  const titleId = useId()

  useEffect(() => {
    if (!isContactOpen) return

    /**
     * Closes the contact popup when Escape is pressed.
     * @param event - Keyboard event
     */
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsContactOpen(false)
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [isContactOpen])

  /**
   * Opens the brochure after the visitor submits the contact form.
   */
  const handleContactSuccess = () => {
    window.open(content.brochureUrl, '_blank', 'noopener,noreferrer')
    setIsContactOpen(false)
  }

  return (
    <section id="services" className="bg-white px-4 py-12 md:px-6 md:py-16">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-6 text-center font-[family-name:var(--font-righteous)] text-xl text-[#1a1a1a] sm:text-2xl md:mb-8">
          {content.servicesTitle}
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {content.services.map((service) => (
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
          <button
            type="button"
            onClick={() => setIsContactOpen(true)}
            className="inline-flex min-h-11 w-full max-w-xs items-center justify-center rounded-[20px] bg-[#0c29ab] px-6 text-base font-medium text-white transition-opacity hover:opacity-90 sm:w-auto"
          >
            {content.brochureButtonLabel}
          </button>
        </div>
      </div>

      {isContactOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          role="presentation"
          onClick={() => setIsContactOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[20px] border border-[#e6e6e6] bg-white p-4 shadow-xl sm:p-6 md:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2
                  id={titleId}
                  className="font-[family-name:var(--font-righteous)] text-xl text-[#1a1a1a] sm:text-2xl"
                >
                  {content.brochureModalTitle}
                </h2>
                <p className="mt-2 text-sm text-[#525252]">{content.brochureModalHint}</p>
              </div>
              <button
                type="button"
                aria-label="Close contact form"
                onClick={() => setIsContactOpen(false)}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-2xl leading-none text-[#525252] transition-colors hover:bg-[#f0f0f0] hover:text-[#1a1a1a]"
              >
                ×
              </button>
            </div>

            <ContactForm
              contactEmail={content.contactEmail}
              submitLabel="Send & Download"
              onSuccess={handleContactSuccess}
            />
          </div>
        </div>
      ) : null}
    </section>
  )
}
