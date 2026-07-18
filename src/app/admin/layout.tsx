import { redirect } from 'next/navigation'

import { AdminShell } from '@/components/admin/admin-shell'
import { getUserDisplayName, getUserRole } from '@/lib/auth/roles'
import { createClient } from '@/lib/supabase/server'

/**
 * Authenticated admin layout with role-filtered shell.
 * @param children - Nested admin route content
 */
export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/admin/mom')
  }

  const role = getUserRole(user)
  if (role !== 'super_admin' && role !== 'admin' && role !== 'employee') {
    redirect(role === 'editor' ? '/editor' : '/login?next=/admin/mom')
  }

  return (
    <AdminShell displayName={getUserDisplayName(user)} role={role}>
      {children}
    </AdminShell>
  )
}
