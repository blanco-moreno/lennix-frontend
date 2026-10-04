import { act, renderHook } from '@testing-library/react'

import type { ScheduleRow } from '../../../schedule-gantt'

import { usePhaseFolding } from './use-phase-folding'

const row = (id: string, level: ScheduleRow['level']) =>
  ({ id, level }) as ScheduleRow

const rows = [
  row('p1', 'task'),
  row('s1', 'subtask'),
  row('p2', 'task'),
  row('p3', 'task'),
]

describe('usePhaseFolding', () => {
  it('opens the first main activity and folds the rest', () => {
    const { result } = renderHook(() => usePhaseFolding(rows))

    expect([...result.current.collapsedIds]).toEqual(['p2', 'p3'])
  })

  it('keeps the reader’s own folding once they touched it', () => {
    const { result, rerender } = renderHook(
      ({ current }) => usePhaseFolding(current),
      { initialProps: { current: rows } },
    )

    act(() => result.current.toggleCollapse('p1'))
    rerender({ current: [...rows] })

    expect(result.current.collapsedIds.has('p1')).toBe(true)
    expect(result.current.collapsedIds.has('p2')).toBe(true)
  })
})
