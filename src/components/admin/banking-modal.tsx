'use client'

import { useEffect, useId, useState, type FormEvent, type ReactNode } from 'react'

import {
  bankingRecordToFormValues,
  emptyBankingFormValues,
} from '@/lib/banking'
import { bankOptions, paymentTypeOptions } from '@/lib/options'
import { cn } from '@/lib/utils'
import type { BankingFormValues, BankingRecord } from '@/types/banking'

const inputClassName =
  'min-h-11 w-full rounded-xl border border-[#dbe2f0] bg-[#f8faff] px-3 text-sm text-[#1a1a1a] outline-none transition-colors placeholder:text-[#9aa3b5] focus:border-[#0c29ab] focus:bg-white'

/**
 * Polished create/edit modal for Banking (bank_stat) records.
 * @param open - Whether the modal is visible
 * @param mode - create or edit
 * @param initialRecord - Existing record when editing
 * @param saving - Submit in progress
 * @param error - Error message to display
 * @param onClose - Close handler
 * @param onSubmit - Save handler with form values
 */
export const BankingModal = ({
  open,
  mode,
  initialRecord,
  saving,
  error,
  onClose,
  onSubmit,
}: {
  open: boolean
  mode: 'create' | 'edit'
  initialRecord: BankingRecord | null
  saving: boolean
  error: string
  onClose: () => void
  onSubmit: (values: BankingFormValues) => Promise<void>
}) => {
  const titleId = useId()
  const [values, setValues] = useState<BankingFormValues>(emptyBankingFormValues())

  useEffect(() => {
    if (!open) return
    setValues(
      mode === 'edit' && initialRecord
        ? bankingRecordToFormValues(initialRecord)
        : emptyBankingFormValues(),
    )
  }, [open, mode, initialRecord])

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
  const updateField = <K extends keyof BankingFormValues>(
    key: K,
    value: BankingFormValues[K],
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
        className="relative z-10 my-0 w-full max-w-lg max-h-[min(100dvh,100%)] overflow-hidden rounded-t-[24px] border border-[#e4e9f4] bg-white shadow-[0_24px_80px_rgba(12,41,171,0.22)] sm:my-4 sm:max-h-[90vh] sm:rounded-[24px]"
      >
        <div className="border-b border-[#eef1f7] bg-[linear-gradient(135deg,#0c29ab_0%,#2c3d94_100%)] px-5 py-4 text-white sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/70">
                Banking
              </p>
              <h2 id={titleId} className="mt-1 font-[family-name:var(--font-righteous)] text-xl">
                {mode === 'create' ? 'Add Banking Data' : 'Edit Banking Data'}
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
          <div className="grid gap-4">
            <Field label="Date">
              <input
                type="date"
                required
                value={values.date}
                onChange={(event) => updateField('date', event.target.value)}
                className={inputClassName}
              />
            </Field>

            <Field label="Payment Type">
              <select
                required
                value={values.payment_type}
                onChange={(event) =>
                  updateField(
                    'payment_type',
                    event.target.value as BankingFormValues['payment_type'],
                  )
                }
                className={inputClassName}
              >
                <option value="">Choose an option...</option>
                {paymentTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Amount">
              <input
                value={values.amount}
                onChange={(event) => updateField('amount', event.target.value)}
                placeholder="Type here..."
                className={inputClassName}
              />
            </Field>

            <Field label="Bank">
              <select
                required
                value={values.bank_name}
                onChange={(event) =>
                  updateField('bank_name', event.target.value as BankingFormValues['bank_name'])
                }
                className={inputClassName}
              >
                <option value="">Choose an option...</option>
                {bankOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Remarks">
              <textarea
                rows={4}
                value={values.remarks}
                onChange={(event) => updateField('remarks', event.target.value)}
                placeholder="Type here..."
                className={cn(inputClassName, 'resize-y py-3')}
              />
            </Field>

            <fieldset>
              <legend className="mb-1.5 text-sm font-semibold text-[#1a2a4a]">Received?</legend>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => updateField('received', true)}
                  className={cn(
                    'inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border text-sm font-semibold transition-colors',
                    values.received
                      ? 'border-[#1f9d55] bg-[#1f9d55] text-white'
                      : 'border-[#dbe2f0] bg-[#f8faff] text-[#1a2a4a]',
                  )}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => updateField('received', false)}
                  className={cn(
                    'inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border text-sm font-semibold transition-colors',
                    !values.received
                      ? 'border-[#0c29ab] bg-[#0c29ab] text-white'
                      : 'border-[#dbe2f0] bg-[#f8faff] text-[#1a2a4a]',
                  )}
                >
                  No
                </button>
              </div>
            </fieldset>
          </div>

          {error ? (
            <p className="mt-4 rounded-xl bg-[#ef2f15]/10 px-3 py-2 text-sm text-[#ef2f15]">
              {error}
            </p>
          ) : null}

          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-[#eef1f7] pt-4 sm:flex-row sm:justify-between">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#1f9d55] px-8 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(31,157,85,0.28)] transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#c62828] px-8 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/**
 * Labeled field wrapper used inside the Banking modal.
 * @param label - Visible field label
 * @param children - Input control
 */
const Field = ({ label, children }: { label: string; children: ReactNode }) => {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-[#1a2a4a]">{label}</span>
      {children}
    </label>
  )
}
