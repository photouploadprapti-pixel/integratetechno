/** Payment type matching public.payment_type. */
export type PaymentType = 'cheque' | 'cash'

/** Cash book record stored in public.cash_book. */
export interface CashBookRecord {
  id: string
  date: string | null
  payment_type: PaymentType | null
  amount: number | null
  details: string | null
  remarks: string | null
  created_at?: string
  updated_at?: string
}

/** Form values for create/edit Cash Book modal. */
export interface CashBookFormValues {
  date: string
  payment_type: PaymentType | ''
  amount: string
  details: string
  remarks: string
}
