import { LandingEditorPanel } from '@/components/editor/landing-editor-panel'
import { getLandingContent } from '@/lib/cms/content'

/**
 * CMS panel for editing the public landing page.
 */
export default async function EditorLandingPage() {
  const content = await getLandingContent()
  return <LandingEditorPanel initialContent={content} />
}
