/**
 * The pure model behind the review canvas: rows order by the file's own dates
 * (source dates are authoritative until go-live).
 */

import { parseDay } from '@/utils'

/** Undated rows sort last: they are unplaceable, not "starting at epoch". */
function startKey(row: { startDate: string | null; dueDate: string | null }) {
  return row.startDate ?? row.dueDate ?? '9999-12-31'
}

export function sortChronologically<
  T extends { startDate: string | null; dueDate: string | null },
>(rows: T[]): T[] {
  return [...rows].sort((a, b) => startKey(a).localeCompare(startKey(b)))
}

/** Inclusive-start day count between two ISO days; null when either is missing. */
export function spanDays(
  start: string | null,
  end: string | null,
): number | null {
  if (!start || !end) return null
  const ms = parseDay(end).getTime() - parseDay(start).getTime()
  return Math.max(0, Math.round(ms / 86_400_000))
}
