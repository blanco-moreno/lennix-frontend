import type { ProjectActivity } from '@/types'

import { groupByDay } from './history-model'

const entry = (id: string, occurredAt: string): ProjectActivity => ({
  id,
  occurredAt,
  actorId: null,
  actorName: null,
  action: 'task.completed',
  entityType: 'task',
  entityId: null,
  entityName: 'Cimentacion',
  oldValue: null,
  newValue: null,
})

describe('groupByDay', () => {
  it('groups entries per calendar day, newest day and entry first', () => {
    const grouped = groupByDay([
      entry('a', '2026-07-20T08:00:00Z'),
      entry('b', '2026-07-22T09:00:00Z'),
      entry('c', '2026-07-22T18:00:00Z'),
    ])

    expect(grouped.map((g) => g.day)).toEqual(['2026-07-22', '2026-07-20'])
    expect(grouped[0].entries.map((e) => e.id)).toEqual(['c', 'b'])
  })
})
