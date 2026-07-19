import { jsPDF } from 'jspdf'

import {
  drawReportHeader,
  formatPdfDate,
  loadImageDataUrl,
  safePdfSlug,
  strokeRect,
} from '@/lib/report-pdf'
import { normalizeServiceTypes } from '@/lib/sis'
import type { SisReport, SisServiceType } from '@/types/sis'

const PAGE_W = 210
const PAGE_H = 297
const MARGIN = 12
/** Signature footer block height (tall enough for a manual seal). */
const FOOTER_H = 72
/** Line gap within a wrapped field. */
const LINE_GAP = 4.6
/** Extra gap inserted between colon-separated fields. */
const FIELD_GAP_LINES = 1

/**
 * Formats yes/no values for the SIS PDF.
 * @param value - Boolean flag
 */
const yesNo = (value: boolean) => (value ? 'yes' : 'no')

/**
 * Formats an optional numeric/string field for PDF display.
 * @param value - Value to render
 */
const textOrEmpty = (value: string | number | null | undefined) => {
  if (value === null || value === undefined || value === '') return ''
  return String(value)
}

/**
 * Wraps fields and inserts blank lines between each field for paragraph gaps.
 * @param doc - jsPDF instance
 * @param fields - Field strings (each usually contains a ":" label)
 * @param maxWidth - Max line width in mm
 */
const wrapFieldsWithGaps = (doc: jsPDF, fields: string[], maxWidth: number) => {
  const lines: string[] = []
  fields.forEach((field, index) => {
    const wrapped = doc.splitTextToSize(field, maxWidth) as string[]
    lines.push(...wrapped)
    if (index < fields.length - 1) {
      for (let i = 0; i < FIELD_GAP_LINES; i += 1) {
        lines.push('')
      }
    }
  })
  return lines
}

/**
 * Draws text lines with a fixed vertical gap between each line.
 * @param doc - jsPDF instance
 * @param lines - Lines to draw
 * @param x - Left position
 * @param startY - Baseline of first line
 * @param lineGap - Distance between baselines in mm
 */
const drawSpacedLines = (
  doc: jsPDF,
  lines: string[],
  x: number,
  startY: number,
  lineGap: number,
) => {
  lines.forEach((line, index) => {
    if (line) {
      doc.text(line, x, startY + index * lineGap)
    }
  })
}

/**
 * Draws a checkbox-style report type option.
 * @param doc - jsPDF instance
 * @param x - Left of box
 * @param y - Top of box
 * @param label - Option label
 * @param checked - Whether selected
 */
const drawCheckOption = (
  doc: jsPDF,
  x: number,
  y: number,
  label: string,
  checked: boolean,
) => {
  const boxSize = 3.4
  const boxTop = y - 3.2

  if (checked) {
    doc.setFillColor(12, 41, 171)
    doc.setDrawColor(12, 41, 171)
    doc.rect(x, boxTop, boxSize, boxSize, 'FD')
  } else {
    doc.setDrawColor(0, 0, 0)
    doc.setLineWidth(0.35)
    doc.rect(x, boxTop, boxSize, boxSize)
  }

  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text(label, x + 5, y)
}

/**
 * Builds the debit-note line; omits Number/Dt when not raised.
 * @param report - S/I/S report record
 */
const buildDebitNoteLine = (report: SisReport) => {
  if (report.debit_note_to_be_raised) {
    return `Debit Note to be Raised Number: ${textOrEmpty(report.debit_note_number)} Dt. ${textOrEmpty(report.debit_note_dt)}`
  }
  return 'Debit Note to be Raised (No)'
}

/** Optional signer details autofilled from the logged-in staff directory. */
export interface SisPdfSigner {
  name: string
  designation: string
}

/**
 * Builds and downloads an S/I/S Report PDF matching the Bubble print layout.
 * Adds field paragraph gaps, places the footer under content (no mid-page void),
 * and shows Integrate Techno Trade values aligned to left labels.
 * @param report - S/I/S report record to render
 * @param signer - Optional Name/Designation for the Integrate Techno Trade column
 */
