'use client'

import { useEffect, useId, useState, type FormEvent, type ReactNode } from 'react'

import {
  currentYearMonth,
  formatAmount,
  formatYearMonthLabel,
  parseAmount,
  yearMonthToDbDate,
} from '@/lib/cash-book'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { MonthlyCashAllowance } from '@/types/cash-book'

const inputClassName =
  'min-h-11 w-full rounded-xl border border-[#dbe2f0] bg-[#f8faff] px-3 text-sm text-[#1a1a1a] outline-none transition-colors placeholder:text-[#9aa3b5] focus:border-[#0c29ab] focus:bg-white'

/**
 * Super-admin modal to set/edit monthly cash allowance budgets.
 * @param open - Whether the modal is visible
 * @param initialMonth - Month to open with (YYYY-MM)
 * @param onClose - Close handler
 * @param onSaved - Called after a successful save with month + amount
 */
export const MonthlyCashAllowanceModal = ({
  open,
  initialMonth,
  onClose,
  onSaved,
}: {
  open: boolean
  initialMonth: string
  onClose: () => void
  onSaved: (yearMonth: string, amount: number) => void
}) => {
  const titleId = useId()
  const [yearMonth, setYearMonth] = useState(initialMonth || currentYearMonth())
  const [amount, setAmount] = useState('')
  const [existing, setExisting] = useState<MonthlyCashAllowance | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setYearMonth(initialMonth || currentYearMonth())
    setError('')
  }, [open, initialMonth])

  useEffect(() => {
    if (!open) return

    /**
     * Loads existing allowance for the selected month.
     */
    const loadMonth = async () => {
      const dbDate = yearMonthToDbDate(yearMonth)
      if (!dbDate) {
        setExisting(null)
        setAmount('')
        return
      }

      setLoading(true)
      setError('')
      const supabase = createClient()
      const { data, error: fetchError } = await supabase
        .from('monthly_cash_allowance')
        .select('*')
        .eq('year_month', dbDate)
        .maybeSingle()

      if (fetchError) {
        setError(fetchError.message)
        setExisting(null)
        setAmount('')
        setLoading(false)
        return
      }

      if (data) {
        const row = data as MonthlyCashAllowance
        setExisting(row)
        setAmount(String(row.amount ?? ''))
      } else {
        setExisting(null)
        setAmount('')
      }
      setLoading(false)
    }

    void loadMonth()
  }, [open, yearMonth])

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
   * Upserts the monthly allowance amount.
   * @param event - Form submit event
   */
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const dbDate = yearMonthToDbDate(yearMonth)
    const parsed = parseAmount(amount)
    if (!dbDate || parsed === null) {
      setError('Select a month and enter a valid amount.')
      return
    }

    setSaving(true)
    setError('')
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { error: upsertError } = await supabase.from('monthly_cash_allowance').upsert(
      {
        year_month: dbDate,
        amount: parsed,
        created_by: user?.id || null,
      },
      { onConflict: 'year_month' },
    )

    if (upsertError) {
      setError(upsertError.message)
      setSaving(false)
      return
    }

    setSaving(false)
    onSaved(yearMonth, parsed)
    onClose()
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
        className="relative z-10 my-0 w-full max-w-md max-h-[min(100dvh,100%)] overflow-hidden rounded-t-[24px] border border-[#e4e9f4] bg-white shadow-[0_24px_80px_rgba(12,41,171,0.22)] sm:my-4 sm:max-h-[90vh] sm:rounded-[24px]"
      >
        <div className="border-b border-[#eef1f7] bg-[linear-gradient(135deg,#0c29ab_0%,#2c3d94_100%)] px-5 py-4 text-white sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/70">
                Cash Book
              </p>
              <h2 id={titleId} className="mt-1 font-[family-name:var(--font-righteous)] text-xl">
                Monthly Cash Allowance
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

        <form onSubmit={handleSubmit} className="px-4 py-4 sm:px-6 sm:py-5">
          <div className="grid gap-4">
            <Field label="Month">
              <input
                type="month"
                required
                value={yearMonth}
                onChange={(event) => setYearMonth(event.target.value)}
                className={inputClassName}
              />
            </Field>

            <Field label="Budget Amount (TK)">
              <input
                required
                inputMode="decimal"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="0.00"
                disabled={loading}
                className={inputClassName}
              />
            </Field>

            <p className="rounded-xl bg-[#f4f7fd] px-3 py-2 text-sm text-[#4a5568]">
              {loading
                ? 'Loading month budget...'
                : existing
                  ? `Editing budget for ${formatYearMonthLabel(yearMonth)}. Current: ${formatAmount(existing.amount)}`
                  : `No budget yet for ${formatYearMonthLabel(yearMonth)}. Save to create one.`}
            </p>
          </div>

          {error ? (
            <p className="mt-4 rounded-xl bg-[#ef2f15]/10 px-3 py-2 text-sm text-[#ef2f15]">
              {error}
            </p>
          ) : null}

          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-[#eef1f7] pt-4 sm:flex-row sm:justify-end">
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
              disabled={saving || loading}
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#0c29ab] px-6 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(12,41,171,0.25)] transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {saving ? 'Saving...' : existing ? 'Update Budget' : 'Save Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/**
 * Labeled field wrapper for the allowance modal.
 * @param label - Visible field label
 * @param children - Input control
 */
const Field = ({ label, children }: { label: string; children: ReactNode }) => {
  return (
    <label className={cn('flex flex-col gap-1.5')}>
      <span className="text-sm font-semibold text-[#1a2a4a]">{label}</span>
      {children}
    </label>
  )
}
