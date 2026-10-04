import { useMemo, useState } from 'react'

import type { ScheduleRow } from '../../../schedule-gantt'

/**
 * First main activity open, the rest folded: the first paint is N readable
 * main-activity bars, not a wall of every imported row. `null` until the
 * reader touches it, so a re-derive of `rows` cannot undo an explicit choice.
 */
export function usePhaseFolding(rows: ScheduleRow[]) {
  const [collapsedByUser, setCollapsedByUser] =
    useState<ReadonlySet<string> | null>(null)
  const collapsedIds = useMemo(
    () =>
      collapsedByUser ??
      new Set(
        rows
          .filter((row) => row.level === 'task')
          .slice(1)
          .map((row) => row.id),
      ),
    [collapsedByUser, rows],
  )

  const toggleCollapse = (rowId: string) => {
    const next = new Set(collapsedIds)
    if (next.has(rowId)) next.delete(rowId)
    else next.add(rowId)
    setCollapsedByUser(next)
  }

  return { collapsedIds, toggleCollapse }
}
