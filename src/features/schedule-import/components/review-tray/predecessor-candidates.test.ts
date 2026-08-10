import { mapScheduleReviewStateDTO } from '@/services/schedule-import'
import { seedImportReviewStateDTO } from '@/tests/fixtures'
import type { ReviewTask, ReviewUnresolvedEdge } from '@/types'

import {
  buildPredecessorOptions,
  dependencyTypeFor,
  suggestedOptions,
} from './predecessor-candidates'

const seededTasks = (): ReviewTask[] =>
  mapScheduleReviewStateDTO(seedImportReviewStateDTO()).tasks

const edgeOn = (
  successorTaskId: string,
  overrides: Partial<ReviewUnresolvedEdge> = {},
): ReviewUnresolvedEdge => ({
  successorRef: '2',
  successorTaskId,
  sourceText: 'OBRAS PRELIMINRES',
  candidates: ['OBRAS PRELIMINARES'],
  ...overrides,
})

describe('dependencyTypeFor', () => {
  it('mirrors the pairing the backend accepts, and only that', () => {
    const phaseA = { id: 'a', title: 'A', ref: null, parentId: null }
    const phaseB = { id: 'b', title: 'B', ref: null, parentId: null }
    const childA1 = { id: 'a1', title: 'A1', ref: null, parentId: 'a' }
    const childA2 = { id: 'a2', title: 'A2', ref: null, parentId: 'a' }
    const childB1 = { id: 'b1', title: 'B1', ref: null, parentId: 'b' }

    expect(dependencyTypeFor(phaseA, phaseB)).toBe('inter_phase')
    expect(dependencyTypeFor(childA1, childA2)).toBe('intra_phase')
    expect(dependencyTypeFor(childA1, childB1)).toBeNull()
    expect(dependencyTypeFor(childA1, phaseB)).toBeNull()
  })
})

describe('buildPredecessorOptions', () => {
  it('puts the row the file meant first, despite the typo', () => {
    const tasks = seededTasks()
    const successor = tasks[1]

    const options = buildPredecessorOptions(edgeOn(successor.id), tasks)

    expect(options[0].title).toBe('OBRAS PRELIMINARES')
    expect(options[0].proposed).toBe(true)
    expect(options[0].dependencyType).toBe('inter_phase')
  })

  it('never offers a pick the backend would reject', () => {
    const tasks = seededTasks()
    const successor = tasks[0]

    const options = buildPredecessorOptions(edgeOn(successor.id), tasks)

    // The successor is a phase, so only phases can precede it — no subtask of
    // any phase is on offer, and the row itself never is.
    const subtaskIds = tasks.flatMap((task) =>
      task.subtasks.map((subtask) => subtask.id),
    )
    expect(
      options.filter((option) => subtaskIds.includes(option.taskId)),
    ).toHaveLength(0)
    expect(options.map((option) => option.taskId)).not.toContain(successor.id)
  })

  it('offers a sibling activity, and only a sibling, to an activity', () => {
    const tasks = seededTasks()
    const phase = tasks.find((task) => task.subtasks.length > 1)
    if (!phase)
      throw new Error('the seeded draft lost its multi-activity phase')
    const successor = phase.subtasks[0]

    const options = buildPredecessorOptions(
      edgeOn(successor.id, { candidates: [], sourceText: null }),
      tasks,
    )

    expect(options.map((option) => option.taskId)).toEqual(
      phase.subtasks.slice(1).map((subtask) => subtask.id),
    )
    expect(
      options.every((option) => option.dependencyType === 'intra_phase'),
    ).toBe(true)
  })

  it('answers nothing when the edge points at a row that is gone', () => {
    expect(buildPredecessorOptions(edgeOn('missing'), seededTasks())).toEqual(
      [],
    )
  })
})

describe('suggestedOptions', () => {
  it('keeps what the file points at and drops the noise', () => {
    const tasks = seededTasks()
    const options = buildPredecessorOptions(edgeOn(tasks[1].id), tasks)

    const suggested = suggestedOptions(options)

    expect(suggested.map((option) => option.title)).toContain(
      'OBRAS PRELIMINARES',
    )
    expect(suggested.length).toBeLessThan(options.length)
  })
})
