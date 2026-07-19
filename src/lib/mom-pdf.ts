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

/**
 * Builds and downloads a MOM Report PDF matching the Bubble print layout.
 * Leaves blank space at the bottom for a manual company seal and signature.
 * @param report - MOM report record to render
 */
export const downloadMomReportPdf = async (report: MomReport) => {
  const [logoData, wordmarkData] = await Promise.all([
    loadImageDataUrl('/assets/logo.png'),
    loadImageDataUrl('/assets/wordmark.png'),
  ])

  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
  const contentW = PAGE_W - MARGIN * 2
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
  y += bodyH + 8

  // Reserve blank space at bottom-right for manual seal + signature.
  const sealSize = 32
  const stampX = PAGE_W - MARGIN - sealSize - 2
  const stampY = Math.min(y, PAGE_H - 48)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(reportDate, stampX + sealSize / 2, stampY + sealSize + 5, { align: 'center' })

  doc.save(`MOM-Report-${safePdfSlug(report.company_name || 'report')}.pdf`)
}
