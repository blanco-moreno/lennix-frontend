import { mapLedgerEntry, mapParseReport } from './schedule-import-mappers'

describe('JSON-normalizing guards (via mapParseReport / mapLedgerEntry)', () => {
  it('degrades every wrong-typed field to its quiet empty value', () => {
    // Not seed data on purpose: this layer is the app's only runtime
    // validation, so it is exercised with the garbage it exists to absorb.
    const report = mapParseReport({
      rows_scanned: '12', // text where num expected → 0
      rows_imported: Number.NaN, // non-finite → 0
      sheet_reason: ['two ', 'fragments'], // list prose joins
      sheet_evidence: {
        codes: ['has_day_grid', 'not_a_real_code', 7],
        header_row: '4', // text where optionalNum expected → null
      },
      dropped: [{ sheet: 3, row: '9', text: null, reason: undefined }],
      section_signals: 'not a list',
      date_assumptions: [
        {
          column: 'Inicio',
          chosen: 'DMY',
          alternative: '', // empty → null via optionalText
          settled_by_code: 'made_up_code', // token fallback
          samples: ['01/02', null, 42],
          affected_rows: 8,
        },
      ],
      unclassified: null,
    })

    expect(report.rowsScanned).toBe(0)
    expect(report.rowsImported).toBe(0)
    expect(report.sheetReason).toBe('two fragments')
    expect(report.sheetEvidence.codes).toEqual(['has_day_grid'])
    expect(report.sheetEvidence.headerRow).toBeNull()
    expect(report.sheetEvidence.dayGridColumns).toBeNull()
    expect(report.dropped).toEqual([
      { sheet: '', row: 0, text: '', reason: '' },
    ])
    expect(report.sectionSignals).toEqual([])
    expect(report.dateAssumptions[0].alternative).toBeNull()
    expect(report.dateAssumptions[0].settledByCode).toBe('no_dates_found')
    expect(report.dateAssumptions[0].samples).toEqual(['01/02'])
    expect(report.dateAssumptions[0].affectedRows).toBe(8)
    expect(report.unclassified).toEqual([])
  })

  it('treats anything not explicitly cosmetic as high-consequence', () => {
    expect(mapLedgerEntry({ consequence: 'cosmetic' }).consequence).toBe(
      'cosmetic',
    )
    expect(mapLedgerEntry({ consequence: 'minor' }).consequence).toBe('high')
    expect(mapLedgerEntry({}).consequence).toBe('high')
  })

  it('degrades unknown ledger tokens to their stated defaults', () => {
    const entry = mapLedgerEntry({
      cause: 'brand_new_cause',
      alternative_action: 'brand_new_action',
    })

    expect(entry.cause).toBe('date_format')
    expect(entry.alternativeAction).toBe('none')
  })
})
