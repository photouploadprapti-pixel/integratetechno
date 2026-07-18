import { ChemicalEditorPanel } from '@/components/editor/chemical-editor-panel'
import { getChemicalContent } from '@/lib/cms/content'

/**
 * CMS panel for editing the Chemical Division page.
 */
export default async function EditorChemicalPage() {
  const content = await getChemicalContent()
  return <ChemicalEditorPanel initialContent={content} />
}
