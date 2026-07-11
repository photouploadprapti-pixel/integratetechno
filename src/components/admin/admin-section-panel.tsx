'use client'

import { useMemo, useState } from 'react'

import type { AdminTableColumn, AdminTableRow } from '@/types/admin'
import { cn } from '@/lib/utils'

/**
 * Shared searchable list panel used by Super Admin modules.
 * @param title - Section heading
 * @param searchPlaceholder - Search input placeholder
 * @param actionLabel - Primary create/add button label
 * @param columns - Table column definitions
 * @param rows - Table data rows
 * @param showPrint - Whether to show the print action icon
 */
export const AdminSectionPanel = ({
  title,
  searchPlaceholder,
  actionLabel,
  columns,
  rows,
  showPrint = false,
}: {
  title: string
  searchPlaceholder: string
  actionLabel: string
  columns: AdminTableColumn[]
  rows: AdminTableRow[]
  showPrint?: boolean
}) => {
  const [query, setQuery] = useState('')

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((row) =>
      Object.values(row).some((value) => value.toLowerCase().includes(q)),
    )
  }, [query, rows])

  return (
    <section className="rounded-[24px] border border-[#e4e9f4] bg-white p-4 shadow-[0_10px_30px_rgba(16,36,94,0.06)] sm:p-6">
      <div className="mb-5">
        <label className="sr-only" htmlFor="admin-search">
          Search
        </label>
        <input
          id="admin-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={searchPlaceholder}
          className="min-h-12 w-full rounded-2xl border border-[#dbe2f0] bg-[#f8faff] px-4 text-sm text-[#1a1a1a] outline-none transition-colors placeholder:text-[#9aa3b5] focus:border-[#0c29ab] focus:bg-white"
        />
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-[family-name:var(--font-righteous)] text-lg text-[#1a1a1a] sm:text-xl">
          {title}
        </h1>
        <button
          type="button"
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#0c29ab] px-5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(12,41,171,0.25)] transition-opacity hover:opacity-90"
        >
          {actionLabel}
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[#e8ecf5]">
        <table className="min-w-full border-collapse text-left text-sm">
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
            {filteredRows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="px-4 py-10 text-center text-[#7a8699]"
                >
                  No records found.
                </td>
              </tr>
            ) : (
              filteredRows.map((row, index) => (
                <tr
                  key={row.id || String(index)}
                  className="border-t border-[#eef1f7] transition-colors hover:bg-[#f8faff]"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="whitespace-nowrap px-4 py-3.5 text-[#1f2a44]"
                    >
                      {row[column.key] || '—'}
                    </td>
                  ))}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label="Edit"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#e8eefc] text-[#0c29ab] transition-colors hover:bg-[#0c29ab] hover:text-white"
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
                          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm14.71-9.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        aria-label="Delete"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#fdeceb] text-[#ef2f15] transition-colors hover:bg-[#ef2f15] hover:text-white"
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
                          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                        </svg>
                      </button>
                      {showPrint ? (
                        <button
                          type="button"
                          aria-label="Print"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#eef1f6] text-[#1a1a1a] transition-colors hover:bg-[#1a1a1a] hover:text-white"
                        >
                          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
                            <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z" />
                          </svg>
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
