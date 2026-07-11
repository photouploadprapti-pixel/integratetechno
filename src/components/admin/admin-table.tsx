import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

/**
 * Scrollable table frame tuned for mobile horizontal overflow.
 * @param children - Table element
 * @param className - Optional extra classes
 */
export const AdminTableFrame = ({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) => {
  return (
    <div
      className={cn(
        'relative -mx-1 overflow-x-auto overscroll-x-contain rounded-2xl border border-[#e8ecf5] sm:mx-0',
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-white to-transparent sm:hidden" />
      {children}
    </div>
  )
}

/**
 * Standard admin data table element with a mobile-friendly minimum width.
 * @param children - thead/tbody content
 * @param className - Optional extra classes
 */
export const AdminTable = ({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) => {
  return (
    <table
      className={cn(
        'min-w-[720px] w-full border-collapse text-left text-sm md:min-w-full',
        className,
      )}
    >
      {children}
    </table>
  )
}
