import type { Task } from '@/types'

import { isTaskBlocked } from './task-dependency'

function task(over: Partial<Task> = {}): Task {
  return {
    id: 't-1',
    projectId: 'p-1',
    projectName: 'Obra',
    title: 'Cimentación',
    description: null,
    status: 'in_progress',
    priority: 'medium',
    budget: null,
    progress: 50,
    startDate: '2026-07-01',
    dueDate: '2026-07-21',
    spent: 0,
    isOverBudget: false,
    delayReason: null,
    delayDays: 0,
    isDraft: false,
    isBlocked: false,
    isCriticalPath: false,
    assigneeId: null,
    assigneeName: null,
    forceStarted: false,
    atRisk: false,
    createdAt: '2026-07-01T00:00:00Z',
    subtasks: [],
    ...over,
  }
}

describe('isTaskBlocked', () => {
  it('a force-start wins over the block — the D4/D24 override is exactly this', () => {
    expect(
      isTaskBlocked({ ...task(), isBlocked: true, forceStarted: true }),
    ).toBe(false)
  })

  it('reports a plain dependency block when nothing overrides it', () => {
    expect(
      isTaskBlocked({ ...task(), isBlocked: true, forceStarted: false }),
    ).toBe(true)
  })

  it('an unblocked task stays unblocked whether or not it was force-started', () => {
    expect(isTaskBlocked(task())).toBe(false)
    expect(isTaskBlocked({ ...task(), forceStarted: true })).toBe(false)
  })

  it('answers for a subactivity too — the rule is one level-agnostic question', () => {
    // Only the two flags: every surface that offers the force-start button
    // asks this, and phases and subactivities must not get separate answers.
    expect(isTaskBlocked({ isBlocked: true, forceStarted: false })).toBe(true)
    expect(isTaskBlocked({ isBlocked: true, forceStarted: true })).toBe(false)
  })
})
