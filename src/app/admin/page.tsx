import { redirect } from 'next/navigation'

/**
 * Admin index redirects Super Admin to MOM Report (default module).
 */
export default function AdminIndexPage() {
  redirect('/admin/mom')
}
