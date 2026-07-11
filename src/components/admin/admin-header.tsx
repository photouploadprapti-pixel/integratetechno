'use client'

import Image from 'next/image'
import Link from 'next/link'

/**
 * Top bar for the admin dashboard.
 * @param displayName - Welcome name shown on the right
 * @param onMenuClick - Optional mobile menu opener
 */
export const AdminHeader = ({
  displayName,
  onMenuClick,
}: {
  displayName: string
  onMenuClick?: () => void
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-[#e8ecf5] bg-white/95 backdrop-blur">
      <div className="flex items-center justify-between gap-2 px-3 py-3 sm:gap-4 sm:px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-2 sm:gap-2.5">
          {onMenuClick ? (
            <button
              type="button"
              onClick={onMenuClick}
              aria-label="Open menu"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#dbe2f0] text-[#0c29ab] transition-colors hover:bg-[#eef2ff] md:hidden"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden>
                <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" />
              </svg>
            </button>
          ) : null}

          <Link href="/admin/mom" className="flex min-w-0 items-center gap-2 sm:gap-2.5">
            <Image
              src="/assets/logo.png"
              alt="ITT logo"
              width={44}
              height={44}
              className="h-9 w-9 shrink-0 rounded-full object-cover sm:h-10 sm:w-10 md:h-11 md:w-11"
              priority
            />
            <Image
              src="/assets/wordmark.png"
              alt="Integrate Techno Trade"
              width={260}
              height={32}
              className="hidden h-7 w-auto max-w-[180px] object-contain sm:block md:h-8 md:max-w-[240px]"
              priority
            />
          </Link>
        </div>

        <div className="flex min-w-0 items-center gap-2 sm:gap-4">
          <p className="hidden text-sm font-medium text-[#2c3d94] sm:block sm:text-base">
            Welcome, <span className="font-semibold">{displayName}</span>
          </p>
          <p className="max-w-[96px] truncate text-sm font-medium text-[#2c3d94] sm:hidden">
            {displayName}
          </p>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="rounded-full px-2.5 py-1.5 text-sm font-semibold text-[#ef2f15] transition-colors hover:bg-[#ef2f15]/10 sm:px-3"
            >
              Log Out
            </button>
          </form>
        </div>
      </div>
    </header>
  )
}
