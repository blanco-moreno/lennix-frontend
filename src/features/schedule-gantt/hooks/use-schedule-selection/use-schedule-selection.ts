import { useCallback } from 'react'
import { useSearchParams } from 'react-router'

import { SCHEDULE_TASK_PARAM, resolveScheduleSelection } from '@/router'

/**
 * The schedule's selected row, kept in the URL: a selected row is a link.
 *
 * It resolves against every row the surface loaded, not the visible ones, so a
 * filter or a fold narrows what is drawn without dropping the selection.
 * Selecting `replace`s the entry — it is a mode of the surface, and pushing one
 * per click would make Back undo clicks before it left the schedule.
 */
export function useScheduleSelection(rows: readonly { id: string }[]) {
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedRowId = resolveScheduleSelection(
    searchParams.get(SCHEDULE_TASK_PARAM),
    rows,
  )

  const selectRow = useCallback(
    (rowId: string | null) => {
      const next = new URLSearchParams(searchParams)
      if (rowId) next.set(SCHEDULE_TASK_PARAM, rowId)
      else next.delete(SCHEDULE_TASK_PARAM)
      setSearchParams(next, { replace: true })
    },
    [searchParams, setSearchParams],
  )

  return { selectedRowId, selectRow }
}
