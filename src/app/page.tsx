import { AboutSection } from '@/components/about-section'
import { ClientsSection } from '@/components/clients-section'
import { ContactSection } from '@/components/contact-section'
import { CtaBanner } from '@/components/cta-banner'
import { HeroCarousel } from '@/components/hero-carousel'
import { ServicesSection } from '@/components/services-section'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'

/**
 * Landing page recreated from the Bubble.io Integrate Techno Trade site.
 */
export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <SiteHeader />
      <HeroCarousel />
      <CtaBanner />
      <AboutSection />
      <ServicesSection />
      <ClientsSection />
      <ContactSection />
      <SiteFooter />
    </main>
  )
}
