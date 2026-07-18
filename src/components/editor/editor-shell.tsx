'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'

const editorNav = [
  { label: 'Landing Page', href: '/editor/landing' },
  { label: 'Chemical Division', href: '/editor/chemical' },
]

type EditorShellProps = {
  displayName: string
  children: React.ReactNode
}

/**
 * CMS editor chrome with top nav and sign-out.
 * @param displayName - Signed-in editor name
 * @param children - Nested editor page
 */
export const EditorShell = ({ displayName, children }: EditorShellProps) => {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      <header className="border-b border-[#e6e6e6] bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6">
          <div>
            <p className="font-[family-name:var(--font-righteous)] text-xl text-[#0c29ab]">
              Content Editor
            </p>
            <p className="text-sm text-[#525252]">Signed in as {displayName}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {editorNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'inline-flex min-h-10 items-center rounded-[12px] px-4 text-sm font-medium',
                  pathname === item.href || pathname.startsWith(`${item.href}/`)
                    ? 'bg-[#0c29ab] text-white'
                    : 'border border-[#e6e6e6] bg-white text-[#2c3d94]',
                )}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/"
              target="_blank"
              className="inline-flex min-h-10 items-center rounded-[12px] border border-[#e6e6e6] px-4 text-sm font-medium text-[#2c3d94]"
            >
              View site
            </Link>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="inline-flex min-h-10 items-center rounded-[12px] border border-[#e6e6e6] px-4 text-sm font-medium text-[#ef2f15]"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">{children}</main>
    </div>
  )
}
