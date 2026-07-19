import type { User } from '@supabase/supabase-js'

import { getStaffNameByEmail } from '@/lib/staff-directory'
import type { UserRole } from '@/types/admin'

const VALID_ROLES: UserRole[] = ['super_admin', 'admin', 'employee', 'editor']

/** Only this admin email may use Cash Book besides super_admin. */
export const CASH_BOOK_ALLOWED_EMAIL = 'service2@integratebd.com'

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
 * Prefers the staff directory name for known emails.
 * @param user - Authenticated Supabase user
 */
export const getUserDisplayName = (user: User) => {
  const directoryName = getStaffNameByEmail(user.email)
  if (directoryName) return directoryName

  const fullName = user.user_metadata?.full_name
  if (typeof fullName === 'string' && fullName.trim()) return fullName.trim()
  return user.email?.split('@')[0] || 'User'
}

/**
 * Whether Cash Book is visible/usable for this role + email.
 * All super_admins, plus service2@integratebd.com among admins.
 * @param role - Application role
 * @param email - Signed-in user email
 */
export const canAccessCashBook = (role: UserRole | null, email?: string | null) => {
  if (role === 'super_admin') return true
  if (role !== 'admin') return false
  return (email || '').trim().toLowerCase() === CASH_BOOK_ALLOWED_EMAIL
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
 * @param email - Signed-in user email (needed for Cash Book exception)
 */
export const getAllowedAdminPaths = (
  role: UserRole | null,
  email?: string | null,
): string[] => {
  if (role === 'super_admin') {
    return [
      '/admin/mom',
      '/admin/sales-commission',
      '/admin/local-sales',
      '/admin/sis',
      '/admin/income',
      '/admin/cash-book',
      '/admin/banking',
    ]
  }
  if (role === 'admin') {
    const paths = [
      '/admin/mom',
      '/admin/sales-commission',
      '/admin/local-sales',
      '/admin/sis',
    ]
    if (canAccessCashBook(role, email)) {
      paths.push('/admin/cash-book')
    }
    return paths
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
 * @param email - Signed-in user email
 */
export const canAccessAdminPath = (
  role: UserRole | null,
  pathname: string,
  email?: string | null,
) => {
  if (role === 'editor') return false
  if (pathname === '/admin' || pathname === '/admin/') {
    return role === 'super_admin' || role === 'admin' || role === 'employee'
  }

  const allowed = getAllowedAdminPaths(role, email)
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
