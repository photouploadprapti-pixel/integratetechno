import { jsPDF } from 'jspdf'

import {
  REPORT_COMPANY,
  drawReportHeader,
  formatPdfDate,
  loadImageDataUrl,
  safePdfSlug,
  strokeRect,
} from '@/lib/report-pdf'
import type { MomReport } from '@/types/mom'

const PAGE_W = 210
const PAGE_H = 297
const MARGIN = 14
/** Signature footer block height (tall enough for a manual seal). */
const FOOTER_H = 72

/** Optional signer details autofilled from the logged-in staff directory. */
export interface MomPdfSigner {
  name: string
  designation: string
}

/**
 * Builds and downloads a MOM Report PDF matching the Bubble print layout.
 * Ends with Customer Remarks + the same 3-column signature footer used on S/I/S PDFs.
 * @param report - MOM report record to render
 * @param signer - Optional Name/Designation for the Integrate Techno Trade column
 */
export const downloadMomReportPdf = async (
  report: MomReport,
  signer?: MomPdfSigner | null,
) => {
  const [logoData, wordmarkData] = await Promise.all([
    loadImageDataUrl('/assets/logo.png'),
    loadImageDataUrl('/assets/wordmark.png'),
  ])

  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
  const contentW = PAGE_W - MARGIN * 2
  const pageBottom = () => PAGE_H - MARGIN
  let y = drawReportHeader(doc, logoData, wordmarkData)

  const reportDate =
    formatPdfDate(report.mom_date) || formatPdfDate(new Date().toISOString().slice(0, 10))

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text('MOM REPORT', PAGE_W / 2, y, { align: 'center' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(`Date: ${reportDate}`, PAGE_W - MARGIN, y, { align: 'right' })
  y += 6

  const tableX = MARGIN
  const tableW = contentW
  const midX = tableX + tableW / 2

  const companyLines = [report.company_name || '', report.company_address || ''].filter(Boolean)
  const toLines = [`To: ${REPORT_COMPANY.name}`, `Phone: ${REPORT_COMPANY.toPhone}`]

  /**
   * Draws a full-width text row.
   * @param labelText - Row text
   * @param rowH - Minimum row height
   * @param fontSize - Font size
   */
  const drawFullRow = (labelText: string, rowH = 9, fontSize = 10) => {
    doc.setFontSize(fontSize)
    const lines = doc.splitTextToSize(labelText, tableW - 6)
    const needed = Math.max(rowH, lines.length * 4.4 + 4)
    strokeRect(doc, tableX, y, tableW, needed)
    doc.text(lines, tableX + 3, y + 5.2)
    y += needed
  }

  /**
   * Draws a two-column row.
   * @param leftLines - Left cell lines
   * @param rightLines - Right cell lines
   * @param minH - Minimum height
   */
  const drawSplitRow = (leftLines: string[], rightLines: string[], minH = 14) => {
    doc.setFontSize(10)
    const leftWrapped = leftLines.flatMap((line) => doc.splitTextToSize(line, tableW / 2 - 6))
    const rightWrapped = rightLines.flatMap((line) => doc.splitTextToSize(line, tableW / 2 - 6))
    const needed = Math.max(minH, Math.max(leftWrapped.length, rightWrapped.length) * 4.4 + 5)
    strokeRect(doc, tableX, y, tableW / 2, needed)
    strokeRect(doc, midX, y, tableW / 2, needed)
    doc.text(leftWrapped, tableX + 3, y + 5.2)
    doc.text(rightWrapped, midX + 3, y + 5.2)
    y += needed
  }

  drawSplitRow(companyLines.length > 0 ? companyLines : ['—'], toLines, 16)
  drawFullRow(`Technician (s) who attended the work: ${report.technicians_txt || ''}`)
  drawFullRow(`Type of Machine: ${report.type_of_machine || ''}`)
  drawFullRow(`Machine No.: ${report.machine_no || ''}`)
  drawSplitRow(
    [`Starting Date: ${formatPdfDate(report.starting_date)}`],
    [`Date of Leaving: ${formatPdfDate(report.ending_date)}`],
    10,
  )

  const days = report.days_taken
    ? /day/i.test(report.days_taken)
      ? report.days_taken
      : `${report.days_taken} days`
    : ''

  drawSplitRow(
    [`Type of visit: ${report.type_of_visit || ''}`],
    [`Total days taken: ${days}`],
    10,
  )
  drawFullRow(`Machine in Warrenty: ${report.machine_warrenty ? 'yes' : 'no'}`)
  drawFullRow(
    'We hereby certify that the following job has been carried out by your technician on our machine (s) and now the same is / are running very satisfactorily.',
    14,
    9.5,
  )

  const bodyLines = [
    'Installation report:',
    report.installation_report || '',
    '',
    'Conclusion:',
    report.conclusion || '',
  ]
  if (report.note) {
    bodyLines.push('', 'Note:', report.note)
  }

  doc.setFontSize(10)
  const bodyWrapped = bodyLines.flatMap((line) =>
    line ? doc.splitTextToSize(line, tableW - 6) : [''],
  )
  const bodyH = Math.max(42, bodyWrapped.length * 4.4 + 8)
  strokeRect(doc, tableX, y, tableW, bodyH)
  doc.text(bodyWrapped, tableX + 3, y + 6)
  y += bodyH

  // Customer Remarks row (same as S/I/S PDF footer stack).
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  const remarksText = `Customer Remarks: ${report.customer_remarks?.trim() || ''}`
  const remarksLines = doc.splitTextToSize(remarksText, tableW - 6) as string[]
  const remarksH = Math.max(10, remarksLines.length * 4.4 + 4)
  strokeRect(doc, tableX, y, tableW, remarksH)
  doc.text(remarksLines, tableX + 3, y + 5.2)
  y += remarksH

  // Place signature footer directly under remarks; page-break if needed.
  if (y + FOOTER_H > pageBottom()) {
    doc.addPage()
    y = drawReportHeader(doc, logoData, wordmarkData)
  }

  const footerY = y
  const colW = contentW / 3
  strokeRect(doc, MARGIN, footerY, colW, FOOTER_H)
  strokeRect(doc, MARGIN + colW, footerY, colW, FOOTER_H)
  strokeRect(doc, MARGIN + colW * 2, footerY, colW, FOOTER_H)

  const signerName = report.signer_name?.trim() || signer?.name?.trim() || ''
  const signerDesignation =
    report.signer_designation?.trim() || signer?.designation?.trim() || ''
  const footerDate =
    formatPdfDate(report.signer_date) || reportDate

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  const leftPadX = MARGIN + 3
  const midPadX = MARGIN + colW + 3
  const valueTopY = footerY + 12
  const designationY = valueTopY + 7
  const signatureY = designationY + 8
  const dateY = footerY + FOOTER_H - 5

  doc.setFont('helvetica', 'bold')
  doc.text('Integrate Techno Trade:', midPadX, footerY + 5)
  doc.setFont('helvetica', 'normal')

  doc.text('Name:', leftPadX, valueTopY)
  doc.text(signerName, midPadX, valueTopY)

  doc.text('Designation:', leftPadX, designationY)
  doc.text(signerDesignation, midPadX, designationY)

  doc.text('Signature:', leftPadX, signatureY)
  // Wide blank band under Signature for manual seal + signature.

  doc.text('Date:', leftPadX, dateY)
  doc.text(footerDate, midPadX, dateY)

  doc.setFont('helvetica', 'bold')
  doc.text('Customer:', MARGIN + colW * 2 + 3, footerY + 5)

  doc.save(`MOM-Report-${safePdfSlug(report.company_name || 'report')}.pdf`)
}
