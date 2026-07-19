import { getStaffNameByEmail } from '@/lib/staff-directory'
import type { LocalSalesFormValues, LocalSalesRecord } from '@/types/local-sales'

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

/** Empty Local Sales form defaults. */
export const emptyLocalSalesFormValues = (): LocalSalesFormValues => {
  const today = todayInputValue()
  return {
    delivery_date: today,
    manufacturer_name: '',
    customer_name: '',
    purchase_amount: '',
    sales_amount: '',
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
export const parseLocalSalesNumber = (value: string) => {
  const trimmed = value.trim()
  if (!trimmed) return null
  const parsed = Number(trimmed.replace(/,/g, ''))
  return Number.isFinite(parsed) ? parsed : null
}

/**
 * Computes commission as sales amount minus purchase amount.
 * @param purchaseAmount - Purchase amount form string
 * @param salesAmount - Sales amount form string
 */
export const computeCommissionAmount = (purchaseAmount: string, salesAmount: string) => {
  const purchase = parseLocalSalesNumber(purchaseAmount)
  const sales = parseLocalSalesNumber(salesAmount)
  if (purchase === null || sales === null) return ''
  const commission = sales - purchase
  return Number.isFinite(commission) ? String(commission) : ''
}

/**
 * Maps a Local Sales DB row into form values.
 * @param record - Existing local sales record
 */
export const localSalesToFormValues = (record: LocalSalesRecord): LocalSalesFormValues => ({
  delivery_date: record.delivery_date || '',
  manufacturer_name: record.manufacturer_name || '',
  customer_name: record.customer_name || '',
  purchase_amount: numberToInput(record.purchase_amount),
  sales_amount: numberToInput(record.sales_amount),
  commission_amount: numberToInput(record.commission_amount),
  remarks: record.remarks || '',
})

/**
 * Formats a number for table display.
 * @param value - Numeric, string, or null value from Supabase
 */
export const formatLocalSalesMoney = (value: number | string | null) => {
  if (value === null || value === '') return '—'
  const numeric = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(numeric)) return '—'
  return numeric.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/**
 * Resolves the creator display name for super_admin list view.
 * Prefers staff directory name from creator email, then joined profile name.
 * @param record - Local sales row with optional creator join
 */
export const getLocalSalesCreatorName = (record: LocalSalesRecord) => {
  const fromDirectory = getStaffNameByEmail(record.creator?.email)
  if (fromDirectory) return fromDirectory
  const name = record.creator?.name?.trim()
  if (name) return name
  return '—'
}
