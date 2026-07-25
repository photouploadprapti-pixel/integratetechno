/**
 * Uploads an image file via the authenticated CMS upload API and returns its public URL.
 * Uses a server route with the service role so Storage RLS does not exhaust DB connections.
 * @param file - Image file selected by the editor
 * @param folder - Optional folder prefix inside the bucket
 */
export const uploadCmsImage = async (file: File, folder = 'uploads') => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('folder', folder)

  const response = await fetch('/api/cms/upload', {
    method: 'POST',
    body: formData,
  })

  const payload = (await response.json().catch(() => null)) as
    | { url?: string; error?: string }
    | null

  if (!response.ok) {
    throw new Error(payload?.error || 'Upload failed')
  }

  if (!payload?.url) {
    throw new Error('Upload succeeded but no image URL was returned')
  }

  return payload.url
}

/**
 * Saves a CMS document for the given key.
 * @param key - Document id (`landing` | `chemical`)
 * @param data - Full content payload
 */
export const saveSiteContent = async (key: 'landing' | 'chemical', data: unknown) => {
  const response = await fetch('/api/cms/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, data }),
  })

  const payload = (await response.json().catch(() => null)) as
    | { error?: string }
    | null

  if (!response.ok) {
    throw new Error(payload?.error || 'Failed to save content')
  }
}
