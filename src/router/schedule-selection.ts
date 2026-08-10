/**
 * The schedule's selected row, held in `?task=`. Two guarantees: a stale
 * link paints nothing (an unknown id resolves to no selection), and a filter
 * never drops the selection (callers resolve against every loaded row).
 */

export const SCHEDULE_TASK_PARAM = 'task'

/** The shape the resolver needs — any schedule row satisfies it. */
interface IdentifiedRow {
  id: string
}

export function resolveScheduleSelection(
  value: string | null | undefined,
  rows: readonly IdentifiedRow[],
): string | null {
  if (!value) return null
  return rows.some((row) => row.id === value) ? value : null
}
