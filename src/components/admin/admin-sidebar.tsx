'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { getNavForRole } from '@/data/admin'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/types/admin'

/**
 * Left sidebar navigation filtered by the signed-in user's role.
 * @param role - Application role controlling visible modules
 * @param mobileOpen - Whether the mobile drawer is open
 * @param onNavigate - Callback after a mobile nav click
 */
export const AdminSidebar = ({
  role,
  mobileOpen,
  onNavigate,
}: {
  role: UserRole
  mobileOpen?: boolean
  onNavigate?: () => void
}) => {
  const pathname = usePathname()
  const navItems = getNavForRole(role)

  return (
    <>
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 flex w-[min(18rem,88vw)] flex-col border-r border-[#e8ecf5] bg-[#f8faff] pt-[65px] transition-transform duration-200 md:static md:z-0 md:w-64 md:translate-x-0 md:pt-0',
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0 md:shadow-none',
        )}
      >
        <div className="flex items-center justify-between px-4 pb-1 pt-3 md:hidden">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7a8699]">
            Modules
          </p>
          <button
            type="button"
            aria-label="Close menu"
            onClick={onNavigate}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#4a5568] hover:bg-[#eef2ff]"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden>
              <path d="M18.3 5.71 12 12l6.3 6.29-1.41 1.42L10.59 13.4 4.29 19.7 2.88 18.3 9.17 12 2.88 5.71 4.29 4.29 10.59 10.6l6.3-6.3z" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-3 md:py-5">
          <p className="mb-3 hidden px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7a8699] md:block">
            Modules
          </p>
          <nav className="flex flex-col gap-2" aria-label="Admin modules">
            {navItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    'rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all',
                    active
                      ? 'bg-[#0c29ab] text-white shadow-[0_8px_20px_rgba(12,41,171,0.28)]'
                      : 'bg-white text-[#1a2a4a] shadow-sm ring-1 ring-[#e6ebf5] hover:bg-[#eef2ff] hover:text-[#0c29ab]',
                  )}
                >
                  <span className="block">{item.label}</span>
                  <span
                    className={cn(
                      'mt-0.5 block text-xs font-normal',
                      active ? 'text-white/75' : 'text-[#7a8699]',
                    )}
                  >
                    {item.description}
                  </span>
                </Link>
              )
            })}
          </nav>
        </div>
      </aside>

      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
          onClick={onNavigate}
        />
      ) : null}
    </>
  )
}
