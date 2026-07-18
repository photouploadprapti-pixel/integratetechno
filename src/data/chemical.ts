import type { ChemicalBrand, ChemicalHeroSlide } from '@/types/chemical'

/** Hero carousel slides for the Chemical Division page (Raw Materials layout). */
export const chemicalHeroSlides: ChemicalHeroSlide[] = [
  { id: 1, image: '/assets/chemical/hero-1.jpg' },
  { id: 2, image: '/assets/chemical/hero-2.jpg' },
  { id: 3, image: '/assets/chemical/hero-3.jpg' },
]

/**
 * Raw material brand partners and copy (content mirrored from reference structure).
 * Source structure: https://www.sakaint.com/raw_materials.html
 */
export const chemicalBrands: ChemicalBrand[] = [
  {
    id: 'gattefosse',
    name: 'Gattefossé',
    logo: '/assets/chemical/gattefosse.png',
    description:
      'Founded in Lyon, France, in 1880, Gattefosse is a leading provider of specialty ingredients and formulation solutions for the beauty and health care industries worldwide. Their solutions',
    highlight:
      'include excipients for sustained releases, tablets & capsules, excipients for suppositories, excipients for topical and dermal drug delivery.',
  },
  {
    id: 'gelita',
    name: 'Gelita',
    logo: '/assets/chemical/gelita.png',
    description:
      "Founded in 1875, headquartered in Germany, Gelita is the world's leading supplier of collagen proteins for the food, health & nutrition and pharmaceutical industries and for numerous technical applications. Their product range includes : innovative, tailor-made products based on",
    highlight:
      'collagen proteins for the food, health & nutrition, pharmaceutical industries and for technical applications.',
  },
]
