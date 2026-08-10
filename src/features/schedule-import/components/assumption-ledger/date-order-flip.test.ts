import { mapScheduleReviewStateDTO } from '@/services/schedule-import'
import { seedImportReviewStateDTO } from '@/tests/fixtures'
import type { ReviewTask } from '@/types'

import { flipKey, planDateOrderFlip, swapDayMonth } from './date-order-flip'

const seededTasks = (): ReviewTask[] =>
  mapScheduleReviewStateDTO(seedImportReviewStateDTO()).tasks

describe('swapDayMonth', () => {
  it('reads the same date the other way', () => {
    expect(swapDayMonth('2026-09-01')).toBe('2026-01-09')
  })

  it('is its own inverse — which is what makes one flip back true', () => {
    const once = swapDayMonth('2026-09-08')
    expect(once).toBe('2026-08-09')
    expect(swapDayMonth(once!)).toBe('2026-09-08')
  })

  it('refuses a date the file itself settles', () => {
    expect(swapDayMonth('2026-09-26')).toBeNull()
  })

  it('refuses a date that reads the same either way', () => {
    expect(swapDayMonth('2026-05-05')).toBeNull()
  })

  it('refuses anything that is not a plain day', () => {
    expect(swapDayMonth('2026-09')).toBeNull()
  })
})

describe('planDateOrderFlip', () => {
  it('re-reads the whole column at the cause, counting what it cannot', () => {
    const plan = planDateOrderFlip(seededTasks(), 'start')

    // Three of the four seeded subactivity rows start on an ambiguous day; one
    // is settled by the file (day 26). Phase rows never participate.
    expect(plan.edits).toHaveLength(3)
    expect(plan.settled).toBe(1)
    expect(plan.conflicts).toHaveLength(0)
    expect(plan.edits.every((edit) => edit.level === 'subtask')).toBe(true)
    expect(plan.edits[0].field).toBe('start_date')
  })

  it('writes the other date column when the cause is the finish column', () => {
    const plan = planDateOrderFlip(seededTasks(), 'finish')

    expect(plan.edits.every((edit) => edit.field === 'due_date')).toBe(true)
  })

  it('produces no edit for a phase row — its dates derive from its subactivities', () => {
    const tasks = seededTasks()
    // The first seeded phase starts on an ambiguous day, so a row-level flip
    // WOULD have re-read it — but the task endpoint accepts no dates.
    expect(swapDayMonth(tasks[0].startDate!)).not.toBeNull()

    const plan = planDateOrderFlip(tasks, 'start')
    const phaseIds = tasks.map((task) => task.id)

    expect(plan.edits.map((edit) => edit.id)).not.toContain(tasks[0].id)
    expect(plan.edits.some((edit) => phaseIds.includes(edit.id))).toBe(false)

    // Even an edited phase surfaces nowhere: it is outside the flip entirely,
    // neither rewritten nor reported as a conflict.
    const pinnedPhase = { ...tasks[0], edited: true }
    const pinnedPlan = planDateOrderFlip(
      [pinnedPhase, ...tasks.slice(1)],
      'start',
    )
    expect(pinnedPlan.conflicts).toHaveLength(0)
  })

  it('never overwrites a row the user edited — it reports it', () => {
    const tasks = seededTasks()
    const pinned = { ...tasks[0].subtasks[0], edited: true }
    const withPinned = [
      { ...tasks[0], subtasks: [pinned, ...tasks[0].subtasks.slice(1)] },
      ...tasks.slice(1),
    ]

    const plan = planDateOrderFlip(withPinned, 'start')

    expect(plan.edits.map((edit) => edit.id)).not.toContain(pinned.id)
    expect(plan.conflicts).toEqual([
      {
        id: pinned.id,
        title: pinned.title,
        current: pinned.startDate,
        wouldBecome: swapDayMonth(pinned.startDate!),
      },
    ])
  })

  it('keeps its own writes flippable, so the reversal is still one press', () => {
    const tasks = seededTasks()
    // What a flip leaves behind: the server now calls these subactivity rows
    // edited. Phase rows are untouched — the flip never writes them.
    const afterFlip = tasks.map((task) => ({
      ...task,
      subtasks: task.subtasks.map((subtask) => ({
        ...subtask,
        startDate: subtask.startDate
          ? (swapDayMonth(subtask.startDate) ?? subtask.startDate)
          : null,
        edited: true,
      })),
    }))
    const owned = new Set(
      afterFlip.flatMap((task) =>
        task.subtasks.map((subtask) => flipKey('start', subtask.id)),
      ),
    )

    const blind = planDateOrderFlip(afterFlip, 'start')
    const informed = planDateOrderFlip(afterFlip, 'start', owned)

    // Without ownership every re-read row looks like hand work — the promise
    // would die on the second press.
    expect(blind.edits).toHaveLength(0)
    expect(blind.conflicts.length).toBeGreaterThan(0)
    expect(informed.edits).toHaveLength(3)
    expect(informed.conflicts).toHaveLength(0)
  })
})
