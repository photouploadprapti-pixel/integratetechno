import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

/**
 * Signs the current user out and returns them to the login page.
 */
export const POST = async () => {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
