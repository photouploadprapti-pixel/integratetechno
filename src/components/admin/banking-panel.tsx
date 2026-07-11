'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { BankingModal } from '@/components/admin/banking-modal'
import { AdminTable, AdminTableFrame } from '@/components/admin/admin-table'
import { bankingColumns } from '@/data/admin'
import { formatBankName } from '@/lib/banking'
import { formatAmount, formatPaymentType, parseAmount } from '@/lib/cash-book'
import { formatDisplayDate } from '@/lib/mom'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { BankingFormValues, BankingRecord } from '@/types/banking'

/**
 * Live Banking (bank_stat) list with create/edit modal backed by Supabase.
 */
export const BankingPanel = () => {
  const [records, setRecords] = useState<BankingRecord[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [editingRecord, setEditingRecord] = useState<BankingRecord | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [listError, setListError] = useState('')

  /**
   * Loads banking records from Supabase newest-first.
   */
  const loadRecords = useCallback(async () => {
    setListError('')
    const supabase = createClient()
    const { data, error: fetchError } = await supabase
      .from('bank_stat')
      .select('*')
      .order('created_at', { ascending: false })

    if (fetchError) {
      setListError(fetchError.message)
      setRecords([])
      setLoading(false)
      return
    }

    setRecords((data || []) as BankingRecord[])
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
        formatPaymentType(record.payment_type),
        formatBankName(record.bank_name),
        record.remarks,
        record.received ? 'yes' : 'no',
        record.amount !== null ? String(record.amount) : '',
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
  const openEdit = (record: BankingRecord) => {
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
   * Saves a new or updated banking record to Supabase.
   * @param values - Form values from the modal
   */
  const handleSubmit = async (values: BankingFormValues) => {
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
      bank_name: values.bank_name || null,
      remarks: values.remarks.trim() || null,
      received: values.received,
    }

    if (modalMode === 'edit' && editingRecord) {
      const { error: updateError } = await supabase
        .from('bank_stat')
        .update(payload)
        .eq('id', editingRecord.id)

      if (updateError) {
        setError(updateError.message)
        setSaving(false)
        return
      }
    } else {
      const { error: insertError } = await supabase.from('bank_stat').insert({
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
   * Deletes a banking record after confirmation.
   * @param record - Record to delete
   */
  const handleDelete = async (record: BankingRecord) => {
    const confirmed = window.confirm('Delete this banking entry?')
    if (!confirmed) return

    const supabase = createClient()
    const { error: deleteError } = await supabase
      .from('bank_stat')
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
          <label className="sr-only" htmlFor="banking-search">
            Search banking
          </label>
          <input
            id="banking-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search for Bank"
            className="min-h-12 w-full rounded-2xl border border-[#dbe2f0] bg-[#f8faff] px-4 text-sm text-[#1a1a1a] outline-none transition-colors placeholder:text-[#9aa3b5] focus:border-[#0c29ab] focus:bg-white"
          />
        </div>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="font-[family-name:var(--font-righteous)] text-lg text-[#1a1a1a] sm:text-xl">
            Bank A/C Standings:
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
                {bankingColumns.map((column) => (
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
                    colSpan={bankingColumns.length + 1}
                    className="px-4 py-10 text-center text-[#7a8699]"
                  >
                    Loading banking records...
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td
                    colSpan={bankingColumns.length + 1}
                    className="px-4 py-10 text-center text-[#7a8699]"
                  >
                    No banking records yet. Click Add Data to create one.
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
                      {formatPaymentType(record.payment_type)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-[#1f2a44]">
                      {formatAmount(record.amount)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-[#1f2a44]">
                      {formatBankName(record.bank_name)}
                    </td>
                    <td className="max-w-[220px] truncate px-4 py-3.5 text-[#1f2a44]">
                      {record.remarks || '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-[#1f2a44]">
                      {record.received ? 'Yes' : 'No'}
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

      <BankingModal
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
