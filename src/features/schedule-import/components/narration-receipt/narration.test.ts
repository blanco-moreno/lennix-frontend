import { mapScheduleReviewStateDTO } from '@/services/schedule-import'
import { seedImportReviewStateDTO } from '@/tests/fixtures'

import { buildNarration } from './narration'

const seededState = () => mapScheduleReviewStateDTO(seedImportReviewStateDTO())

describe('buildNarration', () => {
  it('counts phases and activities without double-counting a row', () => {
    const state = seededState()
    const narration = buildNarration(state)

    const phases = state.tasks.filter((task) => task.subtasks.length > 0)
    const leaves = state.tasks.length - phases.length
    const subtasks = state.tasks.reduce(
      (total, task) => total + task.subtasks.length,
      0,
    )

    expect(narration.phaseCount).toBe(phases.length)
    expect(narration.activityCount).toBe(leaves + subtasks)
    // Every imported row is either a phase or an activity, never both.
    expect(narration.phaseCount + narration.activityCount).toBe(
      state.tasks.length + subtasks,
    )
  })

  it('quotes the phase names exactly as the file writes them', () => {
    const state = seededState()
    const narration = buildNarration(state)

    const expected = state.tasks
      .filter((task) => task.subtasks.length > 0)
      .map((task) => task.title)

    expect(narration.phaseNames).toEqual(expected)
  })

  it('spans the schedule from its earliest start to its latest finish', () => {
    const state = seededState()
    const narration = buildNarration(state)

    const rowDates = state.tasks.flatMap((task) => [
      task.startDate,
      task.dueDate,
      ...task.subtasks.flatMap((s) => [s.startDate, s.dueDate]),
    ])
    const known = rowDates.filter((date): date is string => !!date).sort()

    expect(narration.startDate).toBe(known[0])
    expect(narration.endDate).toBe(known[known.length - 1])
  })

  it('quotes the rows’ span, not the project’s own wider dates', () => {
    const state = seededState()
    state.project = {
      ...state.project,
      startDate: '2020-01-01',
      dueDate: '2030-12-31',
    }

    const narration = buildNarration(state)

    expect(narration.startDate).not.toBe('2020-01-01')
    expect(narration.endDate).not.toBe('2030-12-31')
  })

  it('counts a high-consequence assumption as a thing to check', () => {
    const narration = buildNarration(seededState())

    const assumptions = narration.caveats.filter(
      (caveat) => caveat.kind === 'assumption',
    )
    expect(assumptions).toHaveLength(1)
    expect(assumptions[0].entry?.cause).toBe('date_format')
    expect(assumptions[0].affectedRows).toBe(9)
  })

  it('never promotes a cosmetic assumption to the receipt', () => {
    const state = seededState()
    state.ledger.push({
      ...state.ledger[0],
      cause: 'locale',
      consequence: 'cosmetic',
    })

    const narration = buildNarration(state)

    expect(
      narration.caveats.some((caveat) => caveat.id.startsWith('locale')),
    ).toBe(false)
  })

  it('collapses unresolved edges and the unplaced bin into one caveat each', () => {
    const state = seededState()
    state.unresolvedEdges = [
      {
        successorRef: '2.1',
        successorTaskId: null,
        sourceText: 'depends on 9',
        candidates: ['1.1', '1.2'],
      },
      {
        successorRef: '3',
        successorTaskId: null,
        sourceText: 'depends on 12',
        candidates: [],
      },
    ]

    const narration = buildNarration(state)
    const unresolved = narration.caveats.filter(
      (caveat) => caveat.kind === 'unresolved_edges',
    )

    expect(unresolved).toHaveLength(1)
    expect(unresolved[0].affectedRows).toBe(2)
    expect(
      narration.caveats.filter((c) => c.kind === 'unclassified_rows'),
    ).toHaveLength(1)
  })

  it('counts the links the file stated but never imported as one thing to check', () => {
    const state = seededState()
    state.report = {
      ...state.report,
      skippedEdges: [
        {
          sheet: 'Task_Table',
          row: 8,
          text: '3FC+2 díast',
          successorRef: '6',
          predecessorRef: null,
          reason: 'unconvertible_lag',
        },
      ],
      skippedEdgesTotal: 3,
    }

    const skipped = buildNarration(state).caveats.filter(
      (caveat) => caveat.kind === 'skipped_edges',
    )

    expect(skipped).toHaveLength(1)
    // The full count, not the capped list.
    expect(skipped[0].affectedRows).toBe(3)
  })

  it('reports a clean parse as nothing to check', () => {
    const state = seededState()
    state.ledger = []
    state.unresolvedEdges = []
    state.report = {
      ...state.report,
      unclassifiedTotal: 0,
      rowsDropped: 0,
    }

    expect(buildNarration(state).caveatCount).toBe(0)
  })

  it('carries the resumed draft’s edit count', () => {
    const state = seededState()
    state.stats = { ...state.stats, editedTasks: 3 }

    expect(buildNarration(state).editedCount).toBe(3)
  })
})
