/** MOM report record stored in public.mom_report. */
export interface MomReport {
  id: string
  company_name: string | null
  company_address: string | null
  type_of_machine: string | null
  machine_no: string | null
  type_of_visit: string | null
  starting_date: string | null
  ending_date: string | null
  days_taken: string | null
  technicians_txt: string | null
  mom_date: string | null
  note: string | null
  conclusion: string | null
  installation_report: string | null
  machine_warrenty: boolean
  /** Customer Remarks shown above the PDF signature footer. */
  customer_remarks: string | null
  /** Integrate Techno Trade signer name on the PDF footer. */
  signer_name: string | null
  /** Integrate Techno Trade signer designation on the PDF footer. */
  signer_designation: string | null
  /** Date shown in the Integrate Techno Trade PDF footer column. */
  signer_date: string | null
  /** Customer signer name on the PDF footer. */
  customer_signer_name: string | null
  /** Customer signer designation on the PDF footer. */
  customer_signer_designation: string | null
  /** Date shown in the Customer PDF footer column. */
  customer_signer_date: string | null
  created_at?: string
  updated_at?: string
}

/** Form values for create/edit MOM modal. */
export interface MomReportFormValues {
  company_name: string
  company_address: string
  mom_date: string
  technicians_txt: string
  type_of_machine: string
  machine_no: string
  machine_warrenty: boolean
  type_of_visit: string
  starting_date: string
  ending_date: string
  days_taken: string
  installation_report: string
  conclusion: string
  note: string
  customer_remarks: string
  signer_name: string
  signer_designation: string
  signer_date: string
  customer_signer_name: string
  customer_signer_designation: string
  customer_signer_date: string
}
