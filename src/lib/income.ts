import type { IncomeFormValues, IncomeRecord } from '@/types/income'

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

/** Empty Income form defaults (dates default to today, matching Bubble). */
export const emptyIncomeFormValues = (): IncomeFormValues => {
  const today = todayInputValue()
  return {
    lc_no: '',
    customer: '',
    date: today,
    date_of_issue: today,
    date_of_ship: today,
    date_of_export: today,
    manufacturer: '',
    amount: '',
    commission: '',
    bank: '',
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
export const parseIncomeNumber = (value: string) => {
  const trimmed = value.trim()
  if (!trimmed) return null
  const parsed = Number(trimmed.replace(/,/g, ''))
  return Number.isFinite(parsed) ? parsed : null
}

/**
 * Maps an Income DB row into form values.
 * @param record - Existing income record
 */
export const incomeRecordToFormValues = (record: IncomeRecord): IncomeFormValues => ({
  lc_no: record.lc_no || '',
  customer: record.customer || '',
  date: record.date || '',
  date_of_issue: record.date_of_issue || '',
  date_of_ship: record.date_of_ship || '',
  date_of_export: record.date_of_export || '',
  manufacturer: record.manufacturer || '',
  amount: numberToInput(record.amount),
  commission: numberToInput(record.commission),
  bank: record.bank || '',
  remarks: record.remarks || '',
})

/** Bank select options for the Income form. */
export { bankOptions as incomeBankOptions } from '@/lib/options'

/**
 * Formats a number for table display.
 * @param value - Numeric, string, or null value from Supabase
 */
export const formatMoney = (value: number | string | null) => {
  if (value === null || value === '') return '—'
  const numeric = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(numeric)) return '—'
  return numeric.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
