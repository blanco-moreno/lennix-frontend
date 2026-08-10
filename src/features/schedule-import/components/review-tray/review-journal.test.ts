import {
  discardRow,
  readReviewJournal,
  toggleFlippedRows,
} from './review-journal'

const PROJECT = 'b0000000-0000-0007-0000-000000000000'
const OTHER = 'b0000000-0000-0008-0000-000000000000'

beforeEach(() => window.localStorage.clear())

describe('review journal', () => {
  it('remembers a discarded row for this draft only', () => {
    discardRow(PROJECT, 'CARTA GANTT:17')

    expect(readReviewJournal(PROJECT).discardedRows).toEqual(['CARTA GANTT:17'])
    expect(readReviewJournal(OTHER).discardedRows).toEqual([])
  })

  it('records the same decision once, however often it is taken', () => {
    discardRow(PROJECT, 'CARTA GANTT:17')
    discardRow(PROJECT, 'CARTA GANTT:17')

    expect(readReviewJournal(PROJECT).discardedRows).toEqual(['CARTA GANTT:17'])
  })

  it('hands a row to the flip and back again, so the reversal stays possible', () => {
    toggleFlippedRows(PROJECT, ['start:task-1', 'start:task-2'])
    expect(readReviewJournal(PROJECT).flippedRows).toEqual([
      'start:task-1',
      'start:task-2',
    ])

    toggleFlippedRows(PROJECT, ['start:task-1'])
    expect(readReviewJournal(PROJECT).flippedRows).toEqual(['start:task-2'])
  })

  it('survives a corrupt store instead of breaking the review', () => {
    window.localStorage.setItem('lennix.review-journal.v1', '{not json')

    expect(readReviewJournal(PROJECT)).toEqual({
      discardedRows: [],
      flippedRows: [],
    })
  })
})
