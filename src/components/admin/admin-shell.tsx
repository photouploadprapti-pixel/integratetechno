'use client'

import { useState, type ReactNode } from 'react'

import { AdminHeader } from '@/components/admin/admin-header'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import type { UserRole } from '@/types/admin'

/**
 * Client shell wrapping admin pages with header + role-aware sidebar.
 * @param displayName - Signed-in user display name
 * @param role - Signed-in user role for nav filtering
 * @param children - Page content
 */
export const AdminShell = ({
  displayName,
  role,
  children,
}: {
  displayName: string
  role: UserRole
  children: ReactNode
}) => {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#eef1f8]">
      <AdminHeader displayName={displayName} onMenuClick={() => setMobileOpen(true)} />

      <div className="flex min-h-[calc(100vh-65px)]">
        <AdminSidebar
          role={role}
          mobileOpen={mobileOpen}
          onNavigate={() => setMobileOpen(false)}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <main className="flex-1 overflow-x-hidden p-3 sm:p-4 md:p-6">{children}</main>
        </div>
      </div>
    </div>
  )
}
