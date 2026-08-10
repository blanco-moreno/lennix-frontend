/**
 * Flips a date column's day/month order. Two rows are deliberately left alone:
 * a row the user already edited is pinned (reported as a conflict, never
 * overwritten), and a row whose day is above 12 has no other reading to apply.
 */

import type { ReviewTask } from '@/types'

/** Which date the ledger cause decided — the contract's own naming. */
export type DateColumn = 'start' | 'finish'

/** The API field each column writes to. */
export const FIELD_BY_COLUMN = {
  start: 'start_date',
  finish: 'due_date',
} as const

export interface FlipEdit {
  level: 'task' | 'subtask'
  id: string
  title: string
  field: (typeof FIELD_BY_COLUMN)[DateColumn]
  from: string
  to: string
}

/** A pinned row a re-read would have touched — surfaced, never overwritten. */
export interface FlipConflict {
  id: string
  title: string
  current: string
  wouldBecome: string
}

export interface DateOrderFlipPlan {
  column: DateColumn
  edits: FlipEdit[]
  conflicts: FlipConflict[]
  /** Rows the file itself settles (day above 12): no alternative reading. */
  settled: number
}

/**
 * `2026-09-01` → `2026-01-09`, or `null` when the date has no other reading.
 *
 * The swapped day comes from a month, so it is always 1–12 and always a real
 * day of its new month — the flip can never produce an impossible date.
 */
export function swapDayMonth(iso: string): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!match) return null

  const [, year, month, day] = match
  if (Number(day) > 12 || Number(day) < 1) return null
  if (month === day) return null

  return `${year}-${day}-${month}`
}

function readDate(
  row: { startDate: string | null; dueDate: string | null },
  column: DateColumn,
): string | null {
  return column === 'start' ? row.startDate : row.dueDate
}

/**
 * How a row the flip itself wrote is told apart from one the user edited.
 *
 * The server records both as "edited" — it compares the live row against the
 * import and cannot know which hand moved it. The flip therefore remembers its
 * own writes, so pressing it again undoes them instead of mistaking them for
 * hand work and refusing.
 */
export function flipKey(column: DateColumn, rowId: string): string {
  return `${column}:${rowId}`
}

/**
 * What flipping this column would do — computed before anything is written, so
 * the user reads the blast radius and the conflicts before agreeing to them.
 */
export function planDateOrderFlip(
  tasks: ReviewTask[],
  column: DateColumn,
  /** Rows a previous flip wrote — edited, but not by hand (see `flipKey`). */
  flipOwned: ReadonlySet<string> = new Set(),
): DateOrderFlipPlan {
  const edits: FlipEdit[] = []
  const conflicts: FlipConflict[] = []
  let settled = 0

  // Only subactivity rows: a phase's dates derive from its subactivities and
  // the task endpoint accepts none, so a phase edit would be dropped unwritten.
  const rows = tasks.flatMap((task) =>
    task.subtasks.map((subtask) => ({
      row: subtask,
      level: 'subtask' as const,
    })),
  )

  for (const { row, level } of rows) {
    const current = readDate(row, column)
    if (!current) continue

    const swapped = swapDayMonth(current)
    if (!swapped) {
      settled += 1
      continue
    }

    if (row.edited && !flipOwned.has(flipKey(column, row.id))) {
      conflicts.push({
        id: row.id,
        title: row.title,
        current,
        wouldBecome: swapped,
      })
      continue
    }

    edits.push({
      level,
      id: row.id,
      title: row.title,
      field: FIELD_BY_COLUMN[column],
      from: current,
      to: swapped,
    })
  }

  return { column, edits, conflicts, settled }
}
