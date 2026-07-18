import type { User } from '@supabase/supabase-js'

import type { UserRole } from '@/types/admin'

const VALID_ROLES: UserRole[] = ['super_admin', 'admin', 'employee', 'editor']

/**
 * Reads the application role from a Supabase user object.
 * @param user - Authenticated Supabase user
 */
export const getUserRole = (user: User | null): UserRole | null => {
  if (!user) return null

  const appRole = user.app_metadata?.role
  const metaRole = user.user_metadata?.role
  const role = typeof appRole === 'string' ? appRole : typeof metaRole === 'string' ? metaRole : null

  if (role && VALID_ROLES.includes(role as UserRole)) {
    return role as UserRole
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
  if (role === 'editor') return '/editor'
  if (role === 'super_admin' || role === 'admin' || role === 'employee') {
    return '/admin/mom'
  }
  return '/login'
}

/**
 * Module paths each staff role is allowed to open under /admin.
 * @param role - Application role
 */
export const getAllowedAdminPaths = (role: UserRole | null): string[] => {
  if (role === 'super_admin') {
    return ['/admin/mom', '/admin/sis', '/admin/income', '/admin/cash-book', '/admin/banking']
  }
  if (role === 'admin') {
    return ['/admin/mom', '/admin/sis', '/admin/cash-book']
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
  if (role === 'editor') return false
  if (pathname === '/admin' || pathname === '/admin/') {
    return role === 'super_admin' || role === 'admin' || role === 'employee'
  }

  const allowed = getAllowedAdminPaths(role)
  return allowed.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  )
}

/**
 * Whether a role can access the CMS editor area.
 * @param role - Application role
 */
export const canAccessEditor = (role: UserRole | null) =>
  role === 'editor' || role === 'super_admin'
