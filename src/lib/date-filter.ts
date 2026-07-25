/** Date filter modes for admin table filtering. */
export type DateFilterMode = 'all' | 'month' | 'range'

/** Shared date-filter state used across admin panels. */
export type DateFilterValue = {
  mode: DateFilterMode
  /** YYYY-MM when mode is `month`. */
  month: string
  /** YYYY-MM-DD inclusive start when mode is `range`. */
  from: string
  /** YYYY-MM-DD inclusive end when mode is `range`. */
  to: string
}

/** Empty / inactive date filter defaults. */
export const emptyDateFilter = (): DateFilterValue => ({
  mode: 'all',
  month: '',
  from: '',
  to: '',
})

/**
 * Normalizes a DB date or timestamp into YYYY-MM-DD for comparison.
 * @param value - Date string from Supabase (date or timestamptz)
 */
export const toDateKey = (value: string | null | undefined): string | null => {
  if (!value) return null
  const key = value.slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return null
  return key
}

/**
 * Returns true when `value` passes the active date filter.
 * Records with missing dates are excluded while a filter is active.
 * @param value - Record date (YYYY-MM-DD or ISO timestamp)
 * @param filter - Active date filter state
 */
export const matchesDateFilter = (
  value: string | null | undefined,
  filter: DateFilterValue,
): boolean => {
  if (filter.mode === 'all') return true

  const key = toDateKey(value)
  if (!key) return false

  if (filter.mode === 'month') {
    if (!filter.month) return true
    return key.startsWith(filter.month)
  }

  if (filter.from && key < filter.from) return false
  if (filter.to && key > filter.to) return false
  return Boolean(filter.from || filter.to)
}

/**
 * Whether any date constraint is currently applied.
 * @param filter - Date filter state
 */
export const isDateFilterActive = (filter: DateFilterValue) => {
  if (filter.mode === 'month') return Boolean(filter.month)
  if (filter.mode === 'range') return Boolean(filter.from || filter.to)
  return false
}
