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
}
