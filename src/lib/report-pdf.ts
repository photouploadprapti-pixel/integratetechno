import { jsPDF } from 'jspdf'

/** Shared company header info for admin report PDFs. */
export const REPORT_COMPANY = {
  name: 'Integrate Techno Trade',
  address: 'House #01, Sonargaon Janapath Road, Sector#13, Uttara, Dhaka -1230',
  contact: 'Phone: 09678800195, Cell: +88 01755615339, e-mail: integrate@integratebd.com',
  toPhone: '01952042276',
}

/**
 * Formats a YYYY-MM-DD value as DD/MM/YYYY for report PDFs.
 * @param value - ISO date string or null
 */
export const formatPdfDate = (value: string | null | undefined) => {
  if (!value) return ''
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
  if (!match) return value
  return `${match[3]}/${match[2]}/${match[1]}`
}

/**
 * Loads a public image as a base64 data URL for jsPDF.
 * @param src - Public asset path
 */
export const loadImageDataUrl = async (src: string) => {
  const response = await fetch(src)
  if (!response.ok) {
    throw new Error(`Failed to load image: ${src}`)
  }
  const blob = await response.blob()
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error(`Failed to read image: ${src}`))
    reader.readAsDataURL(blob)
  })
}

/**
 * Draws a bordered rectangle on a PDF page.
 * @param doc - jsPDF instance
 * @param x - Left
 * @param y - Top
 * @param w - Width
 * @param h - Height
 */
export const strokeRect = (doc: jsPDF, x: number, y: number, w: number, h: number) => {
  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.3)
  doc.rect(x, y, w, h)
}

/**
 * Draws the shared Integrate Techno Trade PDF header.
 * @param doc - jsPDF instance
 * @param logoData - Logo data URL
 * @param wordmarkData - Wordmark data URL
 * @returns Y position below the header rule
 */
export const drawReportHeader = (
  doc: jsPDF,
  logoData: string,
  wordmarkData: string,
) => {
  const pageW = doc.internal.pageSize.getWidth()
  let y = 10
  const logoSize = 16
  doc.addImage(logoData, 'PNG', pageW / 2 - logoSize / 2 - 26, y, logoSize, logoSize)
  doc.addImage(wordmarkData, 'PNG', pageW / 2 - 16, y + 3.5, 48, 8.5)
  y += 20

  doc.setTextColor(20, 20, 20)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text(REPORT_COMPANY.address, pageW / 2, y, { align: 'center' })
  y += 4
  doc.text(REPORT_COMPANY.contact, pageW / 2, y, { align: 'center' })
  y += 4.5

  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.45)
  doc.line(14, y, pageW - 14, y)
  return y + 5
}

/**
 * Draws a circular company seal at a fixed square size (no squish).
 * @param doc - jsPDF instance
 * @param sealData - Seal image data URL
 * @param x - Left
 * @param y - Top
 * @param sizeMm - Square size in mm
 */
export const drawCompanySeal = (
  doc: jsPDF,
  sealData: string,
  x: number,
  y: number,
  sizeMm = 28,
) => {
  doc.addImage(sealData, 'PNG', x, y, sizeMm, sizeMm)
}

/**
 * Builds a filesystem-safe PDF filename fragment.
 * @param value - Source name
 */
export const safePdfSlug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'report'
