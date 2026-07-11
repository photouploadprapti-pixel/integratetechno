/** Bank options matching public.bank_name. */
export type IncomeBank = 'ebl' | 'brac_bank' | 'city_bank' | 'ab_bank'

/** Income per annum record stored in public.income_per_annum. */
export interface IncomeRecord {
  id: string
  date: string | null
  lc_no: string | null
  date_of_issue: string | null
  date_of_ship: string | null
  date_of_export: string | null
  customer: string | null
  manufacturer: string | null
  amount: number | null
  commission: number | null
  bank: IncomeBank | null
  remarks: string | null
  created_at?: string
  updated_at?: string
}

/** Form values for create/edit Income modal. */
export interface IncomeFormValues {
  lc_no: string
  customer: string
  date: string
  date_of_issue: string
  date_of_ship: string
  date_of_export: string
  manufacturer: string
  amount: string
  commission: string
  bank: IncomeBank | ''
  remarks: string
}
