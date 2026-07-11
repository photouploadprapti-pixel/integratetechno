import type { User } from '@supabase/supabase-js'

import type { UserRole } from '@/types/admin'

/**
 * Reads the application role from a Supabase user object.
 * @param user - Authenticated Supabase user
 */
export const getUserRole = (user: User | null): UserRole | null => {
  if (!user) return null

  const appRole = user.app_metadata?.role
  const metaRole = user.user_metadata?.role
  const role = typeof appRole === 'string' ? appRole : typeof metaRole === 'string' ? metaRole : null

  if (role === 'super_admin' || role === 'admin' || role === 'employee') {
    return role
  }

  return null
}

/**
 * Returns a display name for the signed-in user.
 * @param user - Authenticated Supabase user
 */
export const getUserDisplayName = (user: User) => {
  const fullName = user.user_metadata?.full_name
  if (typeof fullName === 'string' && fullName.trim()) return fullName.trim()
  return user.email?.split('@')[0] || 'User'
}

/**
 * Returns the home path for a given role after login.
 * @param role - Application role
 */
export const getRoleHomePath = (role: UserRole | null) => {
  if (role === 'super_admin' || role === 'admin' || role === 'employee') {
    return '/admin/mom'
  }
  return '/admin/mom'
}

/**
 * Module paths each role is allowed to open.
 * Banking is Super Admin only; employees only get MOM + S/I/S.
 * @param role - Application role
 */
export const getAllowedAdminPaths = (role: UserRole | null): string[] => {
  if (role === 'super_admin') {
    return ['/admin/mom', '/admin/sis', '/admin/income', '/admin/cash-book', '/admin/banking']
  }
  if (role === 'admin') {
    return ['/admin/mom', '/admin/sis', '/admin/income', '/admin/cash-book']
  }
  if (role === 'employee') {
    return ['/admin/mom', '/admin/sis']
  }
  return []
}

/**
 * Whether a role can access a given admin pathname.
 * @param role - Application role
 * @param pathname - Current URL path
 */
export const canAccessAdminPath = (role: UserRole | null, pathname: string) => {
  if (pathname === '/admin' || pathname === '/admin/') {
    return Boolean(role)
  }

  const allowed = getAllowedAdminPaths(role)
  return allowed.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  )
}
