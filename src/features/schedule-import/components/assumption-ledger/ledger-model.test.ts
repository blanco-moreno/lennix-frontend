import { mapScheduleReviewStateDTO } from '@/services/schedule-import'
import { seedImportReviewStateDTO } from '@/tests/fixtures'
import type { ScheduleReviewState } from '@/types'

import { buildLedgerView, leftOutSummary } from './ledger-model'

const seededState = (): ScheduleReviewState =>
  mapScheduleReviewStateDTO(seedImportReviewStateDTO())

describe('buildLedgerView', () => {
  it('is loud about the date the parser was confident and ambiguous about', () => {
    const { loud, quiet } = buildLedgerView(seededState())

    expect(loud).toHaveLength(1)
    expect(quiet).toHaveLength(0)
    expect(loud[0].entry.cause).toBe('date_format')
    // The alternative is a TOKEN, never an English sentence.
    expect(loud[0].entry.alternativeValue).toBe('MDY')
    expect(loud[0].entry.alternativeAction).toBe('flip_date_order')
    expect(loud[0].entry.affectedRows).toBe(9)
  })

  it('pairs the cause with the column it can actually flip', () => {
    const { loud } = buildLedgerView(seededState())

    expect(loud[0].flip?.column).toBe('start')
    expect(loud[0].samples).toEqual(['01-09-2026', '08-09-2026', '26-09-2026'])
  })

  it('offers no flip for a column the file already settled', () => {
    const state = seededState()
    const settled: ScheduleReviewState = {
      ...state,
      ledger: [{ ...state.ledger[0], scope: 'finish' }],
    }

    // The finish column carries `alternative: null` — there is no other reading
    // to offer, so the entry is stated without a flip.
    expect(buildLedgerView(settled).loud[0].flip).toBeNull()
  })

  it('offers no flip for a scope that names no date column at all', () => {
    const state = seededState()
    const elsewhere: ScheduleReviewState = {
      ...state,
      ledger: [{ ...state.ledger[0], cause: 'sheet_choice', scope: 'sheet' }],
    }

    // The scope is a token, so there is nothing to guess at:
    // a cause that names no column simply has no column to flip.
    expect(buildLedgerView(elsewhere).loud[0].flip).toBeNull()
  })

  it('keeps a cosmetic cause quiet instead of shouting it', () => {
    const state = seededState()
    const withCosmetic: ScheduleReviewState = {
      ...state,
      ledger: [
        ...state.ledger,
        {
          cause: 'locale',
          scope: 'sheet',
          consequence: 'cosmetic',
          chosen: 'es',
          alternativeValue: null,
          alternativeAction: 'none',
          affectedRows: 12,
          sampleRowRefs: [],
          assumption: 'Read the file as Spanish.',
          alternative: null,
          detail: '',
        },
      ],
    }

    const { loud, quiet } = buildLedgerView(withCosmetic)
    expect(loud).toHaveLength(1)
    expect(quiet.map((cause) => cause.entry.cause)).toEqual(['locale'])
  })

  it('traces a cause back to the sheet and line it was decided on', () => {
    const { loud } = buildLedgerView(seededState())

    expect(loud[0].provenance[0]).toEqual({
      ref: '1',
      title: 'OBRAS PRELIMINARES',
      sheet: 'CARTA GANTT',
      row: 8,
    })
  })
})

describe('leftOutSummary', () => {
  it('counts what the parser dropped and why', () => {
    const summary = leftOutSummary(seededState())

    expect(summary.dropped).toBe(4)
    // ms-ai's own closed vocabulary — `trust-copy` turns these into words.
    expect(summary.reasons).toEqual(['empty', 'header', 'total'])
  })
})
