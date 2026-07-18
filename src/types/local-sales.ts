/** Local sales record stored in public.local_sales. */
export interface LocalSalesRecord {
  id: string
  delivery_date: string | null
  manufacturer_name: string | null
  customer_name: string | null
  purchase_amount: number | null
  sales_amount: number | null
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

/** Form values for create/edit Local Sales modal. */
export interface LocalSalesFormValues {
  delivery_date: string
  manufacturer_name: string
  customer_name: string
  purchase_amount: string
  sales_amount: string
  commission_amount: string
  remarks: string
}
