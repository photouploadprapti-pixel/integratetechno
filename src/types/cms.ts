import type { ChemicalBrand, ChemicalHeroSlide } from '@/types/chemical'
import type { ClientItem, NavLink, ServiceItem } from '@/types/landing'

/** Editable landing page content managed by CMS editors. */
export type LandingContent = {
  brandName: string
  logoUrl: string
  wordmarkUrl: string
  navLinks: NavLink[]
  heroSlides: Array<{ id: string; image: string; label: string }>
  ctaHeadline: string
  ctaButtonLabel: string
  aboutTitle: string
  aboutCopy: string
  ceoImage: string
  ceoName: string
  ceoTitle: string
  servicesTitle: string
  services: ServiceItem[]
  brochureUrl: string
  brochureButtonLabel: string
  brochureModalTitle: string
  brochureModalHint: string
  clientsTitle: string
  clients: ClientItem[]
  contactTitle: string
  contactEmail: string
  phoneNumber: string
  officeAddress: string[]
  callUsLabel: string
}

/** Editable Chemical Division page content managed by CMS editors. */
export type ChemicalContent = {
  heroTitle: string
  brandsCtaLabel: string
  brandsSectionTitle: string
  heroSlides: ChemicalHeroSlide[]
  brands: ChemicalBrand[]
}

/** Supported CMS document keys. */
export type SiteContentKey = 'landing' | 'chemical'
