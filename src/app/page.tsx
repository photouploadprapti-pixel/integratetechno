import { AboutSection } from '@/components/about-section'
import { ClientsSection } from '@/components/clients-section'
import { ContactSection } from '@/components/contact-section'
import { CtaBanner } from '@/components/cta-banner'
import { HeroCarousel } from '@/components/hero-carousel'
import { ServicesSection } from '@/components/services-section'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { getLandingContent } from '@/lib/cms/content'

/**
 * Landing page recreated from the Bubble.io Integrate Techno Trade site.
 */
export default async function HomePage() {
  const content = await getLandingContent()

  return (
    <main className="min-h-screen bg-white">
      <SiteHeader content={content} />
      <HeroCarousel content={content} />
      <CtaBanner content={content} />
      <AboutSection content={content} />
      <ServicesSection content={content} />
      <ClientsSection content={content} />
      <ContactSection content={content} />
      <SiteFooter content={content} />
    </main>
  )
}
