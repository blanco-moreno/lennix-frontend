import type { Task } from '@/types'

import { groupTasksByProject } from './task-grouping'

function task(id: string, projectId: string): Task {
  return {
    id,
    projectId,
    projectName: null,
    title: `Activity ${id}`,
    description: null,
    status: 'todo',
    priority: 'medium',
    budget: null,
    progress: 0,
    startDate: null,
    dueDate: null,
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
  }
}

describe('groupTasksByProject', () => {
  it('buckets every activity under its own obra and no other', () => {
    const groups = groupTasksByProject([
      task('t1', 'p1'),
      task('t2', 'p2'),
      task('t3', 'p1'),
    ])
    expect(Object.keys(groups).sort()).toEqual(['p1', 'p2'])
    expect(groups.p1.map((t) => t.id)).toEqual(['t1', 't3'])
    expect(groups.p2.map((t) => t.id)).toEqual(['t2'])
  })

  it('keeps the page order inside each bucket', () => {
    const groups = groupTasksByProject([
      task('b', 'p1'),
      task('a', 'p1'),
      task('c', 'p1'),
    ])
    // Grouping only — sorting (like filtering) is the server's job.
    expect(groups.p1.map((t) => t.id)).toEqual(['b', 'a', 'c'])
  })

  it('returns an empty record for an empty page, not a phantom bucket', () => {
    expect(groupTasksByProject([])).toEqual({})
  })
})
