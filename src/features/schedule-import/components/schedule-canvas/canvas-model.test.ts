import { sortChronologically, spanDays } from './canvas-model'

describe('sortChronologically', () => {
  it('orders rows by what the file said, undated ones last', () => {
    const rows = [
      { startDate: null, dueDate: null, id: 'undated' },
      { startDate: '2026-11-01', dueDate: '2026-11-30', id: 'later' },
      { startDate: '2026-09-01', dueDate: '2026-09-25', id: 'earlier' },
    ]

    expect(sortChronologically(rows).map((row) => row.id)).toEqual([
      'earlier',
      'later',
      'undated',
    ])
  })
})

describe('spanDays', () => {
  it('counts the days between the two dates', () => {
    expect(spanDays('2026-09-01', '2026-09-25')).toBe(24)
  })

  it('never goes negative when the dates are inverted', () => {
    expect(spanDays('2026-09-25', '2026-09-01')).toBe(0)
  })

  it('has nothing to count without both dates', () => {
    expect(spanDays(null, '2026-09-25')).toBeNull()
    expect(spanDays('2026-09-01', null)).toBeNull()
    expect(spanDays(null, null)).toBeNull()
  })
})
