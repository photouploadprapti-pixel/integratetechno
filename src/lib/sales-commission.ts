import type {
  SalesCommissionFormValues,
  SalesCommissionRecord,
} from '@/types/sales-commission'

/**
 * Returns today's date as YYYY-MM-DD for date inputs.
 */
const todayInputValue = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Empty Sales Commission form defaults. */
export const emptySalesCommissionFormValues = (): SalesCommissionFormValues => {
  const today = todayInputValue()
  return {
    lc_number: '',
    shipment_date: today,
    expiry_date: today,
    manufacturer_name: '',
    customer_name: '',
    lc_amount: '',
    commission_amount: '',
    remarks: '',
  }
}

/**
 * Maps a numeric DB value into a form-friendly string.
 * @param value - Numeric or null value
 */
const numberToInput = (value: number | null) => {
  if (value === null || Number.isNaN(value)) return ''
  return String(value)
}

/**
 * Parses a form number string into a DB numeric or null.
 * @param value - Form input string
 */
export const parseSalesCommissionNumber = (value: string) => {
  const trimmed = value.trim()
  if (!trimmed) return null
  const parsed = Number(trimmed.replace(/,/g, ''))
  return Number.isFinite(parsed) ? parsed : null
}

/**
 * Maps a Sales Commission DB row into form values.
 * @param record - Existing sales commission record
 */
export const salesCommissionToFormValues = (
  record: SalesCommissionRecord,
): SalesCommissionFormValues => ({
  lc_number: record.lc_number || '',
  shipment_date: record.shipment_date || '',
  expiry_date: record.expiry_date || '',
  manufacturer_name: record.manufacturer_name || '',
  customer_name: record.customer_name || '',
  lc_amount: numberToInput(record.lc_amount),
  commission_amount: numberToInput(record.commission_amount),
  remarks: record.remarks || '',
})

/**
 * Formats a number for table display.
 * @param value - Numeric, string, or null value from Supabase
 */
export const formatSalesCommissionMoney = (value: number | string | null) => {
  if (value === null || value === '') return '—'
  const numeric = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(numeric)) return '—'
  return numeric.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/**
 * Resolves the creator email for super_admin display.
 * @param record - Sales commission row with optional creator join
 */
export const getCreatorEmail = (record: SalesCommissionRecord) => {
  const email = record.creator?.email?.trim()
  if (email) return email
  return '—'
}
