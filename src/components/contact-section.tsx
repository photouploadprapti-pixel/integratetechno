'use client'

import { ContactForm } from '@/components/contact-form'
import type { LandingContent } from '@/types/cms'

type ContactSectionProps = {
  content: Pick<LandingContent, 'contactTitle' | 'contactEmail'>
}

/**
 * Contact form section matching Bubble fields: Name, Email, Subject, Body.
 * @param content - CMS-driven contact title and destination email
 */
export const ContactSection = ({ content }: ContactSectionProps) => {
  return (
    <section id="contact" className="bg-white px-4 py-12 md:px-6 md:py-16">
      <div className="mx-auto max-w-xl rounded-[20px] border border-[#e6e6e6] p-4 sm:p-6 md:p-8">
        <h2 className="mb-6 text-center font-[family-name:var(--font-righteous)] text-xl text-[#1a1a1a] sm:text-2xl">
          {content.contactTitle}
        </h2>
        <ContactForm contactEmail={content.contactEmail} />
      </div>
    </section>
  )
}
