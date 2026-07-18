/** Sales commission record stored in public.sales_commission. */
export interface SalesCommissionRecord {
  id: string
  lc_number: string | null
  shipment_date: string | null
  expiry_date: string | null
  manufacturer_name: string | null
  customer_name: string | null
  lc_amount: number | null
  commission_amount: number | null
  remarks: string | null
  created_by: string | null
  created_at?: string
  updated_at?: string
  /** Joined creator profile (super_admin list view). */
  creator?: {
    email: string | null
    name: string | null
  } | null
}

/** Form values for create/edit Sales Commission modal. */
export interface SalesCommissionFormValues {
  lc_number: string
  shipment_date: string
  expiry_date: string
  manufacturer_name: string
  customer_name: string
  lc_amount: string
  commission_amount: string
  remarks: string
}
