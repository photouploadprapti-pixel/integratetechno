import { redirect } from 'next/navigation'

import { EditorShell } from '@/components/editor/editor-shell'
import { canAccessEditor, getUserDisplayName, getUserRole } from '@/lib/auth/roles'
import { createClient } from '@/lib/supabase/server'

/**
 * Authenticated CMS editor layout.
 * @param children - Nested editor routes
 */
export default async function EditorLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/editor')
  }

  const role = getUserRole(user)
  if (!canAccessEditor(role)) {
    redirect('/login')
  }

  return <EditorShell displayName={getUserDisplayName(user)}>{children}</EditorShell>
}
