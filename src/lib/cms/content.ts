import {
  defaultChemicalContent,
  defaultLandingContent,
  mergeWithDefaults,
} from '@/lib/cms/defaults'
import { createClient } from '@/lib/supabase/server'
import type { ChemicalContent, LandingContent, SiteContentKey } from '@/types/cms'

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

    return mergeWithDefaults(defaults as Record<string, unknown>, data.data) as T
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
