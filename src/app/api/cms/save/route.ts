import { NextResponse } from 'next/server'

import { canAccessEditor, getUserRole } from '@/lib/auth/roles'
import { createServiceClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

const VALID_KEYS = new Set(['landing', 'chemical'])

/**
 * Authenticated CMS document save using the service role after role checks.
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

    const body = (await request.json()) as {
      key?: unknown
      data?: unknown
    }

    const key = typeof body.key === 'string' ? body.key : ''
    if (!VALID_KEYS.has(key)) {
      return NextResponse.json({ error: 'Invalid content key' }, { status: 400 })
    }

    if (body.data === undefined) {
      return NextResponse.json({ error: 'Missing content data' }, { status: 400 })
    }

    const admin = createServiceClient()
    const { error } = await admin.from('site_content').upsert({
      id: key,
      data: body.data,
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to save content'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
