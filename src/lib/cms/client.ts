import { createClient } from '@/lib/supabase/client'

/**
 * Uploads an image file to the CMS media bucket and returns its public URL.
 * @param file - Image file selected by the editor
 * @param folder - Optional folder prefix inside the bucket
 */
export const uploadCmsImage = async (file: File, folder = 'uploads') => {
  const supabase = createClient()
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`
  const path = `${folder}/${safeName}`

  const { error } = await supabase.storage.from('cms-media').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || 'image/jpeg',
  })

  if (error) {
    throw new Error(error.message)
  }

  const { data } = supabase.storage.from('cms-media').getPublicUrl(path)
  return data.publicUrl
}

/**
 * Saves a CMS document for the given key.
 * @param key - Document id (`landing` | `chemical`)
 * @param data - Full content payload
 */
export const saveSiteContent = async (key: 'landing' | 'chemical', data: unknown) => {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { error } = await supabase.from('site_content').upsert({
    id: key,
    data,
    updated_at: new Date().toISOString(),
    updated_by: user?.id ?? null,
  })

  if (error) {
    throw new Error(error.message)
  }
}
