import type { ReviewDependency, ReviewSubtask, ReviewTask } from '@/types'

import {
  buildReviewGanttEdges,
  buildReviewScheduleRows,
} from './review-gantt-rows'

const subtask = (
  over: Partial<ReviewSubtask> & { id: string },
): ReviewSubtask => ({
  ref: null,
  title: over.id,
  description: null,
  startDate: null,
  dueDate: null,
  progress: 0,
  assigneeId: null,
  systemGenerated: false,
  edited: false,
  source: null,
  sourceParentRef: null,
  depth: 1,
  path: [],
  ...over,
})

const task = (over: Partial<ReviewTask> & { id: string }): ReviewTask => ({
  ref: null,
  title: over.id,
  description: null,
  startDate: null,
  dueDate: null,
  budget: null,
  progress: 0,
  edited: false,
  source: null,
  subtasks: [],
  ...over,
})

describe('buildReviewScheduleRows', () => {
  it('flattens phases chronologically, each followed by its own activities', () => {
    const rows = buildReviewScheduleRows([
      task({
        id: 'late',
        startDate: '2026-03-01',
        dueDate: '2026-03-10',
        subtasks: [
          subtask({ id: 'late-b', startDate: '2026-03-05' }),
          subtask({ id: 'late-a', startDate: '2026-03-01' }),
        ],
      }),
      task({ id: 'early', startDate: '2026-01-01', dueDate: '2026-01-20' }),
    ])

    expect(rows.map((row) => row.id)).toEqual([
      'early',
      'late',
      'late-a',
      'late-b',
    ])
    expect(rows[1].level).toBe('task')
    expect(rows[2]).toMatchObject({ level: 'subtask', parentId: 'late' })
  })

  it('names the collapsed branch so flattened rows are not identical bars', () => {
    const rows = buildReviewScheduleRows([
      task({
        id: 'fosos',
        subtasks: [
          subtask({
            id: 'a',
            title: 'Colocación moldaje',
            depth: 3,
            path: ['Piscina 1', 'Diente 1'],
          }),
          subtask({
            id: 'b',
            title: 'Colocación moldaje',
            depth: 3,
            path: ['Piscina 1', 'Diente 2'],
          }),
          subtask({ id: 'c', title: 'Excavación', depth: 1 }),
        ],
      }),
    ])

    const titles = rows.filter((row) => row.level === 'subtask')
    expect(titles.map((row) => row.title)).toEqual([
      'Piscina 1 › Diente 1 › Colocación moldaje',
      'Piscina 1 › Diente 2 › Colocación moldaje',
      // A direct child was never flattened, so it carries no breadcrumb.
      'Excavación',
    ])
  })

  it('spans a dateless phase across its activities', () => {
    const [phase] = buildReviewScheduleRows([
      task({
        id: 'task',
        subtasks: [
          subtask({ id: 'a', startDate: '2026-02-01', dueDate: '2026-02-04' }),
          subtask({ id: 'b', startDate: '2026-02-10', dueDate: '2026-02-28' }),
        ],
      }),
    ])

    expect(phase.startDate).toBe('2026-02-01')
    expect(phase.dueDate).toBe('2026-02-28')
  })

  it('claims nothing the engine has not computed yet', () => {
    const [row] = buildReviewScheduleRows([
      task({ id: 'a', startDate: '2026-01-01', dueDate: '2026-01-02' }),
    ])

    expect(row).toMatchObject({
      status: 'todo',
      delayDays: 0,
      isBlocked: false,
      isCriticalPath: false,
    })
  })

  it('leaves an undated row undated instead of placing it at epoch', () => {
    const rows = buildReviewScheduleRows([
      task({ id: 'dated', startDate: '2026-01-01', dueDate: '2026-01-02' }),
      task({ id: 'undated' }),
    ])

    expect(rows.map((row) => row.id)).toEqual(['dated', 'undated'])
    expect(rows[1].startDate).toBeNull()
    expect(rows[1].dueDate).toBeNull()
  })
})

describe('buildReviewGanttEdges', () => {
  const rows = buildReviewScheduleRows([
    task({ id: 'a', startDate: '2026-01-01', dueDate: '2026-01-05' }),
    task({ id: 'b', startDate: '2026-01-06', dueDate: '2026-01-09' }),
  ])
  const edge = (over: Partial<ReviewDependency>): ReviewDependency => ({
    id: 1,
    taskId: 'b',
    dependsOnId: 'a',
    relationshipType: 'FS',
    lagDays: 0,
    source: 'file',
    ...over,
  })

  it('draws an edge between two rows the preview holds', () => {
    const [drawn] = buildReviewGanttEdges([edge({})], rows)

    expect(drawn).toMatchObject({
      id: '1',
      relationshipType: 'FS',
      isBroken: false,
    })
    expect(drawn.task.id).toBe('b')
    expect(drawn.dependsOn?.id).toBe('a')
  })

  it('falls back to FS on a relationship type it does not know', () => {
    const [drawn] = buildReviewGanttEdges(
      [edge({ relationshipType: 'SOMETHING' })],
      rows,
    )
    expect(drawn.relationshipType).toBe('FS')
  })

  it('keeps an edge whose predecessor is gone, marked broken', () => {
    const [drawn] = buildReviewGanttEdges(
      [edge({ dependsOnId: 'missing' })],
      rows,
    )
    expect(drawn).toMatchObject({ isBroken: true, dependsOn: null })
  })

  it('drops an edge whose successor is gone — nothing to draw it to', () => {
    expect(buildReviewGanttEdges([edge({ taskId: 'missing' })], rows)).toEqual(
      [],
    )
  })
})
