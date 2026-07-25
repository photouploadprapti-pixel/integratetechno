import { officeMapEmbedUrl } from '@/data/landing'
import {
  defaultChemicalContent,
  defaultLandingContent,
  mergeWithDefaults,
} from '@/lib/cms/defaults'
import { createClient } from '@/lib/supabase/server'
import type { ChemicalContent, LandingContent, SiteContentKey } from '@/types/cms'

/**
 * Upgrades legacy static footer map embeds to the interactive place embed.
 * @param content - Merged landing CMS content
 */
const normalizeLandingMapEmbed = (content: LandingContent): LandingContent => {
  const embed = content.officeMapEmbedUrl?.trim() || ''
  if (!embed || (embed.includes('output=embed') && !embed.includes('/maps/embed?'))) {
    return { ...content, officeMapEmbedUrl }
  }
  return content
}

/**
 * Loads a CMS document by key, falling back to built-in defaults.
 * @param key - Content document key
 */
export const getSiteContent = async <T extends LandingContent | ChemicalContent>(
  key: SiteContentKey,
): Promise<T> => {
  const defaults =
    key === 'landing'
      ? (defaultLandingContent as T)
      : (defaultChemicalContent as T)

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('site_content')
      .select('data')
      .eq('id', key)
      .maybeSingle()

    if (error || !data?.data) {
      return defaults
    }

    const merged = mergeWithDefaults(defaults as Record<string, unknown>, data.data) as T
    if (key === 'landing') {
      return normalizeLandingMapEmbed(merged as LandingContent) as T
    }
    return merged
  } catch {
    return defaults
  }
}

/**
 * Loads landing page CMS content.
 */
export const getLandingContent = async () => getSiteContent<LandingContent>('landing')

/**
 * Loads Chemical Division CMS content.
 */
export const getChemicalContent = async () => getSiteContent<ChemicalContent>('chemical')
