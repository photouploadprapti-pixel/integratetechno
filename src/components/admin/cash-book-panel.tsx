'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { CashBookModal } from '@/components/admin/cash-book-modal'
import { MonthlyCashAllowanceModal } from '@/components/admin/monthly-cash-allowance-modal'
import { AdminTable, AdminTableFrame } from '@/components/admin/admin-table'
import { cashBookColumns } from '@/data/admin'
import { getUserRole } from '@/lib/auth/roles'
import {
  CASH_BOOK_EXPENSE_CATEGORIES,
  currentYearMonth,
  formatAmount,
  formatPaymentType,
  formatYearMonthLabel,
  parseAmount,
  sumCashBookAmounts,
  yearMonthToDbDate,
} from '@/lib/cash-book'
import { formatDisplayDate } from '@/lib/mom'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type {
  CashBookExpenseCategory,
  CashBookFormValues,
  CashBookRecord,
} from '@/types/cash-book'

/**
 * Live Cash Book list with categories, multi-filters, marking, budgets, and totals.
 */
export const CashBookPanel = () => {
  const [records, setRecords] = useState<CashBookRecord[]>([])
  const [query, setQuery] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<CashBookExpenseCategory[]>(
    [],
  )
  const [markedIds, setMarkedIds] = useState<Set<string>>(new Set())
  const [budgetMonth, setBudgetMonth] = useState(currentYearMonth())
  const [budgetAmount, setBudgetAmount] = useState<number | null>(null)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [allowanceOpen, setAllowanceOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [editingRecord, setEditingRecord] = useState<CashBookRecord | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [listError, setListError] = useState('')

  /**
   * Loads cash book records and detects super_admin role.
   */
  const loadRecords = useCallback(async () => {
    setListError('')
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    setIsSuperAdmin(getUserRole(user) === 'super_admin')

    const { data, error: fetchError } = await supabase
      .from('cash_book')
      .select('*')
      .order('created_at', { ascending: false })

    if (fetchError) {
      setListError(fetchError.message)
      setRecords([])
      setLoading(false)
      return
    }

    setRecords((data || []) as CashBookRecord[])
    setLoading(false)
  }, [])

  /**
   * Loads monthly cash allowance for the selected budget month.
   */
  const loadBudget = useCallback(async () => {
    const dbDate = yearMonthToDbDate(budgetMonth)
    if (!dbDate) {
      setBudgetAmount(null)
      return
    }

    const supabase = createClient()
    const { data, error: fetchError } = await supabase
      .from('monthly_cash_allowance')
      .select('amount')
      .eq('year_month', dbDate)
      .maybeSingle()

    if (fetchError) {
      setListError(fetchError.message)
      setBudgetAmount(null)
      return
    }

    if (!data) {
      setBudgetAmount(null)
      return
    }

    const amount = typeof data.amount === 'number' ? data.amount : Number(data.amount)
    setBudgetAmount(Number.isFinite(amount) ? amount : null)
  }, [budgetMonth])

  useEffect(() => {
    void loadRecords()
  }, [loadRecords])

  useEffect(() => {
    void loadBudget()
  }, [loadBudget])

  const filteredRecords = useMemo(() => {
    const q = query.trim().toLowerCase()
    return records.filter((record) => {
      if (
        selectedCategories.length > 0 &&
        (!record.expense_category || !selectedCategories.includes(record.expense_category))
      ) {
        return false
      }
      if (!q) return true
      return [
        formatPaymentType(record.payment_type),
        record.expense_category,
        record.details,
        record.remarks,
        record.amount !== null ? String(record.amount) : '',
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q))
    })
  }, [query, records, selectedCategories])

  const markedVisibleRecords = useMemo(
    () => filteredRecords.filter((record) => markedIds.has(record.id)),
    [filteredRecords, markedIds],
  )

  const hasMarks = markedVisibleRecords.length > 0
  const totalExpense = hasMarks
    ? sumCashBookAmounts(markedVisibleRecords)
    : sumCashBookAmounts(filteredRecords)
  const remaining =
    budgetAmount === null ? null : budgetAmount - totalExpense

  /**
   * Toggles a category filter chip.
   * @param category - Expense category to toggle
   */
  const toggleCategory = (category: CashBookExpenseCategory) => {
    setSelectedCategories((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category],
    )
  }

  /**
   * Toggles mark state for one row.
   * @param id - Record id
   */
  const toggleMarked = (id: string) => {
    setMarkedIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  /**
   * Opens the modal in create mode.
   */
  const openCreate = () => {
    setModalMode('create')
    setEditingRecord(null)
    setError('')
    setModalOpen(true)
  }

  /**
   * Opens the modal in edit mode with the selected record.
   * @param record - Record to edit
   */
  const openEdit = (record: CashBookRecord) => {
    setModalMode('edit')
    setEditingRecord(record)
    setError('')
    setModalOpen(true)
  }

  /**
   * Closes the modal when not saving.
   */
  const closeModal = () => {
    if (saving) return
    setModalOpen(false)
    setEditingRecord(null)
    setError('')
  }

  /**
   * Saves a new or updated cash book record to Supabase.
   * @param values - Form values from the modal
   */
  const handleSubmit = async (values: CashBookFormValues) => {
    setSaving(true)
    setError('')

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const payload = {
      date: values.date || null,
      payment_type: values.payment_type || null,
      amount: parseAmount(values.amount),
      details: values.details.trim() || null,
      remarks: values.remarks.trim() || null,
      expense_category: values.expense_category || null,
    }

    if (modalMode === 'edit' && editingRecord) {
      const { error: updateError } = await supabase
        .from('cash_book')
        .update(payload)
        .eq('id', editingRecord.id)

      if (updateError) {
        setError(updateError.message)
        setSaving(false)
        return
      }
    } else {
      const { error: insertError } = await supabase.from('cash_book').insert({
        ...payload,
        created_by: user?.id || null,
      })
      if (insertError) {
        setError(insertError.message)
        setSaving(false)
        return
      }
    }

    setSaving(false)
    setModalOpen(false)
    setEditingRecord(null)
    await loadRecords()
  }

  /**
   * Deletes a cash book record after confirmation.
   * @param record - Record to delete
   */
  const handleDelete = async (record: CashBookRecord) => {
    const confirmed = window.confirm('Delete this cash book entry?')
    if (!confirmed) return

    const supabase = createClient()
    const { error: deleteError } = await supabase
      .from('cash_book')
      .delete()
      .eq('id', record.id)

    if (deleteError) {
      setListError(deleteError.message)
      return
    }

    setMarkedIds((current) => {
      const next = new Set(current)
      next.delete(record.id)
      return next
    })
    await loadRecords()
  }

  return (
    <>
      <section className="rounded-[24px] border border-[#e4e9f4] bg-white p-4 shadow-[0_10px_30px_rgba(16,36,94,0.06)] sm:p-6">
        <div className="mb-5">
          <label className="sr-only" htmlFor="cash-book-search">
            Search cash book
          </label>
          <input
            id="cash-book-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search in Cash Book"
            className="min-h-12 w-full rounded-2xl border border-[#dbe2f0] bg-[#f8faff] px-4 text-sm text-[#1a1a1a] outline-none transition-colors placeholder:text-[#9aa3b5] focus:border-[#0c29ab] focus:bg-white"
          />
        </div>

        <div className="mb-4">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-[#1a2a4a]">
              Filter by category (multi-select):
            </p>
            {selectedCategories.length > 0 ? (
              <button
                type="button"
                onClick={() => setSelectedCategories([])}
                className="text-sm font-semibold text-[#0c29ab] transition-opacity hover:opacity-80"
              >
                Clear filters
              </button>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            {CASH_BOOK_EXPENSE_CATEGORIES.map((category) => {
              const active = selectedCategories.includes(category)
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => toggleCategory(category)}
                  className={cn(
                    'inline-flex min-h-9 items-center rounded-full px-3.5 text-xs font-semibold transition-colors sm:text-sm',
                    active
                      ? 'bg-[#0c29ab] text-white shadow-[0_6px_14px_rgba(12,41,171,0.22)]'
                      : 'border border-[#dbe2f0] bg-[#f8faff] text-[#1a2a4a] hover:border-[#0c29ab]/40',
                  )}
                >
                  {category}
                </button>
              )
            })}
          </div>
        </div>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="font-[family-name:var(--font-righteous)] text-lg text-[#1a1a1a] sm:text-xl">
            Cash Book:
          </h1>
          <div className="flex flex-col gap-2 sm:flex-row">
            {isSuperAdmin ? (
              <button
                type="button"
                onClick={() => setAllowanceOpen(true)}
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#0c29ab] bg-white px-5 text-sm font-semibold text-[#0c29ab] transition-colors hover:bg-[#eef2ff]"
              >
                Monthly Cash Allowance
              </button>
            ) : null}
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#0c29ab] px-5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(12,41,171,0.25)] transition-opacity hover:opacity-90"
            >
              Add Data
            </button>
          </div>
        </div>

        {listError ? (
          <p className="mb-4 rounded-xl bg-[#ef2f15]/10 px-3 py-2 text-sm text-[#ef2f15]">
            {listError}
          </p>
        ) : null}

        <AdminTableFrame>
          <AdminTable>
            <thead className="bg-[#f4f7fd] text-[#4a5568]">
              <tr>
                {cashBookColumns.map((column) => (
                  <th
                    key={column.key}
                    className={cn(
                      'whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide',
                      column.className,
                    )}
                  >
                    {column.label}
                  </th>
                ))}
                <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={cashBookColumns.length + 1}
                    className="px-4 py-10 text-center text-[#7a8699]"
                  >
                    Loading cash book...
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td
                    colSpan={cashBookColumns.length + 1}
                    className="px-4 py-10 text-center text-[#7a8699]"
                  >
                    No cash book entries match your filters.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr
                    key={record.id}
                    className="border-t border-[#eef1f7] transition-colors hover:bg-[#f8faff]"
                  >
                    <td className="px-4 py-3.5">
                      <input
                        type="checkbox"
                        checked={markedIds.has(record.id)}
                        onChange={() => toggleMarked(record.id)}
                        aria-label={`Mark ${record.details || 'entry'}`}
                        className="h-4 w-4 accent-[#0c29ab]"
                      />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-[#1f2a44]">
                      {formatDisplayDate(record.date)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-[#1f2a44]">
                      {record.expense_category || '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-[#1f2a44]">
                      {formatPaymentType(record.payment_type)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-[#1f2a44]">
                      {formatAmount(record.amount)}
                    </td>
                    <td className="max-w-[220px] truncate px-4 py-3.5 text-[#1f2a44]">
                      {record.details || '—'}
                    </td>
                    <td className="max-w-[220px] truncate px-4 py-3.5 text-[#1f2a44]">
                      {record.remarks || '—'}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          aria-label="Edit"
                          onClick={() => openEdit(record)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#e8eefc] text-[#0c29ab] transition-colors hover:bg-[#0c29ab] hover:text-white"
                        >
                          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm14.71-9.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          aria-label="Delete"
                          onClick={() => void handleDelete(record)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#fdeceb] text-[#ef2f15] transition-colors hover:bg-[#ef2f15] hover:text-white"
                        >
                          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </AdminTable>
        </AdminTableFrame>

        <div className="mt-4 space-y-3 rounded-2xl border border-[#dbe2f0] bg-[#f8faff] px-4 py-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-[#1a2a4a] sm:flex-row sm:items-center sm:gap-3">
              Budget month
              <input
                type="month"
                value={budgetMonth}
                onChange={(event) => setBudgetMonth(event.target.value)}
                className="min-h-10 rounded-xl border border-[#dbe2f0] bg-white px-3 text-sm font-normal text-[#1a1a1a] outline-none focus:border-[#0c29ab]"
              />
            </label>
            <p className="text-sm text-[#4a5568]">
              {formatYearMonthLabel(budgetMonth)}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-white px-3 py-3 ring-1 ring-[#e6ebf5]">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#7a8699]">
                Budget Amount
              </p>
              <p className="mt-1 font-[family-name:var(--font-righteous)] text-lg text-[#0c29ab]">
                {budgetAmount === null ? '—' : formatAmount(budgetAmount)}
              </p>
            </div>
            <div className="rounded-xl bg-white px-3 py-3 ring-1 ring-[#e6ebf5]">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#7a8699]">
                {hasMarks ? 'Marked Expense Total' : 'Filtered Expense Total'}
              </p>
              <p className="mt-1 font-[family-name:var(--font-righteous)] text-lg text-[#1a1a1a]">
                {formatAmount(totalExpense)}
              </p>
            </div>
            <div className="rounded-xl bg-white px-3 py-3 ring-1 ring-[#e6ebf5]">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#7a8699]">
                Amount Left
              </p>
              <p
                className={cn(
                  'mt-1 font-[family-name:var(--font-righteous)] text-lg',
                  remaining === null
                    ? 'text-[#7a8699]'
                    : remaining < 0
                      ? 'text-[#ef2f15]'
                      : 'text-[#1f9d55]',
                )}
              >
                {remaining === null ? '—' : formatAmount(remaining)}
              </p>
            </div>
          </div>
        </div>
      </section>

      <CashBookModal
        open={modalOpen}
        mode={modalMode}
        initialRecord={editingRecord}
        saving={saving}
        error={error}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />

      <MonthlyCashAllowanceModal
        open={allowanceOpen}
        initialMonth={budgetMonth}
        onClose={() => setAllowanceOpen(false)}
        onSaved={(yearMonth, amount) => {
          setBudgetMonth(yearMonth)
          setBudgetAmount(amount)
        }}
      />
    </>
  )
}
