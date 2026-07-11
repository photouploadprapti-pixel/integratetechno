import type { SisReport, SisReportFormValues, SisServiceType } from '@/types/sis'

const validServiceTypes: SisServiceType[] = ['service', 'installation', 'sales_report']

/**
 * Normalizes a DB service_type value into a typed array.
 * @param value - Single enum, array, or null from Supabase
 */
export const normalizeServiceTypes = (value: unknown): SisServiceType[] => {
  if (Array.isArray(value)) {
    return value.filter((item): item is SisServiceType =>
      validServiceTypes.includes(item as SisServiceType),
    )
  }
  if (typeof value === 'string' && validServiceTypes.includes(value as SisServiceType)) {
    return [value as SisServiceType]
  }
  return []
}

/** Empty S/I/S form defaults. */
export const emptySisFormValues = (): SisReportFormValues => ({
  service_type: ['service'],
  customer_name: '',
  location: '',
  report_no: '',
  date_of_report: '',
  work_starting_date: '',
  work_ending_date: '',
  mom_date: '',
  contact_person: '',
  dept_designation: '',
  email: '',
  phone: '',
  machine_equipment_name: '',
  machine_manufacturer: '',
  model_no: '',
  sr_no: '',
  year_of_installation: '',
  under_warrenty: false,
  customer_training_provided: false,
  under_amc: false,
  environment_temp: '',
  rh: '',
  amc_no: '',
  visit: '',
  nature_of_complaint: '',
  observation: '',
  action_taken: '',
  result_after_action_taken: '',
  spare_parts_required: '',
  next_visit_required: '',
  after_three_months: '',
  if_changable: false,
  service_charge: '',
  lump_charge: '',
  total_charge: '',
  debit_note_to_be_raised: false,
  debit_note_number: '',
  debit_note_dt: '',
  customer_remarks: '',
})

/**
 * Maps a numeric DB value into a form-friendly string.
 * @param value - Numeric or null value
 */
const numberToInput = (value: number | null) => {
  if (value === null || Number.isNaN(value)) return ''
  return String(value)
}

/**
 * Parses a form number string into a DB numeric or null.
 * @param value - Form input string
 */
export const parseOptionalNumber = (value: string) => {
  const trimmed = value.trim()
  if (!trimmed) return null
  const parsed = Number(trimmed.replace(/,/g, ''))
  return Number.isFinite(parsed) ? parsed : null
}

/**
 * Maps an S/I/S DB row into form values.
 * @param report - Existing S/I/S report
 */
export const sisReportToFormValues = (report: SisReport): SisReportFormValues => {
  const types = normalizeServiceTypes(report.service_type)
  return {
    service_type: types.length > 0 ? types : ['service'],
    customer_name: report.customer_name || '',
    location: report.location || '',
    report_no: report.report_no || '',
    date_of_report: report.date_of_report || '',
    work_starting_date: report.work_starting_date || '',
    work_ending_date: report.work_ending_date || '',
    mom_date: report.mom_date || '',
    contact_person: report.contact_person || '',
    dept_designation: report.dept_designation || '',
    email: report.email || '',
    phone: report.phone || '',
    machine_equipment_name: report.machine_equipment_name || '',
    machine_manufacturer: report.machine_manufacturer || '',
    model_no: report.model_no || '',
    sr_no: report.sr_no || '',
    year_of_installation: report.year_of_installation || '',
    under_warrenty: Boolean(report.under_warrenty),
    customer_training_provided: Boolean(report.customer_training_provided),
    under_amc: Boolean(report.under_amc),
    environment_temp: report.environment_temp || '',
    rh: report.rh || '',
    amc_no: report.amc_no || '',
    visit: report.visit || '',
    nature_of_complaint: report.nature_of_complaint || '',
    observation: report.observation || '',
    action_taken: report.action_taken || '',
    result_after_action_taken: report.result_after_action_taken || '',
    spare_parts_required: report.spare_parts_required || '',
    next_visit_required: report.next_visit_required || '',
    after_three_months: report.after_three_months || '',
    if_changable: Boolean(report.if_changable),
    service_charge: numberToInput(report.service_charge),
    lump_charge: numberToInput(report.lump_charge),
    total_charge: numberToInput(report.total_charge),
    debit_note_to_be_raised: Boolean(report.debit_note_to_be_raised),
    debit_note_number: report.debit_note_number || '',
    debit_note_dt: report.debit_note_dt || '',
    customer_remarks: report.customer_remarks || '',
  }
}

/**
 * Human label for a single service type enum value.
 * @param type - Service type
 */
export const sisServiceTypeLabel = (type: SisServiceType | null) => {
  if (type === 'installation') return 'Installation'
  if (type === 'sales_report') return 'Sales Report'
  if (type === 'service') return 'Service'
  return '—'
}

/**
 * Joined labels for one or more report types.
 * @param types - Service type array or null
 */
export const sisServiceTypesLabel = (types: SisServiceType[] | null) => {
  const normalized = normalizeServiceTypes(types)
  if (normalized.length === 0) return '—'
  return normalized.map((item) => sisServiceTypeLabel(item)).join(', ')
}

/**
 * Toggles a report type in a multi-select list.
 * @param current - Currently selected types
 * @param value - Type to add or remove
 */
export const toggleServiceType = (
  current: SisServiceType[],
  value: SisServiceType,
): SisServiceType[] => {
  if (current.includes(value)) {
    return current.filter((type) => type !== value)
  }
  return [...current, value]
}
