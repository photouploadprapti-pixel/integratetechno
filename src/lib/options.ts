import type { PaymentType } from '@/types/cash-book'
import type { IncomeBank } from '@/types/income'

/** Payment Type options for Cash Book + Banking dropdowns. */
export const paymentTypeOptions: { value: PaymentType; label: string }[] = [
  { value: 'cheque', label: 'Cheque' },
  { value: 'cash', label: 'Cash' },
]

/** Bank options for Banking + Income dropdowns. */
export const bankOptions: { value: IncomeBank; label: string }[] = [
  { value: 'ebl', label: 'EBL' },
  { value: 'brac_bank', label: 'Brac Bank' },
  { value: 'city_bank', label: 'City Bank' },
  { value: 'ab_bank', label: 'AB Bank' },
]

/**
 * Human-readable payment type label.
 * @param value - Payment type enum or null
 */
export const formatPaymentType = (value: PaymentType | null) => {
  if (!value) return '—'
  const match = paymentTypeOptions.find((option) => option.value === value)
  return match?.label || value
}

/**
 * Human-readable bank name label.
 * @param value - Bank enum or null
 */
export const formatBankName = (value: IncomeBank | null) => {
  if (!value) return '—'
  const match = bankOptions.find((option) => option.value === value)
  return match?.label || value
}
