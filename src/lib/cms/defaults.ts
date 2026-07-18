import { chemicalBrands, chemicalHeroSlides } from '@/data/chemical'
import {
  aboutCopy,
  brochureUrl,
  clients,
  contactEmail,
  heroSlides,
  navLinks,
  officeAddress,
  phoneNumber,
  services,
} from '@/data/landing'
import type { ChemicalContent, LandingContent } from '@/types/cms'

/** Default landing page content (fallback when CMS has no row). */
export const defaultLandingContent: LandingContent = {
  brandName: 'Integrate Techno Trade',
  logoUrl: '/assets/logo.png',
  wordmarkUrl: '/assets/wordmark.png',
  navLinks,
  heroSlides: heroSlides.map((slide) => ({
    id: String(slide.id),
    image: slide.image,
    label: slide.label,
  })),
  ctaHeadline: 'Want to know more?',
  ctaButtonLabel: 'Contact Us',
  aboutTitle: 'About Us',
  aboutCopy,
  ceoImage: '/assets/ceo.jpg',
  ceoName: 'Engr. Bijoy Prosad',
  ceoTitle: 'CEO',
  servicesTitle: 'Our Services',
  services,
  brochureUrl,
  brochureButtonLabel: 'Download Brochure',
  brochureModalTitle: 'Contact Us',
  brochureModalHint: 'Please fill out this form to download the brochure.',
  clientsTitle: 'Our Respected Clients',
  clients,
  contactTitle: 'Contact Us',
  contactEmail,
  phoneNumber,
  officeAddress,
  callUsLabel: 'Call Us',
}

/** Default Chemical Division content (fallback when CMS has no row). */
export const defaultChemicalContent: ChemicalContent = {
  heroTitle: 'Raw Materials',
  brandsCtaLabel: 'Brands',
  brandsSectionTitle: 'Brands',
  heroSlides: chemicalHeroSlides.map((slide) => ({
    id: slide.id,
    image: slide.image,
  })),
  brands: chemicalBrands,
}

/**
 * Deep-merges stored CMS JSON with defaults so missing keys stay usable.
 * @param defaults - Default content object
 * @param stored - Partial stored JSON
 */
export const mergeWithDefaults = <T extends Record<string, unknown>>(
  defaults: T,
  stored: unknown,
): T => {
  if (!stored || typeof stored !== 'object' || Array.isArray(stored)) {
    return defaults
  }

  const source = stored as Record<string, unknown>
  const result = { ...defaults }

  for (const key of Object.keys(defaults) as Array<keyof T>) {
    if (source[key as string] !== undefined) {
      result[key] = source[key as string] as T[keyof T]
    }
  }

  return result
}
