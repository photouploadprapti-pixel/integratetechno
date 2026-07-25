'use client'

import { cn } from '@/lib/utils'
import type { DateFilterValue } from '@/lib/date-filter'

type DateRangeFilterProps = {
  value: DateFilterValue
  onChange: (next: DateFilterValue) => void
  className?: string
}

/**
 * Month / date-range filter control for admin tables (top-right placement).
 * @param value - Current filter state
 * @param onChange - Called when the filter changes
 * @param className - Optional wrapper classes
 */
export const DateRangeFilter = ({
  value,
  onChange,
  className,
}: DateRangeFilterProps) => {
  /**
   * Switches filter mode and clears unused fields.
   * @param mode - Next filter mode
   */
  const setMode = (mode: DateFilterValue['mode']) => {
    onChange({
      mode,
      month: mode === 'month' ? value.month : '',
      from: mode === 'range' ? value.from : '',
      to: mode === 'range' ? value.to : '',
    })
  }

  return (
    <div
      className={cn(
        'flex flex-col items-stretch gap-2 sm:items-end',
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-end gap-1.5">
        {(
          [
            { id: 'all', label: 'All dates' },
            { id: 'month', label: 'Month' },
            { id: 'range', label: 'Range' },
          ] as const
        ).map((option) => {
          const active = value.mode === option.id
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setMode(option.id)}
              className={cn(
                'inline-flex min-h-8 items-center rounded-full px-3 text-xs font-semibold transition-colors',
                active
                  ? 'bg-[#0c29ab] text-white'
                  : 'border border-[#dbe2f0] bg-[#f8faff] text-[#1a2a4a] hover:border-[#0c29ab]/40',
              )}
            >
              {option.label}
            </button>
          )
        })}
      </div>

      {value.mode === 'month' ? (
        <label className="flex items-center gap-2 text-xs font-semibold text-[#4a5568]">
          Month
          <input
            type="month"
            value={value.month}
            onChange={(event) =>
              onChange({ ...value, month: event.target.value })
            }
            className="min-h-9 rounded-xl border border-[#dbe2f0] bg-white px-3 text-sm font-normal text-[#1a1a1a] outline-none focus:border-[#0c29ab]"
          />
        </label>
      ) : null}

      {value.mode === 'range' ? (
        <div className="flex flex-wrap items-center justify-end gap-2">
          <label className="flex items-center gap-2 text-xs font-semibold text-[#4a5568]">
            From
            <input
              type="date"
              value={value.from}
              onChange={(event) =>
                onChange({ ...value, from: event.target.value })
              }
              className="min-h-9 rounded-xl border border-[#dbe2f0] bg-white px-3 text-sm font-normal text-[#1a1a1a] outline-none focus:border-[#0c29ab]"
            />
          </label>
          <label className="flex items-center gap-2 text-xs font-semibold text-[#4a5568]">
            To
            <input
              type="date"
              value={value.to}
              onChange={(event) =>
                onChange({ ...value, to: event.target.value })
              }
              className="min-h-9 rounded-xl border border-[#dbe2f0] bg-white px-3 text-sm font-normal text-[#1a1a1a] outline-none focus:border-[#0c29ab]"
            />
          </label>
        </div>
      ) : null}
    </div>
  )
}
