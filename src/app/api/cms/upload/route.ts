import { NextResponse } from 'next/server'

import { canAccessEditor, getUserRole } from '@/lib/auth/roles'
import { createServiceClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
])

const MAX_BYTES = 10 * 1024 * 1024

/**
 * Authenticated CMS image upload that uses the service role for Storage,
 * avoiding storage RLS connection pressure on free-tier databases.
 */
export const POST = async (request: Request) => {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const role = getUserRole(user)
    if (!canAccessEditor(role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file')
    const folderRaw = formData.get('folder')
    const folder =
      typeof folderRaw === 'string' && folderRaw.trim()
        ? folderRaw.trim().replace(/[^a-zA-Z0-9/_-]/g, '')
        : 'uploads'

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Missing image file' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: 'Unsupported image type. Use JPG, PNG, WebP, GIF, or SVG.' },
        { status: 400 },
      )
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: 'Image must be 10MB or smaller.' },
        { status: 400 },
      )
    }

    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`
    const path = `${folder}/${safeName}`
    const bytes = new Uint8Array(await file.arrayBuffer())

    const admin = createServiceClient()
    const { error: uploadError } = await admin.storage
      .from('cms-media')
      .upload(path, bytes, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || 'image/jpeg',
      })

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data } = admin.storage.from('cms-media').getPublicUrl(path)
    return NextResponse.json({ url: data.publicUrl })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Upload failed unexpectedly'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
