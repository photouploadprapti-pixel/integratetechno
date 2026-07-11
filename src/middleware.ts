import { type NextRequest } from 'next/server'

import { updateSession } from '@/lib/supabase/middleware'

/**
 * Next.js middleware — keeps Supabase auth cookies fresh and protects /admin.
 * @param request - Incoming request
 */
export const middleware = async (request: NextRequest) => {
  return updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|assets/.*|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
