'use client'

import { useEffect, useId, useState, type FormEvent, type ReactNode } from 'react'

import {
  computeDaysTaken,
  emptyMomFormValues,
  momReportToFormValues,
} from '@/lib/mom'
import { cn } from '@/lib/utils'
import type { MomReport, MomReportFormValues } from '@/types/mom'

/**
 * Polished create/edit modal for MOM reports.
 * @param open - Whether the modal is visible
 * @param mode - create or edit
 * @param initialReport - Existing report when editing
 * @param saving - Submit in progress
 * @param error - Error message to display
 * @param onClose - Close handler
 * @param onSubmit - Save handler with form values
 */
export const MomReportModal = ({
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
  initialReport: MomReport | null
  saving: boolean
  error: string
  onClose: () => void
  onSubmit: (values: MomReportFormValues) => Promise<void>
}) => {
  const titleId = useId()
  const [values, setValues] = useState<MomReportFormValues>(emptyMomFormValues())

  useEffect(() => {
    if (!open) return
    setValues(
      mode === 'edit' && initialReport
        ? momReportToFormValues(initialReport)
        : emptyMomFormValues(),
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
   * Updates one form field and recalculates days when dates change.
   * @param key - Form field key
   * @param value - New value
   */
  const updateField = <K extends keyof MomReportFormValues>(
    key: K,
    value: MomReportFormValues[K],
  ) => {
    setValues((current) => {
      const next = { ...current, [key]: value }
      if (key === 'starting_date' || key === 'ending_date') {
        next.days_taken = computeDaysTaken(next.starting_date, next.ending_date)
      }
      return next
    })
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
        className="relative z-10 my-0 w-full max-w-3xl max-h-[min(100dvh,100%)] overflow-hidden rounded-t-[24px] border border-[#e4e9f4] bg-white shadow-[0_24px_80px_rgba(12,41,171,0.22)] sm:my-4 sm:max-h-[90vh] sm:rounded-[24px]"
      >
        <div className="border-b border-[#eef1f7] bg-[linear-gradient(135deg,#0c29ab_0%,#2c3d94_100%)] px-5 py-4 text-white sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/70">
                MOM Report
              </p>
              <h2 id={titleId} className="mt-1 font-[family-name:var(--font-righteous)] text-xl">
                {mode === 'create' ? 'Create MOM Report' : 'Edit MOM Report'}
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
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Company Name" className="sm:col-span-2">
              <input
                required
                value={values.company_name}
                onChange={(event) => updateField('company_name', event.target.value)}
                placeholder="Type here..."
                className={inputClassName}
              />
            </Field>

            <Field label="Company Address" className="sm:col-span-2">
              <input
                value={values.company_address}
                onChange={(event) => updateField('company_address', event.target.value)}
                placeholder="Type here..."
                className={inputClassName}
              />
            </Field>

            <Field label="MOM Date">
              <input
                type="date"
                value={values.mom_date}
                onChange={(event) => updateField('mom_date', event.target.value)}
                className={inputClassName}
              />
            </Field>

            <Field label="Names of Technicians">
              <input
                value={values.technicians_txt}
                onChange={(event) => updateField('technicians_txt', event.target.value)}
                placeholder="Type here..."
                className={inputClassName}
              />
            </Field>

            <Field label="Type of Machines">
              <input
                value={values.type_of_machine}
                onChange={(event) => updateField('type_of_machine', event.target.value)}
                placeholder="Type here..."
                className={inputClassName}
              />
            </Field>

            <Field label="Machine No">
              <input
                value={values.machine_no}
                onChange={(event) => updateField('machine_no', event.target.value)}
                placeholder="Type here..."
                className={inputClassName}
              />
            </Field>

            <fieldset className="sm:col-span-2">
              <legend className="mb-2 text-sm font-semibold text-[#1a2a4a]">
                Machine Warranty?
              </legend>
              <div className="flex gap-3">
                {[true, false].map((option) => (
                  <label
                    key={String(option)}
                    className={cn(
                      'inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border px-4 text-sm font-medium transition-colors',
                      values.machine_warrenty === option
                        ? 'border-[#0c29ab] bg-[#eef2ff] text-[#0c29ab]'
                        : 'border-[#dbe2f0] bg-white text-[#4a5568] hover:border-[#0c29ab]/40',
                    )}
                  >
                    <input
                      type="radio"
                      name="machine_warrenty"
                      checked={values.machine_warrenty === option}
                      onChange={() => updateField('machine_warrenty', option)}
                      className="accent-[#0c29ab]"
                    />
                    {option ? 'Yes' : 'No'}
                  </label>
                ))}
              </div>
            </fieldset>

            <Field label="Type of Visit" className="sm:col-span-2">
              <input
                value={values.type_of_visit}
                onChange={(event) => updateField('type_of_visit', event.target.value)}
                placeholder="Type here..."
                className={inputClassName}
              />
            </Field>

            <Field label="Starting Date">
              <input
                type="date"
                value={values.starting_date}
                onChange={(event) => updateField('starting_date', event.target.value)}
                className={inputClassName}
              />
            </Field>

            <Field label="Ending Date">
              <input
                type="date"
                value={values.ending_date}
                onChange={(event) => updateField('ending_date', event.target.value)}
                className={inputClassName}
              />
            </Field>

            <Field label="Total Days Taken" className="sm:col-span-2">
              <input
                value={values.days_taken}
                onChange={(event) => updateField('days_taken', event.target.value)}
                placeholder="Auto-calculated from dates, or type here..."
                className={inputClassName}
              />
            </Field>

            <Field label="Installation Report" className="sm:col-span-2">
              <textarea
                rows={4}
                value={values.installation_report}
                onChange={(event) => updateField('installation_report', event.target.value)}
                placeholder="Type here..."
                className={cn(inputClassName, 'resize-y py-3')}
              />
            </Field>

            <Field label="Conclusion" className="sm:col-span-2">
              <textarea
                rows={4}
                value={values.conclusion}
                onChange={(event) => updateField('conclusion', event.target.value)}
                placeholder="Type here..."
                className={cn(inputClassName, 'resize-y py-3')}
              />
            </Field>

            <Field label="Note" className="sm:col-span-2">
              <textarea
                rows={3}
                value={values.note}
                onChange={(event) => updateField('note', event.target.value)}
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

const inputClassName =
  'min-h-11 w-full rounded-xl border border-[#dbe2f0] bg-[#f8faff] px-3 text-sm text-[#1a1a1a] outline-none transition-colors placeholder:text-[#9aa3b5] focus:border-[#0c29ab] focus:bg-white'

/**
 * Labeled field wrapper used inside the MOM modal.
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
