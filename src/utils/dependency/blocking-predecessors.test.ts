import type { DependencyNode, RelationshipType } from '@/types'

import { hasBrokenEdge, unsatisfiedPredecessors } from './blocking-predecessors'

const node = (
  overrides: {
    taskId?: string
    predecessorStatus?: string | null
    relationshipType?: RelationshipType
    isBroken?: boolean
  } = {},
): DependencyNode => {
  const {
    taskId = 'sub-b',
    predecessorStatus = 'in_progress',
    relationshipType = 'FS',
    isBroken = false,
  } = overrides
  const task = {
    id: taskId,
    title: 'Hormigonado',
    status: 'todo',
    priority: 'high',
    progress: 0,
    startDate: null,
    dueDate: null,
    delayReason: null,
    delayDays: 0,
    isBlocked: true,
    forceStarted: false,
  }
  return {
    id: 'edge-1',
    task,
    dependsOn:
      predecessorStatus === null
        ? null
        : {
            ...task,
            id: 'sub-a',
            title: 'Excavacion',
            status: predecessorStatus,
          },
    relationshipType,
    lagDays: 0,
    isBroken,
  }
}

describe('unsatisfiedPredecessors', () => {
  it('names the predecessor a finish-to-start edge is still waiting on', () => {
    const found = unsatisfiedPredecessors([node()], 'sub-b')
    expect(found.map((p) => p.title)).toEqual(['Excavacion'])
  })

  it('drops it once that predecessor is done', () => {
    const found = unsatisfiedPredecessors(
      [node({ predecessorStatus: 'done' })],
      'sub-b',
    )
    expect(found).toEqual([])
  })

  it('treats SS/SF as satisfied by a started predecessor, like the backend', () => {
    // The rule mirrors the backend's `_dependency_satisfied`: FS/FF need it finished,
    // SS/SF only need it started. Getting this wrong would put a name on screen
    // that contradicts the refusal the API actually gives.
    for (const relationshipType of ['SS', 'SF'] as RelationshipType[]) {
      expect(
        unsatisfiedPredecessors(
          [node({ relationshipType, predecessorStatus: 'in_progress' })],
          'sub-b',
        ),
      ).toEqual([])
    }
    for (const relationshipType of ['FS', 'FF'] as RelationshipType[]) {
      expect(
        unsatisfiedPredecessors(
          [node({ relationshipType, predecessorStatus: 'in_progress' })],
          'sub-b',
        ),
      ).toHaveLength(1)
    }
  })

  it('gives no name for a broken edge — there is nothing to point at', () => {
    // The predecessor is soft-deleted or dangling, so the fix is a
    // re-link, not waiting. The caller has to cope with an empty result.
    expect(
      unsatisfiedPredecessors([node({ isBroken: true })], 'sub-b'),
    ).toEqual([])
    expect(
      unsatisfiedPredecessors([node({ predecessorStatus: null })], 'sub-b'),
    ).toEqual([])
  })

  it('ignores edges belonging to a different subactivity', () => {
    expect(
      unsatisfiedPredecessors([node({ taskId: 'sub-z' })], 'sub-b'),
    ).toEqual([])
  })

  it('names every unsatisfied predecessor, not just the first', () => {
    const edges = [
      node(),
      {
        ...node(),
        id: 'edge-2',
        dependsOn: { ...node().dependsOn!, id: 'sub-c', title: 'Encofrado' },
      },
    ]
    expect(unsatisfiedPredecessors(edges, 'sub-b').map((p) => p.title)).toEqual(
      ['Excavacion', 'Encofrado'],
    )
  })
})

describe('hasBrokenEdge', () => {
  it('reads the backend flag rather than inferring from a missing name', () => {
    expect(hasBrokenEdge([node({ isBroken: true })], 'sub-b')).toBe(true)
    // A healthy edge whose predecessor is simply unfinished, and an empty
    // graph (not loaded yet): neither is a dead link, and reporting one would
    // send someone re-linking an edge that was never broken.
    expect(hasBrokenEdge([node()], 'sub-b')).toBe(false)
    expect(hasBrokenEdge([], 'sub-b')).toBe(false)
  })

  it('ignores a broken edge belonging to another row', () => {
    expect(
      hasBrokenEdge([node({ taskId: 'sub-z', isBroken: true })], 'sub-b'),
    ).toBe(false)
  })
})
