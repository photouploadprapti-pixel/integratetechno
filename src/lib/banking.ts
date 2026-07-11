import type { BankingFormValues, BankingRecord } from '@/types/banking'

export { bankOptions as bankingBankOptions, formatBankName } from '@/lib/options'

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

/** Empty Banking form defaults. */
export const emptyBankingFormValues = (): BankingFormValues => ({
  date: todayInputValue(),
  payment_type: '',
  amount: '',
  bank_name: '',
  remarks: '',
  received: false,
})

/**
 * Maps a Banking DB row into form values.
 * @param record - Existing banking record
 */
export const bankingRecordToFormValues = (record: BankingRecord): BankingFormValues => ({
  date: record.date || todayInputValue(),
  payment_type: record.payment_type || '',
  amount:
    record.amount === null || Number.isNaN(Number(record.amount))
      ? ''
      : String(record.amount),
  bank_name: record.bank_name || '',
  remarks: record.remarks || '',
  received: Boolean(record.received),
})
