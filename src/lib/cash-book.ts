import type {
  CashBookExpenseCategory,
  CashBookFormValues,
  CashBookRecord,
} from '@/types/cash-book'

export { formatPaymentType, paymentTypeOptions } from '@/lib/options'

/** Fixed Cash Book expense categories for forms and filters. */
export const CASH_BOOK_EXPENSE_CATEGORIES: CashBookExpenseCategory[] = [
  'Miscellaneous',
  'Car maintainance',
  'Convence',
  'Fuel cost',
  'Food (Bazar)',
  'Outside Food',
  'House Rent',
  'Internet',
  'Salary',
  'Stationary',
  'Service Charge',
  'Tour Expense',
  'Visitor Expense',
  'Tech Expenses',
  'Local Transportation',
]

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

/** Empty Cash Book form defaults. */
export const emptyCashBookFormValues = (): CashBookFormValues => ({
  date: todayInputValue(),
  payment_type: '',
  amount: '',
  details: '',
  remarks: '',
  expense_category: '',
})

/**
 * Parses a form number string into a DB numeric or null.
 * @param value - Form input string
 */
export const parseAmount = (value: string) => {
  const trimmed = value.trim()
  if (!trimmed) return null
  const parsed = Number(trimmed.replace(/,/g, ''))
  return Number.isFinite(parsed) ? parsed : null
}

/**
 * Formats a number for table display.
 * @param value - Numeric, string, or null value from Supabase
 */
export const formatAmount = (value: number | string | null) => {
  if (value === null || value === '') return '—'
  const numeric = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(numeric)) return '—'
  return numeric.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/**
 * Sums cash book amounts from a list of records.
 * @param records - Records to total
 */
export const sumCashBookAmounts = (records: CashBookRecord[]) =>
  records.reduce((total, record) => {
    const amount = typeof record.amount === 'number' ? record.amount : Number(record.amount)
    return total + (Number.isFinite(amount) ? amount : 0)
  }, 0)

/**
 * Maps a Cash Book DB row into form values.
 * @param record - Existing cash book record
 */
export const cashBookRecordToFormValues = (record: CashBookRecord): CashBookFormValues => ({
  date: record.date || todayInputValue(),
  payment_type: record.payment_type || '',
  amount:
    record.amount === null || Number.isNaN(Number(record.amount))
      ? ''
      : String(record.amount),
  details: record.details || '',
  remarks: record.remarks || '',
  expense_category: record.expense_category || '',
})
