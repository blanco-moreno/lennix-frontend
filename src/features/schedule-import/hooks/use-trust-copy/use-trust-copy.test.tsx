import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { IntlProvider } from 'react-intl'

import type {
  AssumptionLedgerEntry,
  ParseQuality,
  SheetEvidence,
  SkippedEdgeReason,
} from '@/types'

import enMessages from '../../../../../lang/en.json'
import esMessages from '../../../../../lang/es.json'
import ptMessages from '../../../../../lang/pt-BR.json'

import { useTrustCopy } from './use-trust-copy'

const CATALOGS = {
  en: enMessages,
  es: esMessages,
  'pt-BR': ptMessages,
} as const

function copyIn(locale: keyof typeof CATALOGS) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <IntlProvider
      locale={locale}
      defaultLocale="en"
      messages={CATALOGS[locale]}
    >
      {children}
    </IntlProvider>
  )
  return renderHook(() => useTrustCopy(), { wrapper }).result.current
}

function entry(over: Partial<AssumptionLedgerEntry>): AssumptionLedgerEntry {
  return {
    cause: 'date_format',
    scope: 'start',
    consequence: 'high',
    chosen: 'DMY',
    alternativeValue: 'MDY',
    alternativeAction: 'flip_date_order',
    affectedRows: 8,
    sampleRowRefs: [],
    // The prose twins are populated on purpose: nothing here may read them.
    assumption: 'Read the start dates as DMY',
    alternative: 'MDY',
    detail: 'Every day value is 12 or lower.',
    ...over,
  }
}

describe('useTrustCopy — the ledger', () => {
  it('composes the sentence from the facts, never from the English prose', () => {
    const copy = copyIn('en')

    expect(copy.ledgerAssumption(entry({}))).toBe(
      'Dates in the start column read as day/month/year.',
    )
    expect(copy.ledgerAlternative(entry({}))).toBe(
      'The other reading: month/day/year',
    )
  })

  it('says it in Spanish — the copy must follow the user locale', () => {
    const copy = copyIn('es')

    expect(copy.ledgerAssumption(entry({}))).toBe(
      'Fechas de inicio leídas como día/mes/año.',
    )
    expect(copy.ledgerAlternative(entry({}))).toBe(
      'La otra lectura: mes/día/año',
    )
  })

  it('has a sentence for every cause the contract can emit', () => {
    const copy = copyIn('en')
    const causes = [
      'date_format',
      'day_grid_year',
      'locale',
      'sheet_choice',
      'hierarchy_signal',
      'edge_ref',
    ] as const

    for (const cause of causes) {
      const sentence = copy.ledgerAssumption(entry({ cause, chosen: 'x' }))
      expect(sentence, `no message for cause ${cause}`).not.toBe('')
      // A raw token reaching the screen is the defect, so no sentence may be
      // the token itself.
      expect(sentence).not.toBe(cause)
    }
  })

  it('has a call to action for every alternative the contract can emit', () => {
    const copy = copyIn('en')

    expect(
      copy.ledgerAlternative(
        entry({
          cause: 'hierarchy_signal',
          alternativeValue: null,
          alternativeAction: 'group_rows_manually',
        }),
      ),
    ).toBe('You can group them by hand from the schedule.')
    expect(
      copy.ledgerAlternative(
        entry({
          cause: 'edge_ref',
          alternativeValue: null,
          alternativeAction: 'confirm_edge_candidates',
        }),
      ),
    ).toBe('You can choose the predecessor on each marked activity.')
    expect(
      copy.ledgerAlternative(
        entry({
          cause: 'day_grid_year',
          alternativeValue: null,
          alternativeAction: 'state_the_year',
        }),
      ),
    ).toBe('You can correct the year by editing each activity.')
  })

  it('says nothing when there is nothing to do about it', () => {
    const copy = copyIn('en')

    expect(
      copy.ledgerAlternative(
        entry({
          cause: 'locale',
          alternativeValue: null,
          alternativeAction: 'none',
        }),
      ),
    ).toBeNull()
  })

  it('quotes a sheet name rather than translating it', () => {
    const copy = copyIn('es')

    expect(
      copy.ledgerAssumption(
        entry({ cause: 'sheet_choice', scope: 'sheet', chosen: 'CARTA GANTT' }),
      ),
    ).toBe('Se usó la hoja «CARTA GANTT».')
  })
})

