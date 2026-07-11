'use client'

import { useEffect, useId, useState, type FormEvent, type ReactNode } from 'react'

import { emptySisFormValues, sisReportToFormValues, toggleServiceType } from '@/lib/sis'
import { cn } from '@/lib/utils'
import type { SisReport, SisReportFormValues, SisServiceType } from '@/types/sis'

const inputClassName =
  'min-h-11 w-full rounded-xl border border-[#dbe2f0] bg-[#f8faff] px-3 text-sm text-[#1a1a1a] outline-none transition-colors placeholder:text-[#9aa3b5] focus:border-[#0c29ab] focus:bg-white'

const serviceTypeOptions: { value: SisServiceType; label: string }[] = [
  { value: 'service', label: 'Service' },
  { value: 'installation', label: 'Installation' },
  { value: 'sales_report', label: 'Sales Report' },
]

/**
 * Polished create/edit modal for S/I/S reports.
 * @param open - Whether the modal is visible
 * @param mode - create or edit
 * @param initialReport - Existing report when editing
 * @param saving - Submit in progress
 * @param error - Error message to display
 * @param onClose - Close handler
 * @param onSubmit - Save handler with form values
 */
export const SisReportModal = ({
  open,
  mode,
  initialReport,
  saving,
  error,
  onClose,
  onSubmit,
}: {
  open: boolean
  mode: 'create' | 'edit'
  initialReport: SisReport | null
  saving: boolean
  error: string
  onClose: () => void
  onSubmit: (values: SisReportFormValues) => Promise<void>
}) => {
  const titleId = useId()
  const [values, setValues] = useState<SisReportFormValues>(emptySisFormValues())

  useEffect(() => {
    if (!open) return
    setValues(
      mode === 'edit' && initialReport
        ? sisReportToFormValues(initialReport)
        : emptySisFormValues(),
    )
  }, [open, mode, initialReport])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !saving) onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, saving, onClose])

  if (!open) return null

  /**
   * Updates one form field.
   * @param key - Form field key
   * @param value - New value
   */
  const updateField = <K extends keyof SisReportFormValues>(
    key: K,
    value: SisReportFormValues[K],
  ) => {
    setValues((current) => ({ ...current, [key]: value }))
  }

  /**
   * Handles modal form submit.
   * @param event - Form submit event
   */
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await onSubmit(values)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto p-0 sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Close modal backdrop"
        className="absolute inset-0 bg-[#0b1b4a]/45 backdrop-blur-[2px]"
        onClick={() => {
          if (!saving) onClose()
        }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 my-0 w-full max-w-4xl max-h-[min(100dvh,100%)] overflow-hidden rounded-t-[24px] border border-[#e4e9f4] bg-white shadow-[0_24px_80px_rgba(12,41,171,0.22)] sm:my-4 sm:max-h-[90vh] sm:rounded-[24px]"
      >
        <div className="border-b border-[#eef1f7] bg-[linear-gradient(135deg,#0c29ab_0%,#2c3d94_100%)] px-5 py-4 text-white sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/70">
                S/I/S Report
              </p>
              <h2 id={titleId} className="mt-1 font-[family-name:var(--font-righteous)] text-xl">
                {mode === 'create' ? 'Create S/I/S Report' : 'Edit S/I/S Report'}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-full bg-white/15 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/25 disabled:opacity-60"
            >
              Close
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[calc(100dvh-7rem)] overflow-y-auto overscroll-contain px-4 py-4 sm:max-h-[calc(90vh-5.5rem)] sm:px-6 sm:py-5">
          <div className="mb-5 rounded-2xl border border-[#f0e6d8] bg-[#fff8ef] p-4">
            <p className="mb-3 text-sm font-semibold text-[#1a2a4a]">Report Type</p>
            <div className="flex flex-wrap gap-2">
              {serviceTypeOptions.map((option) => {
                const selected = values.service_type.includes(option.value)
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() =>
                      updateField('service_type', toggleServiceType(values.service_type, option.value))
                    }
                    className={cn(
                      'inline-flex min-h-10 items-center rounded-full px-4 text-sm font-semibold transition-colors',
                      selected
                        ? 'bg-[#0c29ab] text-white'
                        : 'bg-white text-[#4a5568] ring-1 ring-[#e4d5c2] hover:bg-[#fff1e0]',
                    )}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
            <p className="mt-2 text-xs text-[#7a8699]">You can select more than one report type.</p>
          </div>

          <SectionTitle>Customer Details</SectionTitle>
          <div className="mb-6 grid gap-4 sm:grid-cols-2">
            <Field label="Customer Name" className="sm:col-span-2">
              <input
                required
                value={values.customer_name}
                onChange={(event) => updateField('customer_name', event.target.value)}
                placeholder="Type here..."
                className={inputClassName}
              />
            </Field>
            <Field label="Location">
              <input
                value={values.location}
                onChange={(event) => updateField('location', event.target.value)}
                placeholder="Type here..."
                className={inputClassName}
              />
            </Field>
            <Field label="Report No">
              <input
                value={values.report_no}
                onChange={(event) => updateField('report_no', event.target.value)}
                placeholder="Type here..."
                className={inputClassName}
              />
            </Field>
            <Field label="Date of Report">
              <input
                type="date"
                value={values.date_of_report}
                onChange={(event) => updateField('date_of_report', event.target.value)}
                className={inputClassName}
              />
            </Field>
            <Field label="Time work start on">
              <input
                type="date"
                value={values.work_starting_date}
                onChange={(event) => updateField('work_starting_date', event.target.value)}
                className={inputClassName}
              />
            </Field>
            <Field label="Time work end on">
              <input
                type="date"
                value={values.work_ending_date}
                onChange={(event) => updateField('work_ending_date', event.target.value)}
                className={inputClassName}
              />
            </Field>
            <Field label="Date of MOM">
              <input
                type="date"
                value={values.mom_date}
                onChange={(event) => updateField('mom_date', event.target.value)}
                className={inputClassName}
              />
            </Field>
            <Field label="Contact Person">
              <input
                value={values.contact_person}
                onChange={(event) => updateField('contact_person', event.target.value)}
                placeholder="Type here..."
                className={inputClassName}
              />
            </Field>
            <Field label="Department & Designation" className="sm:col-span-2">
              <input
                value={values.dept_designation}
                onChange={(event) => updateField('dept_designation', event.target.value)}
                placeholder="Type here..."
                className={inputClassName}
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                value={values.email}
                onChange={(event) => updateField('email', event.target.value)}
                placeholder="Type here..."
                className={inputClassName}
              />
            </Field>
            <Field label="Phone">
              <input
                value={values.phone}
                onChange={(event) => updateField('phone', event.target.value)}
                placeholder="+880..."
                className={inputClassName}
              />
            </Field>
          </div>

          <SectionTitle>Machine Details</SectionTitle>
          <div className="mb-6 grid gap-4 sm:grid-cols-2">
            <Field label="Machine/Equipment Name" className="sm:col-span-2">
              <input
                value={values.machine_equipment_name}
                onChange={(event) => updateField('machine_equipment_name', event.target.value)}
                placeholder="Type here..."
                className={inputClassName}
              />
            </Field>
            <Field label="Manufacturer">
              <input
                value={values.machine_manufacturer}
                onChange={(event) => updateField('machine_manufacturer', event.target.value)}
                placeholder="Type here..."
                className={inputClassName}
              />
            </Field>
            <Field label="Model No">
              <input
                value={values.model_no}
                onChange={(event) => updateField('model_no', event.target.value)}
                placeholder="Type here..."
                className={inputClassName}
              />
            </Field>
            <Field label="Sr No">
              <input
                value={values.sr_no}
                onChange={(event) => updateField('sr_no', event.target.value)}
                placeholder="Type here..."
                className={inputClassName}
              />
            </Field>
            <Field label="Year of Installation">
              <input
                value={values.year_of_installation}
                onChange={(event) => updateField('year_of_installation', event.target.value)}
                placeholder="Type here..."
                className={inputClassName}
              />
            </Field>
            <YesNoField
              label="Machine Warranty"
              value={values.under_warrenty}
              onChange={(value) => updateField('under_warrenty', value)}
            />
            <YesNoField
              label="Customer Training Provided"
              value={values.customer_training_provided}
              onChange={(value) => updateField('customer_training_provided', value)}
            />
            <YesNoField
              label="Under AMC"
              value={values.under_amc}
              onChange={(value) => updateField('under_amc', value)}
            />
            <Field label="Environment Temp.">
              <input
                value={values.environment_temp}
                onChange={(event) => updateField('environment_temp', event.target.value)}
                placeholder="Type here..."
                className={inputClassName}
              />
            </Field>
            <Field label="R.H">
              <input
                value={values.rh}
                onChange={(event) => updateField('rh', event.target.value)}
                placeholder="Type here..."
                className={inputClassName}
              />
            </Field>
            <Field label="AMC No.">
              <input
                value={values.amc_no}
                onChange={(event) => updateField('amc_no', event.target.value)}
                placeholder="Type here..."
                className={inputClassName}
              />
            </Field>
            <Field label="Visit#">
              <input
                value={values.visit}
                onChange={(event) => updateField('visit', event.target.value)}
                placeholder="Type here..."
                className={inputClassName}
              />
            </Field>
          </div>

          <SectionTitle>Work Details</SectionTitle>
          <div className="mb-6 grid gap-4">
            <Field label="Nature of Complaint">
              <textarea
                rows={3}
                value={values.nature_of_complaint}
                onChange={(event) => updateField('nature_of_complaint', event.target.value)}
                placeholder="Type here..."
                className={cn(inputClassName, 'resize-y py-3')}
              />
            </Field>
            <Field label="Observation">
              <textarea
                rows={3}
                value={values.observation}
                onChange={(event) => updateField('observation', event.target.value)}
                placeholder="Type here..."
                className={cn(inputClassName, 'resize-y py-3')}
              />
            </Field>
            <Field label="Action Taken">
              <textarea
                rows={3}
                value={values.action_taken}
                onChange={(event) => updateField('action_taken', event.target.value)}
                placeholder="Type here..."
                className={cn(inputClassName, 'resize-y py-3')}
              />
            </Field>
            <Field label="Result after action taken">
              <textarea
                rows={3}
                value={values.result_after_action_taken}
                onChange={(event) => updateField('result_after_action_taken', event.target.value)}
                placeholder="Type here..."
                className={cn(inputClassName, 'resize-y py-3')}
              />
            </Field>
            <Field label="Spare parts required">
              <textarea
                rows={3}
                value={values.spare_parts_required}
                onChange={(event) => updateField('spare_parts_required', event.target.value)}
                placeholder="Type here..."
                className={cn(inputClassName, 'resize-y py-3')}
              />
            </Field>
            <Field label="Next visit required">
              <textarea
                rows={3}
                value={values.next_visit_required}
                onChange={(event) => updateField('next_visit_required', event.target.value)}
                placeholder="Type here..."
                className={cn(inputClassName, 'resize-y py-3')}
              />
            </Field>
            <Field label="After three month">
              <textarea
                rows={3}
                value={values.after_three_months}
                onChange={(event) => updateField('after_three_months', event.target.value)}
                placeholder="Type here..."
                className={cn(inputClassName, 'resize-y py-3')}
              />
            </Field>
          </div>

          <SectionTitle>Charges & Debit Note</SectionTitle>
          <div className="mb-2 grid gap-4 sm:grid-cols-2">
            <YesNoField
              label="Changeable"
              value={values.if_changable}
              onChange={(value) => updateField('if_changable', value)}
            />
            <Field label="Service charge for (Days)">
              <input
                value={values.service_charge}
                onChange={(event) => updateField('service_charge', event.target.value)}
                placeholder="Type here..."
                className={inputClassName}
              />
            </Field>
            <Field label="Lump Charge">
              <input
                value={values.lump_charge}
                onChange={(event) => updateField('lump_charge', event.target.value)}
                placeholder="Type here..."
                className={inputClassName}
              />
            </Field>
            <Field label="Total Charge">
              <input
                value={values.total_charge}
                onChange={(event) => updateField('total_charge', event.target.value)}
                placeholder="Type here..."
                className={inputClassName}
              />
            </Field>
            <YesNoField
              label="Debit note to be raised?"
              value={values.debit_note_to_be_raised}
              onChange={(value) => updateField('debit_note_to_be_raised', value)}
            />
            <Field label="Debit Note Number">
              <input
                value={values.debit_note_number}
                onChange={(event) => updateField('debit_note_number', event.target.value)}
                placeholder="Type here..."
                className={inputClassName}
              />
            </Field>
            <Field label="Debit Note DT.">
              <input
                value={values.debit_note_dt}
                onChange={(event) => updateField('debit_note_dt', event.target.value)}
                placeholder="Type here..."
                className={inputClassName}
              />
            </Field>
            <Field label="Customer Remarks" className="sm:col-span-2">
              <textarea
                rows={3}
                value={values.customer_remarks}
                onChange={(event) => updateField('customer_remarks', event.target.value)}
                placeholder="Type here..."
                className={cn(inputClassName, 'resize-y py-3')}
              />
            </Field>
          </div>

          {error ? (
            <p className="mt-4 rounded-xl bg-[#ef2f15]/10 px-3 py-2 text-sm text-[#ef2f15]">
              {error}
            </p>
          ) : null}

          <div className="sticky bottom-0 mt-6 flex flex-col-reverse gap-3 border-t border-[#eef1f7] bg-white pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#ef2f15] px-6 text-sm font-semibold text-[#ef2f15] transition-colors hover:bg-[#ef2f15]/10 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#0c29ab] px-6 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(12,41,171,0.25)] transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/**
 * Section heading used inside the S/I/S modal.
 * @param children - Section title text
 */
const SectionTitle = ({ children }: { children: ReactNode }) => {
  return (
    <h3 className="mb-3 border-b border-[#eef1f7] pb-2 font-[family-name:var(--font-righteous)] text-base text-[#1a2a4a]">
      {children}
    </h3>
  )
}

/**
 * Labeled field wrapper used inside the S/I/S modal.
 * @param label - Visible field label
 * @param children - Input control
 * @param className - Optional grid class overrides
 */
const Field = ({
  label,
  children,
  className,
}: {
  label: string
  children: ReactNode
  className?: string
}) => {
  return (
    <label className={cn('flex flex-col gap-1.5', className)}>
      <span className="text-sm font-semibold text-[#1a2a4a]">{label}</span>
      {children}
    </label>
  )
}

/**
 * Yes/No radio control for boolean S/I/S fields.
 * @param label - Field label
 * @param value - Current boolean value
 * @param onChange - Change handler
 */
const YesNoField = ({
  label,
  value,
  onChange,
}: {
  label: string
  value: boolean
  onChange: (value: boolean) => void
}) => {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold text-[#1a2a4a]">{label}</legend>
      <div className="flex gap-3">
        {[true, false].map((option) => (
          <label
            key={String(option)}
            className={cn(
              'inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border px-4 text-sm font-medium transition-colors',
              value === option
                ? 'border-[#0c29ab] bg-[#eef2ff] text-[#0c29ab]'
                : 'border-[#dbe2f0] bg-white text-[#4a5568] hover:border-[#0c29ab]/40',
            )}
          >
            <input
              type="radio"
              checked={value === option}
              onChange={() => onChange(option)}
              className="accent-[#0c29ab]"
            />
            {option ? 'Yes' : 'No'}
          </label>
        ))}
      </div>
    </fieldset>
  )
}
