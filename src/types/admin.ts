/** Supported application roles. */
export type UserRole = 'super_admin' | 'admin' | 'employee' | 'editor'

/** Sidebar navigation item for the admin dashboard. */
export interface AdminNavItem {
  label: string
  href: string
  description: string
}

/** Column definition for admin data tables. */
export interface AdminTableColumn {
  key: string
  label: string
  className?: string
}

/** Generic row used by admin section tables. */
export type AdminTableRow = Record<string, string>
