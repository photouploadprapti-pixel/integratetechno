import { redirect } from 'next/navigation'

/**
 * Editor index redirects to the landing CMS panel.
 */
export default function EditorIndexPage() {
  redirect('/editor/landing')
}