export const downloadSisReportPdf = async (
  report: SisReport,
  signer?: SisPdfSigner | null,
) => {
  const [logoData, wordmarkData] = await Promise.all([
    loadImageDataUrl('/assets/logo.png'),
    loadImageDataUrl('/assets/wordmark.png'),
  ])

  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
  const contentW = PAGE_W - MARGIN * 2
  const pageBottom = () => PAGE_H - MARGIN
  let y = drawReportHeader(doc, logoData, wordmarkData)

  /**
   * Starts a new page when the next block won't fit on the current page.
   * @param needed - Block height required in mm
   */
  const ensureSpace = (needed: number) => {
    if (y + needed <= pageBottom()) return
    doc.addPage()
    y = drawReportHeader(doc, logoData, wordmarkData)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(100, 100, 100)
    doc.text('S/I/S Report (continued)', PAGE_W / 2, y, { align: 'center' })
    doc.setTextColor(0, 0, 0)
    y += 6
  }

  /**
   * Draws a full-width text block with pagination support.
   * @param lines - Wrapped text lines (may include blank gap lines)
   * @param fontSize - Font size
   * @param minH - Minimum block height on a page
   */
  const drawFullWidthBlock = (lines: string[], fontSize: number, minH: number) => {
    const padTop = 4
    const padBottom = 4
    let index = 0

    while (index < lines.length) {
      const remaining = pageBottom() - y
      const maxLines = Math.max(1, Math.floor((remaining - padTop - padBottom) / LINE_GAP))
      if (remaining < minH && y > MARGIN + 30) {
        ensureSpace(minH)
        continue
      }

      const chunk = lines.slice(index, index + maxLines)
      const chunkH = Math.max(minH, padTop + chunk.length * LINE_GAP + padBottom)
      if (y + chunkH > pageBottom() && index === 0) {
        ensureSpace(Math.min(chunkH, remaining > 20 ? remaining : chunkH))
        continue
      }

      strokeRect(doc, MARGIN, y, contentW, chunkH)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(fontSize)
      drawSpacedLines(doc, chunk, MARGIN + 2.5, y + padTop + 3.2, LINE_GAP)
      y += chunkH
      index += chunk.length
    }
  }

  const types = normalizeServiceTypes(report.service_type)
  const has = (type: SisServiceType) => types.includes(type)

  // Report type checkboxes
  ensureSpace(12)
  const optionY = y + 1
  drawCheckOption(doc, MARGIN + 28, optionY, 'Service', has('service'))
  drawCheckOption(doc, MARGIN + 72, optionY, 'Installation', has('installation'))
  drawCheckOption(doc, MARGIN + 128, optionY, 'Sales Report', has('sales_report'))
  y += 10

  const leftW = contentW * 0.55
  const rightW = contentW - leftW
  const leftX = MARGIN
  const rightX = MARGIN + leftW

  const leftFields = [
    'Customer Details:',
    `Customer Name: ${textOrEmpty(report.customer_name)}`,
    `Location: ${textOrEmpty(report.location)}`,
    `Contact Person: ${textOrEmpty(report.contact_person)}`,
    `Depart & Designation: ${textOrEmpty(report.dept_designation)}`,
    `Email: ${textOrEmpty(report.email)}`,
    `Phone: ${textOrEmpty(report.phone)}`,
  ]

  const rightFields = [
    `Report No.: ${textOrEmpty(report.report_no)}`,
    `Date of Report: ${formatPdfDate(report.date_of_report)}`,
    `Time Work Start On: ${formatPdfDate(report.work_starting_date)}`,
    `Time Work End On: ${formatPdfDate(report.work_ending_date)}`,
    `Date of MOM: ${formatPdfDate(report.mom_date)}`,
  ]

  doc.setFontSize(9)
  // Keep section title tight; gap between the remaining customer fields.
  const leftTitle = wrapFieldsWithGaps(doc, [leftFields[0]], leftW - 5)
  const leftBody = wrapFieldsWithGaps(doc, leftFields.slice(1), leftW - 5)
  const rightLines = wrapFieldsWithGaps(doc, rightFields, rightW - 5)
  const leftLines = [...leftTitle, ...leftBody]
  const customerPadTop = 4
  const customerPadBottom = 4
  const customerH = Math.max(
    42,
    customerPadTop +
      Math.max(leftLines.length, rightLines.length) * LINE_GAP +
      customerPadBottom,
  )
  ensureSpace(customerH)

  strokeRect(doc, leftX, y, leftW, customerH)
  strokeRect(doc, rightX, y, rightW, customerH)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9.5)
  doc.text(leftTitle[0], leftX + 2.5, y + customerPadTop + 3.5)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  drawSpacedLines(doc, leftBody, leftX + 2.5, y + customerPadTop + 3.5 + LINE_GAP, LINE_GAP)
  drawSpacedLines(doc, rightLines, rightX + 2.5, y + customerPadTop + 3.5, LINE_GAP)
  y += customerH

  // Machine details heading bar
  ensureSpace(10)
  const machineTitleH = 8
  strokeRect(doc, MARGIN, y, contentW, machineTitleH)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('Machine Details:', PAGE_W / 2, y + 5.4, { align: 'center' })
  y += machineTitleH

  const machineLeftFields = [
    `Name of the Machine/Equipment: ${textOrEmpty(report.machine_equipment_name)}`,
    `Model No.: ${textOrEmpty(report.model_no)}`,
    `Year of Installation: ${textOrEmpty(report.year_of_installation)}`,
    `R.H : ${textOrEmpty(report.rh)}${report.rh ? ' %' : ''}`,
    `Customer Training Provided: ${yesNo(report.customer_training_provided)}`,
    `AMC No.: ${textOrEmpty(report.amc_no)}`,
    `Nature of Complaint: ${textOrEmpty(report.nature_of_complaint)}`,
    `Observation: ${textOrEmpty(report.observation)}`,
    `Action Taken: ${textOrEmpty(report.action_taken)}`,
    `Result after Action Taken: ${textOrEmpty(report.result_after_action_taken)}`,
    `Spare Parts Required: ${textOrEmpty(report.spare_parts_required)}`,
    `Next Visit Required: ${textOrEmpty(report.next_visit_required)}`,
    `After Three Months: ${textOrEmpty(report.after_three_months)}`,
    `If Changeable: ${yesNo(report.if_changable)}`,
  ]

  const machineRightFields = [
    `Manufacturer: ${textOrEmpty(report.machine_manufacturer)}`,
    `Sr. No. : ${textOrEmpty(report.sr_no)}`,
    `Environment-temp: ${textOrEmpty(report.environment_temp)}${report.environment_temp ? ' °C' : ''}`,
    `Under Warrenty: ${yesNo(report.under_warrenty)}`,
    `Under AMC: ${yesNo(report.under_amc)}`,
    `Visit: ${textOrEmpty(report.visit)}`,
  ]

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.7)
  const mLeft = wrapFieldsWithGaps(doc, machineLeftFields, leftW - 5)
  const mRight = wrapFieldsWithGaps(doc, machineRightFields, rightW - 5)
  const machinePadTop = 4
  const machinePadBottom = 4
  const totalMachineLines = Math.max(mLeft.length, mRight.length)
  let machineIndex = 0

  while (machineIndex < totalMachineLines) {
    const remaining = pageBottom() - y
    const maxLines = Math.max(
      1,
      Math.floor((remaining - machinePadTop - machinePadBottom) / LINE_GAP),
    )
    if (remaining < 24 && y > MARGIN + 30) {
      ensureSpace(40)
      continue
    }

    const chunkLeft = mLeft.slice(machineIndex, machineIndex + maxLines)
    const chunkRight = mRight.slice(machineIndex, machineIndex + maxLines)
    const chunkLines = Math.max(chunkLeft.length, chunkRight.length, 1)
    const chunkH = machinePadTop + chunkLines * LINE_GAP + machinePadBottom

    if (y + chunkH > pageBottom()) {
      ensureSpace(Math.min(chunkH, 40))
      continue
    }

    strokeRect(doc, leftX, y, leftW, chunkH)
    strokeRect(doc, rightX, y, rightW, chunkH)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.7)
    drawSpacedLines(doc, chunkLeft, leftX + 2.5, y + machinePadTop + 3.2, LINE_GAP)
    drawSpacedLines(doc, chunkRight, rightX + 2.5, y + machinePadTop + 3.2, LINE_GAP)
    y += chunkH
    machineIndex += maxLines
  }

  const chargeFields = [
    `Service Charge for: ${textOrEmpty(report.service_charge)}`,
    `Lump-Charge@ ${textOrEmpty(report.lump_charge)} Service tax At Actual`,
    `Total Charge: ${textOrEmpty(report.total_charge)}`,
    buildDebitNoteLine(report),
  ]
  doc.setFontSize(9)
  const chargeWrapped = wrapFieldsWithGaps(doc, chargeFields, contentW - 5)
  drawFullWidthBlock(chargeWrapped, 9, 18)

  const remarks = `Customer Remarks: ${textOrEmpty(report.customer_remarks)}`
  const remarksLines = wrapFieldsWithGaps(doc, [remarks], contentW - 5)
  drawFullWidthBlock(remarksLines, 9, 10)

  // Place footer directly under content; only page-break if it won't fit.
  if (y + FOOTER_H > pageBottom()) {
    doc.addPage()
    y = drawReportHeader(doc, logoData, wordmarkData)
  }

  const footerY = y
  const colW = contentW / 3
  strokeRect(doc, MARGIN, footerY, colW, FOOTER_H)
  strokeRect(doc, MARGIN + colW, footerY, colW, FOOTER_H)
  strokeRect(doc, MARGIN + colW * 2, footerY, colW, FOOTER_H)

  const signerName = signer?.name?.trim() || ''
  const signerDesignation = signer?.designation?.trim() || ''
  const footerDate =
    formatPdfDate(report.date_of_report) ||
    formatPdfDate(new Date().toISOString().slice(0, 10))

  // Left column: labels. Middle: Integrate heading + aligned values only.
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

  // Right column: customer signature area.
  doc.setFont('helvetica', 'bold')
  doc.text('Customer:', MARGIN + colW * 2 + 3, footerY + 5)

  doc.save(`SIS-Report-${safePdfSlug(report.customer_name || 'report')}.pdf`)
}
