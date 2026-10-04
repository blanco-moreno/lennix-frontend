import { mapScheduleReviewStateDTO } from '@/services/schedule-import'
import { seedImportReviewStateDTO } from '@/tests/fixtures'
import type { ReviewTask, ReviewUnresolvedEdge } from '@/types'

import {
  buildPredecessorOptions,
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

describe('buildPredecessorOptions', () => {
  it('puts the row the file meant first, despite the typo', () => {
    const tasks = seededTasks()
    const successor = tasks[1]

    const options = buildPredecessorOptions(edgeOn(successor.id), tasks)

    expect(options[0].title).toBe('OBRAS PRELIMINARES')
    expect(options[0].proposed).toBe(true)
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
  })

  it('never offers a row that already waits on the successor — that link closes a loop', () => {
    const tasks = seededTasks()
    const [first, successor, third] = tasks
    // A chain the draft already holds: successor → third → first. Making the
    // successor wait on either of them would close it.
    const existing = [
      { taskId: third.id, dependsOnId: successor.id },
      { taskId: first.id, dependsOnId: third.id },
    ]

    const offered = buildPredecessorOptions(
      edgeOn(successor.id),
      tasks,
      existing,
    ).map((option) => option.taskId)

    expect(offered).not.toContain(third.id)
    expect(offered).not.toContain(first.id)
    expect(offered).toContain(tasks[3].id)
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
