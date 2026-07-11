'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { IncomeModal } from '@/components/admin/income-modal'
import { AdminTable, AdminTableFrame } from '@/components/admin/admin-table'
import { incomeColumns } from '@/data/admin'
import { formatMoney, parseIncomeNumber } from '@/lib/income'
import { formatDisplayDate } from '@/lib/mom'
import { formatBankName } from '@/lib/options'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { IncomeFormValues, IncomeRecord } from '@/types/income'

/**
 * Live L.C./Income Per Annum list with create/edit modal backed by Supabase.
 */
export const IncomePanel = () => {
  const [records, setRecords] = useState<IncomeRecord[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [editingRecord, setEditingRecord] = useState<IncomeRecord | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [listError, setListError] = useState('')

  /**
   * Loads income records from Supabase newest-first.
   */
  const loadRecords = useCallback(async () => {
    setListError('')
    const supabase = createClient()
    const { data, error: fetchError } = await supabase
      .from('income_per_annum')
      .select('*')
      .order('created_at', { ascending: false })

    if (fetchError) {
      setListError(fetchError.message)
      setRecords([])
      setLoading(false)
      return
    }

    setRecords((data || []) as IncomeRecord[])
    setLoading(false)
  }, [])

  useEffect(() => {
    void loadRecords()
  }, [loadRecords])

  const filteredRecords = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return records
    return records.filter((record) =>
      [
        record.lc_no,
        record.customer,
        record.manufacturer,
        record.remarks,
        record.amount !== null ? String(record.amount) : '',
        record.commission !== null ? String(record.commission) : '',
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q)),
    )
  }, [query, records])

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
  const openEdit = (record: IncomeRecord) => {
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
   * Saves a new or updated income record to Supabase.
   * @param values - Form values from the modal
   */
  const handleSubmit = async (values: IncomeFormValues) => {
    setSaving(true)
    setError('')

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const payload = {
      lc_no: values.lc_no.trim() || null,
      customer: values.customer.trim() || null,
      date: values.date || null,
      date_of_issue: values.date_of_issue || null,
      date_of_ship: values.date_of_ship || null,
      date_of_export: values.date_of_export || null,
      manufacturer: values.manufacturer.trim() || null,
      amount: parseIncomeNumber(values.amount),
      commission: parseIncomeNumber(values.commission),
      bank: values.bank || null,
      remarks: values.remarks.trim() || null,
    }

    if (modalMode === 'edit' && editingRecord) {
      const { error: updateError } = await supabase
        .from('income_per_annum')
        .update(payload)
        .eq('id', editingRecord.id)

      if (updateError) {
        setError(updateError.message)
        setSaving(false)
        return
      }
    } else {
      const { error: insertError } = await supabase.from('income_per_annum').insert({
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
   * Deletes an income record after confirmation.
   * @param record - Record to delete
   */
  const handleDelete = async (record: IncomeRecord) => {
    const confirmed = window.confirm(
      `Delete income record for L/C "${record.lc_no || 'this entry'}"?`,
    )
    if (!confirmed) return

    const supabase = createClient()
    const { error: deleteError } = await supabase
      .from('income_per_annum')
      .delete()
      .eq('id', record.id)

    if (deleteError) {
      setListError(deleteError.message)
      return
    }

    await loadRecords()
  }

  return (
    <>
      <section className="rounded-[24px] border border-[#e4e9f4] bg-white p-4 shadow-[0_10px_30px_rgba(16,36,94,0.06)] sm:p-6">
        <div className="mb-5">
          <label className="sr-only" htmlFor="income-search">
            Search income records
          </label>
          <input
            id="income-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search in Income per Annum"
            className="min-h-12 w-full rounded-2xl border border-[#dbe2f0] bg-[#f8faff] px-4 text-sm text-[#1a1a1a] outline-none transition-colors placeholder:text-[#9aa3b5] focus:border-[#0c29ab] focus:bg-white"
          />
        </div>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="font-[family-name:var(--font-righteous)] text-lg text-[#1a1a1a] sm:text-xl">
            L.C./Income per Annum:
          </h1>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#0c29ab] px-5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(12,41,171,0.25)] transition-opacity hover:opacity-90"
          >
            Add Data
          </button>
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
                {incomeColumns.map((column) => (
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
                    colSpan={incomeColumns.length + 1}
                    className="px-4 py-10 text-center text-[#7a8699]"
                  >
                    Loading income records...
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td
                    colSpan={incomeColumns.length + 1}
                    className="px-4 py-10 text-center text-[#7a8699]"
                  >
                    No income records yet. Click Add Data to create one.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr
                    key={record.id}
                    className="border-t border-[#eef1f7] transition-colors hover:bg-[#f8faff]"
                  >
                    <td className="whitespace-nowrap px-4 py-3.5 text-[#1f2a44]">
                      {formatDisplayDate(record.date)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-[#1f2a44]">
                      {record.lc_no || '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-[#1f2a44]">
                      {formatDisplayDate(record.date_of_issue)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-[#1f2a44]">
                      {formatDisplayDate(record.date_of_ship)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-[#1f2a44]">
                      {formatDisplayDate(record.date_of_export)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-[#1f2a44]">
                      {record.customer || '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-[#1f2a44]">
                      {record.manufacturer || '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-[#1f2a44]">
                      {formatMoney(record.amount)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-[#1f2a44]">
                      {formatMoney(record.commission)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-[#1f2a44]">
                      {formatBankName(record.bank)}
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
      </section>

      <IncomeModal
        open={modalOpen}
        mode={modalMode}
        initialRecord={editingRecord}
        saving={saving}
        error={error}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />
    </>
  )
}
