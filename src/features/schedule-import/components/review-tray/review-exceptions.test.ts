import { mapScheduleReviewStateDTO } from '@/services/schedule-import'
import { seedImportReviewStateDTO } from '@/tests/fixtures'
import type { ScheduleReviewState } from '@/types'

import {
  buildReviewExceptions,
  countBlocking,
  unclassifiedRowId,
} from './review-exceptions'
import { EMPTY_REVIEW_JOURNAL } from './review-journal'

const seededState = (): ScheduleReviewState =>
  mapScheduleReviewStateDTO(seedImportReviewStateDTO())

const kinds = (state: ScheduleReviewState, journal = EMPTY_REVIEW_JOURNAL) =>
  buildReviewExceptions(state, journal).map((exception) => exception.kind)

describe('buildReviewExceptions', () => {
  it('asks only about what the parser could not resolve', () => {
    const state = seededState()
    const exceptions = buildReviewExceptions(state, EMPTY_REVIEW_JOURNAL)

    // The seeded file leaves one row the parser could not classify. Its date
    // assumption is NOT here: the parser resolved it, so it belongs to the
    // ledger — one ambiguity, one mechanism.
    expect(kinds(state)).toEqual(['unclassified_row'])
    expect(countBlocking(exceptions)).toBe(0)
  })

  it('never asks the user to accept the mirror subactivity', () => {
    const state = seededState()
    // Three seeded phases carry no activities of their own. ms-bk adds the
    // mirror itself at go-live, so there is nothing here to consent to.
    expect(state.tasks.some((task) => task.subtasks.length === 0)).toBe(true)
    expect(kinds(state)).not.toContain('structure_mirror')
    expect(
      countBlocking(buildReviewExceptions(state, EMPTY_REVIEW_JOURNAL)),
    ).toBe(0)
  })

  it('stops asking about a binned row once it is on the canvas', () => {
    const state = seededState()
    const row = state.report.unclassified[0]
    const placed = {
      ...state,
      tasks: state.tasks.map((task, index) =>
        index === 0
          ? {
              ...task,
              subtasks: [
                { ...task.subtasks[0], id: 'placed', title: row.text },
              ],
            }
          : task,
      ),
    }

    expect(kinds(placed)).not.toContain('unclassified_row')
  })

  it('stops asking about a binned row the user threw away', () => {
    const state = seededState()
    const rowId = unclassifiedRowId(state.report.unclassified[0])

    expect(
      kinds(state, { ...EMPTY_REVIEW_JOURNAL, discardedRows: [rowId] }),
    ).not.toContain('unclassified_row')
  })

  it('asks about a predecessor it could not match, and stops once linked', () => {
    const state = seededState()
    const successor = state.tasks[0]
    const withEdge: ScheduleReviewState = {
      ...state,
      unresolvedEdges: [
        {
          successorRef: successor.ref ?? '1',
          successorTaskId: successor.id,
          sourceText: 'MOV. DE TIERRA',
          candidates: ['MOVIMIENTO DE TIERRA'],
        },
      ],
    }

    expect(kinds(withEdge)).toContain('unresolved_edge')

    const linked: ScheduleReviewState = {
      ...withEdge,
      dependencies: [
        {
          id: 1,
          taskId: successor.id,
          dependsOnId: state.tasks[1].id,
          relationshipType: 'FS',
          lagDays: 0,
          source: 'manual',
        },
      ],
    }
    expect(kinds(linked)).not.toContain('unresolved_edge')
  })

  it('does not pose an edge whose successor row is not on the canvas', () => {
    const state = seededState()
    const orphan: ScheduleReviewState = {
      ...state,
      unresolvedEdges: [
        {
          successorRef: '9',
          successorTaskId: null,
          sourceText: 'ALGO',
          candidates: [],
        },
      ],
    }

    expect(kinds(orphan)).not.toContain('unresolved_edge')
  })
})
