import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

import {
  canAccessAdminPath,
  canAccessEditor,
  getRoleHomePath,
  getUserRole,
} from '@/lib/auth/roles'

/**
 * Refreshes the Supabase session and guards /admin + /editor routes by auth + role.
 * @param request - Incoming Next.js request
 */
export const updateSession = async (request: NextRequest) => {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isAdminRoute = pathname.startsWith('/admin')
  const isEditorRoute = pathname.startsWith('/editor')
  const isLoginRoute = pathname.startsWith('/login')
  const role = getUserRole(user)

  if ((isAdminRoute || isEditorRoute) && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  if (isAdminRoute && user) {
    if (!role || role === 'editor') {
      const url = request.nextUrl.clone()
      url.pathname = role === 'editor' ? '/editor' : '/login'
      return NextResponse.redirect(url)
    }

    if (!canAccessAdminPath(role, pathname, user.email)) {
      const url = request.nextUrl.clone()
      url.pathname = getRoleHomePath(role)
      return NextResponse.redirect(url)
    }
  }

  if (isEditorRoute && user) {
    if (!canAccessEditor(role)) {
      const url = request.nextUrl.clone()
      url.pathname = getRoleHomePath(role)
      return NextResponse.redirect(url)
    }
  }

  if (isLoginRoute && user && role) {
    const url = request.nextUrl.clone()
    url.pathname = getRoleHomePath(role)
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