describe('useTrustCopy — the report', () => {
  const evidence = (over: Partial<SheetEvidence> = {}): SheetEvidence => ({
    codes: ['name_matches_schedule', 'has_schedule_header'],
    headerRow: 4,
    dayGridColumns: null,
    ...over,
  })

  it('states why the sheet won, in the reader’s language', () => {
    expect(copyIn('en').sheetReason(evidence())).toBe(
      'Why this sheet: its name points at a schedule; it carries a schedule header on row 4.',
    )
    expect(copyIn('es').sheetReason(evidence())).toBe(
      'Por qué esta hoja: su nombre apunta a un cronograma; tiene un encabezado de cronograma en la fila 4.',
    )
  })

  it('drops a code whose number did not travel with it', () => {
    // `has_schedule_header` without a row number would claim a fact it cannot
    // state, so it is left out rather than rendered half-finished.
    expect(
      copyIn('en').sheetReason(
        evidence({ codes: ['has_schedule_header'], headerRow: null }),
      ),
    ).toBeNull()
  })

  it('translates the drop reasons instead of printing the tokens', () => {
    expect(copyIn('es').dropReasons(['empty', 'header', 'total'])).toBe(
      'filas vacías; encabezados repetidos; totales al pie',
    )
  })

  it('translates why a binned row could not be placed', () => {
    expect(copyIn('es').unclassifiedCause('dropped_total')).toBe(
      'leída como total al pie',
    )
  })

  it.each(['en', 'es', 'pt-BR'] as const)(
    'names every reason a relationship was not imported, in %s',
    (locale) => {
      // The closed set of contract 2.2 — one phrase each, never the token.
      const reasons: SkippedEdgeReason[] = [
        'type_not_stated',
        'unknown_type',
        'unconvertible_lag',
        'lag_out_of_range',
        'unresolved_reference',
        'no_key_column',
        'external_reference',
        'truncated',
        'malformed',
        'self_loop',
        'duplicate',
        'cycle',
        'marked_for_deletion',
      ]
      const copy = copyIn(locale)
      const phrases = reasons.map((reason) => copy.skippedEdgeReason(reason))

      phrases.forEach((phrase, index) => {
        expect(phrase, `no phrase for ${reasons[index]}`).not.toBe('')
        expect(phrase).not.toBe(reasons[index])
      })
      // Thirteen reasons, thirteen different things said.
      expect(new Set(phrases).size).toBe(reasons.length)
    },
  )

  it('says how to bring back links that name a column the file lacks', () => {
    expect(copyIn('es').skippedEdgeReason('no_key_column')).toBe(
      'la columna a la que se refiere no está en el archivo; volvé a exportarlo con la columna Id',
    )
  })

  it('says why a relationship was not imported in the reader’s language', () => {
    expect(copyIn('es').skippedEdgeReason('unconvertible_lag')).toBe(
      'un desfase en una unidad que no se puede convertir a días',
    )
  })
})

describe('useTrustCopy — the quality block', () => {
  const quality: ParseQuality = {
    resolutionRatio: 0.4,
    threshold: 0.6,
    reasons: ['low_resolution'],
    workRows: 20,
    scheduledRows: 8,
    detail: '8 of 20 work rows landed on the timeline',
  }

  it('states the counts rather than ms-ai’s English summary of them', () => {
    expect(copyIn('es').qualitySummary(quality)).toBe(
      '8 de 20 filas de trabajo quedaron en la línea de tiempo.',
    )
  })
})
