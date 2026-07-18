import type { Metadata } from 'next'

import { ChemicalBrands } from '@/components/chemical-brands'
import { ChemicalHero } from '@/components/chemical-hero'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { getChemicalContent, getLandingContent } from '@/lib/cms/content'

export const metadata: Metadata = {
  title: 'Chemical Division | Integrate Techno Trade',
  description:
    'Chemical Division raw materials — specialty ingredients and collagen protein partners for healthcare and pharmaceutical industries.',
}

/**
 * Chemical Division page structured like a raw-materials brands showcase.
 */
export default async function ChemicalPage() {
  const [landing, chemical] = await Promise.all([
    getLandingContent(),
    getChemicalContent(),
  ])

  return (
    <main className="min-h-screen bg-white">
      <SiteHeader content={landing} />
      <ChemicalHero content={chemical} />
      <ChemicalBrands content={chemical} />
      <SiteFooter content={landing} />
    </main>
  )
}
