/** Payment type matching public.payment_type. */
export type PaymentType = 'cheque' | 'cash'

/** Expense categories for Cash Book filtering and reporting. */
export type CashBookExpenseCategory =
  | 'Miscellaneous'
  | 'Car maintainance'
  | 'Convence'
  | 'Fuel cost'
  | 'Food (Bazar)'
  | 'Outside Food'
  | 'House Rent'
  | 'Internet'
  | 'Salary'
  | 'Stationary'
  | 'Service Charge'
  | 'Tour Expense'
  | 'Visitor Expense'
  | 'Tech Expenses'
  | 'Local Transportation'

/** Cash book record stored in public.cash_book. */
export interface CashBookRecord {
  id: string
  date: string | null
  payment_type: PaymentType | null
  amount: number | null
  details: string | null
  remarks: string | null
  expense_category: CashBookExpenseCategory | null
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
  expense_category: CashBookExpenseCategory | ''
}
