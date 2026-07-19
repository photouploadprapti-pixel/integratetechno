'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { LocalSalesModal } from '@/components/admin/local-sales-modal'
import { AdminTable, AdminTableFrame } from '@/components/admin/admin-table'
import { localSalesColumns } from '@/data/admin'
import { getUserRole } from '@/lib/auth/roles'
import {
  formatLocalSalesMoney,
  getLocalSalesCreatorName,
  parseLocalSalesNumber,
} from '@/lib/local-sales'
import { formatDisplayDate } from '@/lib/mom'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/types/admin'
import type { LocalSalesFormValues, LocalSalesRecord } from '@/types/local-sales'

/**
 * Live Local Sales list with create/edit modal and role-based ownership.
 * Admins only see their own rows; super_admin sees all with creator email.
 */
export const LocalSalesPanel = () => {
  const [records, setRecords] = useState<LocalSalesRecord[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [editingRecord, setEditingRecord] = useState<LocalSalesRecord | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [listError, setListError] = useState('')
  const [role, setRole] = useState<UserRole | null>(null)

  const isSuperAdmin = role === 'super_admin'
  const columns = useMemo(
    () =>
      isSuperAdmin
        ? localSalesColumns
        : localSalesColumns.filter((column) => column.key !== 'createdBy'),
    [isSuperAdmin],
  )

  /**
   * Loads local sales rows visible to the signed-in user.
   */
  const loadRecords = useCallback(async () => {
    setListError('')
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    const userRole = getUserRole(user)
    setRole(userRole)

    let queryBuilder = supabase
      .from('local_sales')
      .select('*, creator:users!created_by(email, name)')
      .order('created_at', { ascending: false })

    if (userRole === 'admin' && user?.id) {
      queryBuilder = queryBuilder.eq('created_by', user.id)
    }

    const { data, error: fetchError } = await queryBuilder

    if (fetchError) {
      setListError(fetchError.message)
      setRecords([])
      setLoading(false)
      return
    }

    setRecords((data || []) as LocalSalesRecord[])
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
        record.manufacturer_name,
        record.customer_name,
        record.remarks,
        record.purchase_amount !== null ? String(record.purchase_amount) : '',
        record.sales_amount !== null ? String(record.sales_amount) : '',
        record.commission_amount !== null ? String(record.commission_amount) : '',
        getLocalSalesCreatorName(record),
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
  const openEdit = (record: LocalSalesRecord) => {
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
   * Saves a new or updated local sales record to Supabase.
   * @param values - Form values from the modal
   */
  const handleSubmit = async (values: LocalSalesFormValues) => {
    setSaving(true)
    setError('')

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user?.id) {
      setError('You must be signed in to save.')
      setSaving(false)
      return
    }

    const payload = {
      delivery_date: values.delivery_date || null,
      manufacturer_name: values.manufacturer_name.trim() || null,
      customer_name: values.customer_name.trim() || null,
      purchase_amount: parseLocalSalesNumber(values.purchase_amount),
      sales_amount: parseLocalSalesNumber(values.sales_amount),
      commission_amount: parseLocalSalesNumber(values.commission_amount),
      remarks: values.remarks.trim() || null,
    }

    if (modalMode === 'edit' && editingRecord) {
      const { error: updateError } = await supabase
        .from('local_sales')
        .update(payload)
        .eq('id', editingRecord.id)

      if (updateError) {
        setError(updateError.message)
        setSaving(false)
        return
      }
    } else {
      const { error: insertError } = await supabase.from('local_sales').insert({
        ...payload,
        created_by: user.id,
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
   * Deletes a local sales record after confirmation.
   * @param record - Record to delete
   */
  const handleDelete = async (record: LocalSalesRecord) => {
    const confirmed = window.confirm(
      `Delete local sales for "${record.customer_name || 'this entry'}"?`,
    )
    if (!confirmed) return

    const supabase = createClient()
    const { error: deleteError } = await supabase
      .from('local_sales')
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
          <label className="sr-only" htmlFor="local-sales-search">
            Search local sales records
          </label>
          <input
            id="local-sales-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search Local Sales"
            className="min-h-12 w-full rounded-2xl border border-[#dbe2f0] bg-[#f8faff] px-4 text-sm text-[#1a1a1a] outline-none transition-colors placeholder:text-[#9aa3b5] focus:border-[#0c29ab] focus:bg-white"
          />
        </div>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="font-[family-name:var(--font-righteous)] text-lg text-[#1a1a1a] sm:text-xl">
            List of Local Sales:
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
                {columns.map((column) => (
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
                    colSpan={columns.length + 1}
                    className="px-4 py-10 text-center text-[#7a8699]"
                  >
                    Loading local sales records...
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + 1}
                    className="px-4 py-10 text-center text-[#7a8699]"
                  >
                    No local sales records yet. Click Add Data to create one.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr
                    key={record.id}
                    className="border-t border-[#eef1f7] transition-colors hover:bg-[#f8faff]"
                  >
                    <td className="whitespace-nowrap px-4 py-3.5 text-[#1f2a44]">
                      {formatDisplayDate(record.delivery_date)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-[#1f2a44]">
                      {record.manufacturer_name || '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-[#1f2a44]">
                      {record.customer_name || '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-[#1f2a44]">
                      {formatLocalSalesMoney(record.purchase_amount)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-[#1f2a44]">
                      {formatLocalSalesMoney(record.sales_amount)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-[#1f2a44]">
                      {formatLocalSalesMoney(record.commission_amount)}
                    </td>
                    <td className="max-w-[220px] truncate px-4 py-3.5 text-[#1f2a44]">
                      {record.remarks || '—'}
                    </td>
                    {isSuperAdmin ? (
                      <td className="whitespace-nowrap px-4 py-3.5 text-[#1f2a44]">
                        {getLocalSalesCreatorName(record)}
                      </td>
                    ) : null}
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

      <LocalSalesModal
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
