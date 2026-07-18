'use client'

import { useEffect, useId, useState, type FormEvent, type ReactNode } from 'react'

import {
  computeCommissionAmount,
  emptyLocalSalesFormValues,
  localSalesToFormValues,
} from '@/lib/local-sales'
import { cn } from '@/lib/utils'
import type { LocalSalesFormValues, LocalSalesRecord } from '@/types/local-sales'

const inputClassName =
  'min-h-11 w-full rounded-xl border border-[#dbe2f0] bg-[#f8faff] px-3 text-sm text-[#1a1a1a] outline-none transition-colors placeholder:text-[#9aa3b5] focus:border-[#0c29ab] focus:bg-white'

/**
 * Create/edit modal for Local Sales records.
 * Commission amount is auto-calculated as sales amount minus purchase amount.
 * @param open - Whether the modal is visible
 * @param mode - create or edit
 * @param initialRecord - Existing record when editing
 * @param saving - Submit in progress
 * @param error - Error message to display
 * @param onClose - Close handler
 * @param onSubmit - Save handler with form values
 */
export const LocalSalesModal = ({
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
  initialRecord: LocalSalesRecord | null
  saving: boolean
  error: string
  onClose: () => void
  onSubmit: (values: LocalSalesFormValues) => Promise<void>
}) => {
  const titleId = useId()
  const [values, setValues] = useState<LocalSalesFormValues>(emptyLocalSalesFormValues())

  useEffect(() => {
    if (!open) return
    setValues(
      mode === 'edit' && initialRecord
        ? localSalesToFormValues(initialRecord)
        : emptyLocalSalesFormValues(),
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
   * Updates one form field and recalculates commission when amounts change.
   * @param key - Form field key
   * @param value - New value
   */
  const updateField = <K extends keyof LocalSalesFormValues>(
    key: K,
    value: LocalSalesFormValues[K],
  ) => {
    setValues((current) => {
      const next = { ...current, [key]: value }
      if (key === 'purchase_amount' || key === 'sales_amount') {
        next.commission_amount = computeCommissionAmount(
          next.purchase_amount,
          next.sales_amount,
        )
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
    const commission = computeCommissionAmount(values.purchase_amount, values.sales_amount)
    await onSubmit({ ...values, commission_amount: commission })
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
        className="relative z-10 my-0 w-full max-w-2xl max-h-[min(100dvh,100%)] overflow-hidden rounded-t-[24px] border border-[#e4e9f4] bg-white shadow-[0_24px_80px_rgba(12,41,171,0.22)] sm:my-4 sm:max-h-[90vh] sm:rounded-[24px]"
      >
        <div className="border-b border-[#eef1f7] bg-[linear-gradient(135deg,#0c29ab_0%,#2c3d94_100%)] px-5 py-4 text-white sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/70">
                Local Sales
              </p>
              <h2 id={titleId} className="mt-1 font-[family-name:var(--font-righteous)] text-xl">
                {mode === 'create' ? 'Add Local Sales' : 'Edit Local Sales'}
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

        <form
          onSubmit={handleSubmit}
          className="max-h-[calc(100dvh-7rem)] overflow-y-auto overscroll-contain px-4 py-4 sm:max-h-[calc(90vh-5.5rem)] sm:px-6 sm:py-5"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Delivery Date" className="sm:col-span-2">
              <input
                type="date"
                required
                value={values.delivery_date}
                onChange={(event) => updateField('delivery_date', event.target.value)}
                className={inputClassName}
              />
            </Field>

            <Field label="Manufacturer Name" className="sm:col-span-2">
              <input
                required
                value={values.manufacturer_name}
                onChange={(event) => updateField('manufacturer_name', event.target.value)}
                placeholder="Type here..."
                className={inputClassName}
              />
            </Field>

            <Field label="Customer Name" className="sm:col-span-2">
              <input
                required
                value={values.customer_name}
                onChange={(event) => updateField('customer_name', event.target.value)}
                placeholder="Type here..."
                className={inputClassName}
              />
            </Field>

            <Field label="Purchase Amount (TK)">
              <input
                required
                inputMode="decimal"
                value={values.purchase_amount}
                onChange={(event) => updateField('purchase_amount', event.target.value)}
                placeholder="0.00"
                className={inputClassName}
              />
            </Field>

            <Field label="Sales Amount (TK)">
              <input
                required
                inputMode="decimal"
                value={values.sales_amount}
                onChange={(event) => updateField('sales_amount', event.target.value)}
                placeholder="0.00"
                className={inputClassName}
              />
            </Field>

            <Field label="Commission Amount (TK)" className="sm:col-span-2">
              <input
                readOnly
                value={values.commission_amount}
                placeholder="Auto-calculated (Sales − Purchase)"
                className={cn(inputClassName, 'cursor-not-allowed bg-[#eef1f7]')}
              />
            </Field>

            <Field label="Remarks" className="sm:col-span-2">
              <textarea
                rows={3}
                value={values.remarks}
                onChange={(event) => updateField('remarks', event.target.value)}
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
 * Labeled field wrapper used inside the Local Sales modal.
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
