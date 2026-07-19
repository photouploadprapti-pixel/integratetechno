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
/** Comfortable vertical gap between field lines (mm). */
const LINE_GAP = 5.2
/** Slightly tighter gap for denser machine-detail rows. */
const MACHINE_LINE_GAP = 4.8

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
 * Wraps each source row into lines that fit the given width.
 * @param doc - jsPDF instance
 * @param rows - Source text rows
 * @param maxWidth - Max line width in mm
 */
const wrapRows = (doc: jsPDF, rows: string[], maxWidth: number) =>
  rows.flatMap((row) => doc.splitTextToSize(row, maxWidth) as string[])

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
    doc.text(line, x, startY + index * lineGap)
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

/** Optional signer details autofilled from the logged-in staff directory. */
export interface SisPdfSigner {
  name: string
  designation: string
}

/**
 * Builds and downloads an S/I/S Report PDF matching the Bubble print layout.
 * Uses comfortable line spacing and leaves blank space for a manual seal/signature.
 * @param report - S/I/S report record to render
 * @param signer - Optional Name/Designation for the left footer column
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
  let y = drawReportHeader(doc, logoData, wordmarkData)

  const types = normalizeServiceTypes(report.service_type)
  const has = (type: SisServiceType) => types.includes(type)

  // Report type checkboxes
  const optionY = y + 1
  drawCheckOption(doc, MARGIN + 28, optionY, 'Service', has('service'))
  drawCheckOption(doc, MARGIN + 72, optionY, 'Installation', has('installation'))
  drawCheckOption(doc, MARGIN + 128, optionY, 'Sales Report', has('sales_report'))
  y += 10

  const leftW = contentW * 0.55
  const rightW = contentW - leftW
  const leftX = MARGIN
  const rightX = MARGIN + leftW

  const leftRows = [
    'Customer Details:',
    `Customer Name: ${textOrEmpty(report.customer_name)}`,
    `Location: ${textOrEmpty(report.location)}`,
    `Contact Person: ${textOrEmpty(report.contact_person)}`,
    `Depart & Designation: ${textOrEmpty(report.dept_designation)}`,
    `Email: ${textOrEmpty(report.email)}`,
    `Phone: ${textOrEmpty(report.phone)}`,
  ]

  const rightRows = [
    `Report No.: ${textOrEmpty(report.report_no)}`,
    `Date of Report: ${formatPdfDate(report.date_of_report)}`,
    `Time Work Start On: ${formatPdfDate(report.work_starting_date)}`,
    `Time Work End On: ${formatPdfDate(report.work_ending_date)}`,
    `Date of MOM: ${formatPdfDate(report.mom_date)}`,
  ]

  doc.setFontSize(9)
  const leftLines = wrapRows(doc, leftRows, leftW - 5)
  const rightLines = wrapRows(doc, rightRows, rightW - 5)
  const customerPadTop = 4
  const customerPadBottom = 4
  const customerH = Math.max(
    42,
    customerPadTop +
      Math.max(leftLines.length, rightLines.length) * LINE_GAP +
      customerPadBottom,
  )

  strokeRect(doc, leftX, y, leftW, customerH)
  strokeRect(doc, rightX, y, rightW, customerH)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9.5)
  doc.text(leftLines[0], leftX + 2.5, y + customerPadTop + 3.5)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  drawSpacedLines(doc, leftLines.slice(1), leftX + 2.5, y + customerPadTop + 3.5 + LINE_GAP, LINE_GAP)
  drawSpacedLines(doc, rightLines, rightX + 2.5, y + customerPadTop + 3.5, LINE_GAP)
  y += customerH

  // Machine details heading bar
  const machineTitleH = 8
  strokeRect(doc, MARGIN, y, contentW, machineTitleH)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('Machine Details:', PAGE_W / 2, y + 5.4, { align: 'center' })
  y += machineTitleH

  const machineLeft = [
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

  const machineRight = [
    `Manufacturer: ${textOrEmpty(report.machine_manufacturer)}`,
    `Sr. No. : ${textOrEmpty(report.sr_no)}`,
    `Environment-temp: ${textOrEmpty(report.environment_temp)}${report.environment_temp ? ' °C' : ''}`,
    `Under Warrenty: ${yesNo(report.under_warrenty)}`,
    `Under AMC: ${yesNo(report.under_amc)}`,
    `Visit: ${textOrEmpty(report.visit)}`,
  ]

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.7)
  const mLeft = wrapRows(doc, machineLeft, leftW - 5)
  const mRight = wrapRows(doc, machineRight, rightW - 5)
  const machinePadTop = 4
  const machinePadBottom = 4
  const machineH = Math.max(
    68,
    machinePadTop +
      Math.max(mLeft.length, mRight.length) * MACHINE_LINE_GAP +
      machinePadBottom,
  )
  strokeRect(doc, leftX, y, leftW, machineH)
  strokeRect(doc, rightX, y, rightW, machineH)
  drawSpacedLines(doc, mLeft, leftX + 2.5, y + machinePadTop + 3.2, MACHINE_LINE_GAP)
  drawSpacedLines(doc, mRight, rightX + 2.5, y + machinePadTop + 3.2, MACHINE_LINE_GAP)
  y += machineH

  const chargeLines = [
    `Service Charge for: ${textOrEmpty(report.service_charge)}`,
    `Lump-Charge@ ${textOrEmpty(report.lump_charge)} Service tax At Actual`,
    `Total Charge: ${textOrEmpty(report.total_charge)}`,
    `Debit Note to be Raised${report.debit_note_to_be_raised ? '' : ' (No)'} Number: ${textOrEmpty(report.debit_note_number)} Dt. ${textOrEmpty(report.debit_note_dt)}`,
  ]
  doc.setFontSize(9)
  const chargeWrapped = wrapRows(doc, chargeLines, contentW - 5)
  const chargePadTop = 4
  const chargePadBottom = 4
  const chargeH = Math.max(
    20,
    chargePadTop + chargeWrapped.length * LINE_GAP + chargePadBottom,
  )
  strokeRect(doc, MARGIN, y, contentW, chargeH)
  drawSpacedLines(doc, chargeWrapped, MARGIN + 2.5, y + chargePadTop + 3.2, LINE_GAP)
  y += chargeH

  const remarks = `Customer Remarks: ${textOrEmpty(report.customer_remarks)}`
  const remarksLines = wrapRows(doc, [remarks], contentW - 5)
  const remarksPadTop = 4
  const remarksPadBottom = 4
  const remarksH = Math.max(
    10,
    remarksPadTop + remarksLines.length * LINE_GAP + remarksPadBottom,
  )
  strokeRect(doc, MARGIN, y, contentW, remarksH)
  drawSpacedLines(doc, remarksLines, MARGIN + 2.5, y + remarksPadTop + 3.2, LINE_GAP)
  y += remarksH

  // Signature footer: 3 columns — middle column left blank for manual seal/signature
  const footerH = Math.max(48, PAGE_H - y - MARGIN)
  const colW = contentW / 3
  strokeRect(doc, MARGIN, y, colW, footerH)
  strokeRect(doc, MARGIN + colW, y, colW, footerH)
  strokeRect(doc, MARGIN + colW * 2, y, colW, footerH)

  const signerName = signer?.name?.trim() || ''
  const signerDesignation = signer?.designation?.trim() || ''
  const footerDate =
    formatPdfDate(report.date_of_report) ||
    formatPdfDate(new Date().toISOString().slice(0, 10))

  // Left column: Name + Designation on top, Signature with room, Date at bottom.
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  const leftPadX = MARGIN + 3
  const leftTopY = y + 6
  doc.text(`Name: ${signerName}`, leftPadX, leftTopY)
  doc.text(`Designation: ${signerDesignation}`, leftPadX, leftTopY + 5.5)
  doc.text('Signature:', leftPadX, leftTopY + 12)
  doc.text(`Date: ${footerDate}`, leftPadX, y + footerH - 5)

  doc.setFont('helvetica', 'bold')
  doc.text('Integrate Techno Trade:', MARGIN + colW + 3, y + 6)
  doc.setFont('helvetica', 'normal')

  // Reserve blank space in the middle column for manual seal + signature.
  const sealSize = 26
  const sealY = y + 10
  doc.setFontSize(9)
  doc.text(footerDate, MARGIN + colW + colW / 2, sealY + sealSize + 5, { align: 'center' })

  doc.setFont('helvetica', 'bold')
  doc.text('Customer:', MARGIN + colW * 2 + 3, y + 6)

  doc.save(`SIS-Report-${safePdfSlug(report.customer_name || 'report')}.pdf`)
}
