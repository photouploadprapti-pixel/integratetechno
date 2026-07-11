'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { SisReportModal } from '@/components/admin/sis-report-modal'
import { AdminTable, AdminTableFrame } from '@/components/admin/admin-table'
import { sisColumns } from '@/data/admin'
import { formatDisplayDate } from '@/lib/mom'
import { parseOptionalNumber, sisServiceTypesLabel } from '@/lib/sis'
import { downloadSisReportPdf } from '@/lib/sis-pdf'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { SisReport, SisReportFormValues } from '@/types/sis'

/**
 * Live S/I/S Report list with create/edit modal backed by Supabase.
 */
export const SisReportsPanel = () => {
  const [reports, setReports] = useState<SisReport[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [editingReport, setEditingReport] = useState<SisReport | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [listError, setListError] = useState('')
  const [printingId, setPrintingId] = useState<string | null>(null)

  /**
   * Loads S/I/S reports from Supabase newest-first.
   */
  const loadReports = useCallback(async () => {
    setListError('')
    const supabase = createClient()
    const { data, error: fetchError } = await supabase
      .from('s_i_s_report')
      .select('*')
      .order('created_at', { ascending: false })

    if (fetchError) {
      setListError(fetchError.message)
      setReports([])
      setLoading(false)
      return
    }

    setReports((data || []) as SisReport[])
    setLoading(false)
  }, [])

  useEffect(() => {
    void loadReports()
  }, [loadReports])

  const filteredReports = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return reports
    return reports.filter((report) =>
      [
        report.customer_name,
        report.machine_equipment_name,
        report.model_no,
        report.machine_manufacturer,
        report.contact_person,
        report.phone,
        report.report_no,
        sisServiceTypesLabel(report.service_type),
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q)),
    )
  }, [query, reports])

  /**
   * Opens the modal in create mode.
   */
  const openCreate = () => {
    setModalMode('create')
    setEditingReport(null)
    setError('')
    setModalOpen(true)
  }

  /**
   * Opens the modal in edit mode with the selected report.
   * @param report - Report to edit
   */
  const openEdit = (report: SisReport) => {
    setModalMode('edit')
    setEditingReport(report)
    setError('')
    setModalOpen(true)
  }

  /**
   * Closes the modal when not saving.
   */
  const closeModal = () => {
    if (saving) return
    setModalOpen(false)
    setEditingReport(null)
    setError('')
  }

  /**
   * Saves a new or updated S/I/S report to Supabase.
   * @param values - Form values from the modal
   */
  const handleSubmit = async (values: SisReportFormValues) => {
    setSaving(true)
    setError('')

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const payload = {
      service_type: values.service_type.length > 0 ? values.service_type : null,
      customer_name: values.customer_name.trim() || null,
      location: values.location.trim() || null,
      report_no: values.report_no.trim() || null,
      date_of_report: values.date_of_report || null,
      work_starting_date: values.work_starting_date || null,
      work_ending_date: values.work_ending_date || null,
      mom_date: values.mom_date || null,
      contact_person: values.contact_person.trim() || null,
      dept_designation: values.dept_designation.trim() || null,
      email: values.email.trim() || null,
      phone: values.phone.trim() || null,
      machine_equipment_name: values.machine_equipment_name.trim() || null,
      machine_manufacturer: values.machine_manufacturer.trim() || null,
      model_no: values.model_no.trim() || null,
      sr_no: values.sr_no.trim() || null,
      year_of_installation: values.year_of_installation.trim() || null,
      under_warrenty: values.under_warrenty,
      customer_training_provided: values.customer_training_provided,
      under_amc: values.under_amc,
      environment_temp: values.environment_temp.trim() || null,
      rh: values.rh.trim() || null,
      amc_no: values.amc_no.trim() || null,
      visit: values.visit.trim() || null,
      nature_of_complaint: values.nature_of_complaint.trim() || null,
      observation: values.observation.trim() || null,
      action_taken: values.action_taken.trim() || null,
      result_after_action_taken: values.result_after_action_taken.trim() || null,
      spare_parts_required: values.spare_parts_required.trim() || null,
      next_visit_required: values.next_visit_required.trim() || null,
      after_three_months: values.after_three_months.trim() || null,
      if_changable: values.if_changable,
      service_charge: parseOptionalNumber(values.service_charge),
      lump_charge: parseOptionalNumber(values.lump_charge),
      total_charge: parseOptionalNumber(values.total_charge),
      debit_note_to_be_raised: values.debit_note_to_be_raised,
      debit_note_number: values.debit_note_number.trim() || null,
      debit_note_dt: values.debit_note_dt.trim() || null,
      customer_remarks: values.customer_remarks.trim() || null,
    }

    if (modalMode === 'edit' && editingReport) {
      const { error: updateError } = await supabase
        .from('s_i_s_report')
        .update(payload)
        .eq('id', editingReport.id)

      if (updateError) {
        setError(updateError.message)
        setSaving(false)
        return
      }
    } else {
      const { error: insertError } = await supabase.from('s_i_s_report').insert({
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
    setEditingReport(null)
    await loadReports()
  }

  /**
   * Deletes an S/I/S report after confirmation.
   * @param report - Report to delete
   */
  const handleDelete = async (report: SisReport) => {
    const confirmed = window.confirm(
      `Delete S/I/S report for "${report.customer_name || 'this customer'}"?`,
    )
    if (!confirmed) return

    const supabase = createClient()
    const { error: deleteError } = await supabase
      .from('s_i_s_report')
      .delete()
      .eq('id', report.id)

    if (deleteError) {
      setListError(deleteError.message)
      return
    }

    await loadReports()
  }

  /**
   * Generates and downloads an S/I/S Report PDF for one row.
   * @param report - Report to print
   */
  const handlePrint = async (report: SisReport) => {
    setPrintingId(report.id)
    setListError('')
    try {
      await downloadSisReportPdf(report)
    } catch (printError) {
      const message =
        printError instanceof Error ? printError.message : 'Failed to generate S/I/S PDF'
      setListError(message)
    } finally {
      setPrintingId(null)
    }
  }

  return (
    <>
      <section className="rounded-[24px] border border-[#e4e9f4] bg-white p-4 shadow-[0_10px_30px_rgba(16,36,94,0.06)] sm:p-6">
        <div className="mb-5">
          <label className="sr-only" htmlFor="sis-search">
            Search S/I/S reports
          </label>
          <input
            id="sis-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search for Service/Inst/Sales Report"
            className="min-h-12 w-full rounded-2xl border border-[#dbe2f0] bg-[#f8faff] px-4 text-sm text-[#1a1a1a] outline-none transition-colors placeholder:text-[#9aa3b5] focus:border-[#0c29ab] focus:bg-white"
          />
        </div>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="font-[family-name:var(--font-righteous)] text-lg text-[#1a1a1a] sm:text-xl">
            List of all Service/Installation/Sales Reports:
          </h1>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#0c29ab] px-5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(12,41,171,0.25)] transition-opacity hover:opacity-90"
          >
            Create S/I/S Report
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
                <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide">
                  Type
                </th>
                {sisColumns.map((column) => (
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
                    colSpan={sisColumns.length + 2}
                    className="px-4 py-10 text-center text-[#7a8699]"
                  >
                    Loading S/I/S reports...
                  </td>
                </tr>
              ) : filteredReports.length === 0 ? (
                <tr>
                  <td
                    colSpan={sisColumns.length + 2}
                    className="px-4 py-10 text-center text-[#7a8699]"
                  >
                    No S/I/S reports yet. Click Create S/I/S Report to add one.
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => (
                  <tr
                    key={report.id}
                    className="border-t border-[#eef1f7] transition-colors hover:bg-[#f8faff]"
                  >
                    <td className="whitespace-nowrap px-4 py-3.5 text-[#1f2a44]">
                      {sisServiceTypesLabel(report.service_type)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-[#1f2a44]">
                      {report.customer_name || '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-[#1f2a44]">
                      {report.machine_equipment_name || '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-[#1f2a44]">
                      {report.model_no || '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-[#1f2a44]">
                      {report.machine_manufacturer || '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-[#1f2a44]">
                      {formatDisplayDate(report.date_of_report)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-[#1f2a44]">
                      {[report.contact_person, report.phone].filter(Boolean).join(' ') || '—'}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          aria-label="Edit"
                          onClick={() => openEdit(report)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#e8eefc] text-[#0c29ab] transition-colors hover:bg-[#0c29ab] hover:text-white"
                        >
                          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm14.71-9.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          aria-label="Delete"
                          onClick={() => void handleDelete(report)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#fdeceb] text-[#ef2f15] transition-colors hover:bg-[#ef2f15] hover:text-white"
                        >
                          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          aria-label="Print"
                          disabled={printingId === report.id}
                          onClick={() => void handlePrint(report)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#eef1f6] text-[#1a1a1a] transition-colors hover:bg-[#1a1a1a] hover:text-white disabled:opacity-50"
                        >
                          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
                            <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z" />
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

      <SisReportModal
        open={modalOpen}
        mode={modalMode}
        initialReport={editingReport}
        saving={saving}
        error={error}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />
    </>
  )
}
