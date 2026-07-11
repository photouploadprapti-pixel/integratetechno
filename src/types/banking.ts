import type { IncomeBank } from '@/types/income'
import type { PaymentType } from '@/types/cash-book'

/** Banking / bank_stat record stored in public.bank_stat. */
export interface BankingRecord {
  id: string
  date: string | null
  payment_type: PaymentType | null
  amount: number | null
  bank_name: IncomeBank | null
  remarks: string | null
  received: boolean
  income_per_annum_id?: string | null
  created_at?: string
  updated_at?: string
}

/** Form values for create/edit Banking modal. */
export interface BankingFormValues {
  date: string
  payment_type: PaymentType | ''
  amount: string
  bank_name: IncomeBank | ''
  remarks: string
  received: boolean
}
