import type { MomReport, MomReportFormValues } from '@/types/mom'

/** Empty MOM form defaults. */
export const emptyMomFormValues = (): MomReportFormValues => ({
  company_name: '',
  company_address: '',
  mom_date: '',
  technicians_txt: '',
  type_of_machine: '',
  machine_no: '',
  machine_warrenty: false,
  type_of_visit: '',
  starting_date: '',
  ending_date: '',
  days_taken: '',
  installation_report: '',
  conclusion: '',
  note: '',
})

/**
 * Maps a MOM DB row into form values.
 * @param report - Existing MOM report
 */
export const momReportToFormValues = (report: MomReport): MomReportFormValues => ({
  company_name: report.company_name || '',
  company_address: report.company_address || '',
  mom_date: report.mom_date || '',
  technicians_txt: report.technicians_txt || '',
  type_of_machine: report.type_of_machine || '',
  machine_no: report.machine_no || '',
  machine_warrenty: Boolean(report.machine_warrenty),
  type_of_visit: report.type_of_visit || '',
  starting_date: report.starting_date || '',
  ending_date: report.ending_date || '',
  days_taken: report.days_taken || '',
  installation_report: report.installation_report || '',
  conclusion: report.conclusion || '',
  note: report.note || '',
})

/**
 * Formats an ISO date string for table display.
 * @param value - YYYY-MM-DD date string
 */
export const formatDisplayDate = (value: string | null) => {
  if (!value) return '—'
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/**
 * Computes inclusive day count between two YYYY-MM-DD dates.
 * @param start - Start date
 * @param end - End date
 */
export const computeDaysTaken = (start: string, end: string) => {
  if (!start || !end) return ''
  const startDate = new Date(`${start}T00:00:00`)
  const endDate = new Date(`${end}T00:00:00`)
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return ''
  const diffMs = endDate.getTime() - startDate.getTime()
  if (diffMs < 0) return ''
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  return `${days} day${days === 1 ? '' : 's'}`
}
