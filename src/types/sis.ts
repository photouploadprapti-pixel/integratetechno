/** Service type options matching public.service_type. */
export type SisServiceType = 'service' | 'installation' | 'sales_report'

/** S/I/S report record stored in public.s_i_s_report. */
export interface SisReport {
  id: string
  customer_name: string | null
  machine_equipment_name: string | null
  model_no: string | null
  machine_manufacturer: string | null
  date_of_report: string | null
  contact_person: string | null
  phone: string | null
  email: string | null
  location: string | null
  sr_no: string | null
  report_no: string | null
  amc_no: string | null
  visit: string | null
  rh: string | null
  mom_date: string | null
  observation: string | null
  action_taken: string | null
  result_after_action_taken: string | null
  nature_of_complaint: string | null
  next_visit_required: string | null
  spare_parts_required: string | null
  year_of_installation: string | null
  environment_temp: string | null
  after_three_months: string | null
  dept_designation: string | null
  customer_remarks: string | null
  debit_note_dt: string | null
  debit_note_number: string | null
  work_starting_date: string | null
  work_ending_date: string | null
  service_charge: number | null
  lump_charge: number | null
  total_charge: number | null
  under_amc: boolean
  under_warrenty: boolean
  if_changable: boolean
  debit_note_to_be_raised: boolean
  customer_training_provided: boolean
  /** One or more report types: Service, Installation, Sales Report. */
  service_type: SisServiceType[] | null
  created_at?: string
  updated_at?: string
}

/** Form values for create/edit S/I/S modal. */
export interface SisReportFormValues {
  service_type: SisServiceType[]
  customer_name: string
  location: string
  report_no: string
  date_of_report: string
  work_starting_date: string
  work_ending_date: string
  mom_date: string
  contact_person: string
  dept_designation: string
  email: string
  phone: string
  machine_equipment_name: string
  machine_manufacturer: string
  model_no: string
  sr_no: string
  year_of_installation: string
  under_warrenty: boolean
  customer_training_provided: boolean
  under_amc: boolean
  environment_temp: string
  rh: string
  amc_no: string
  visit: string
  nature_of_complaint: string
  observation: string
  action_taken: string
  result_after_action_taken: string
  spare_parts_required: string
  next_visit_required: string
  after_three_months: string
  if_changable: boolean
  service_charge: string
  lump_charge: string
  total_charge: string
  debit_note_to_be_raised: boolean
  debit_note_number: string
  debit_note_dt: string
  customer_remarks: string
}
