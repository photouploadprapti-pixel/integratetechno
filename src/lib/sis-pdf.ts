import { jsPDF } from 'jspdf'

import {
  drawCompanySeal,
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
  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.35)
  doc.rect(x, y - 3.2, 3.4, 3.4)
  if (checked) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(12, 41, 171)
    doc.text('✓', x + 0.55, y - 0.4)
    doc.setTextColor(0, 0, 0)
  }
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text(label, x + 5, y)
}

/**
 * Builds and downloads an S/I/S Report PDF matching the Bubble print layout.
 * @param report - S/I/S report record to render
 */
export const downloadSisReportPdf = async (report: SisReport) => {
  const [logoData, wordmarkData, sealData] = await Promise.all([
    loadImageDataUrl('/assets/logo.png'),
    loadImageDataUrl('/assets/wordmark.png'),
    loadImageDataUrl('/assets/mom/company-seal.png'),
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
  y += 8

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
  const leftLines = leftRows.flatMap((row, index) => {
    const wrapped = doc.splitTextToSize(row, leftW - 5)
    if (index === 0) {
      return wrapped
    }
    return wrapped
  })
  const rightLines = rightRows.flatMap((row) => doc.splitTextToSize(row, rightW - 5))
  const customerH = Math.max(38, Math.max(leftLines.length, rightLines.length) * 4.1 + 6)

  strokeRect(doc, leftX, y, leftW, customerH)
  strokeRect(doc, rightX, y, rightW, customerH)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9.5)
  doc.text(leftLines[0], leftX + 2.5, y + 5)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(leftLines.slice(1), leftX + 2.5, y + 9.5)
  doc.text(rightLines, rightX + 2.5, y + 5)
  y += customerH

  // Machine details heading bar
  const machineTitleH = 7
  strokeRect(doc, MARGIN, y, contentW, machineTitleH)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('Machine Details:', PAGE_W / 2, y + 4.8, { align: 'center' })
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
  const mLeft = machineLeft.flatMap((row) => doc.splitTextToSize(row, leftW - 5))
  const mRight = machineRight.flatMap((row) => doc.splitTextToSize(row, rightW - 5))
  const machineH = Math.max(62, Math.max(mLeft.length, mRight.length) * 3.9 + 5)
  strokeRect(doc, leftX, y, leftW, machineH)
  strokeRect(doc, rightX, y, rightW, machineH)
  doc.text(mLeft, leftX + 2.5, y + 4.5)
  doc.text(mRight, rightX + 2.5, y + 4.5)
  y += machineH

  const chargeLines = [
    `Service Charge for: ${textOrEmpty(report.service_charge)}`,
    `Lump-Charge@ ${textOrEmpty(report.lump_charge)} Service tax At Actual`,
    `Total Charge: ${textOrEmpty(report.total_charge)}`,
    `Debit Note to be Raised${report.debit_note_to_be_raised ? '' : ' (No)'} Number: ${textOrEmpty(report.debit_note_number)} Dt. ${textOrEmpty(report.debit_note_dt)}`,
  ]
  doc.setFontSize(9)
  const chargeWrapped = chargeLines.flatMap((line) => doc.splitTextToSize(line, contentW - 5))
  const chargeH = Math.max(16, chargeWrapped.length * 4 + 4)
  strokeRect(doc, MARGIN, y, contentW, chargeH)
  doc.text(chargeWrapped, MARGIN + 2.5, y + 4.5)
  y += chargeH

  const remarks = `Customer Remarks: ${textOrEmpty(report.customer_remarks)}`
  const remarksLines = doc.splitTextToSize(remarks, contentW - 5)
  const remarksH = Math.max(8, remarksLines.length * 4 + 4)
  strokeRect(doc, MARGIN, y, contentW, remarksH)
  doc.text(remarksLines, MARGIN + 2.5, y + 5)
  y += remarksH

  // Signature footer: 3 columns
  const footerH = Math.max(42, PAGE_H - y - MARGIN)
  const colW = contentW / 3
  strokeRect(doc, MARGIN, y, colW, footerH)
  strokeRect(doc, MARGIN + colW, y, colW, footerH)
  strokeRect(doc, MARGIN + colW * 2, y, colW, footerH)

  doc.setFontSize(9)
  doc.text(['Signature:', 'Name:', 'Designation:', 'Date:'], MARGIN + 3, y + 6)

  doc.setFont('helvetica', 'bold')
  doc.text('Integrate Techno Trade:', MARGIN + colW + 3, y + 5)
  doc.setFont('helvetica', 'normal')

  const sealSize = 26
  const sealX = MARGIN + colW + (colW - sealSize) / 2
  const sealY = y + 8
  drawCompanySeal(doc, sealData, sealX, sealY, sealSize)

  const footerDate =
    formatPdfDate(report.date_of_report) ||
    formatPdfDate(new Date().toISOString().slice(0, 10))
  doc.setFontSize(9)
  doc.text(footerDate, MARGIN + colW + colW / 2, sealY + sealSize + 5, { align: 'center' })

  doc.setFont('helvetica', 'bold')
  doc.text('Customer:', MARGIN + colW * 2 + 3, y + 5)

  doc.save(`SIS-Report-${safePdfSlug(report.customer_name || 'report')}.pdf`)
}
