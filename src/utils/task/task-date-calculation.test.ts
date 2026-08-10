import { calculateTaskDuration } from './task-date-calculation'

/** Frozen clock: local midnight, 2026-07-10. */
const FROZEN_NOW = new Date(2026, 6, 10, 0, 0, 0)

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(FROZEN_NOW)
})

afterEach(() => {
  vi.useRealTimers()
})

describe('calculateTaskDuration', () => {
  it('splits a 20-day window into 9 elapsed and 11 remaining on day 9', () => {
    const d = calculateTaskDuration('2026-07-01', '2026-07-21')
    expect(d.totalDuration).toBe(20)
    expect(d.elapsedDuration).toBe(9)
    expect(d.remainingDuration).toBe(11)
  })

  it('rounds a partial elapsed day up, and remaining shrinks to match', () => {
    vi.setSystemTime(new Date(2026, 6, 10, 12, 0, 0)) // half a day later
    const d = calculateTaskDuration('2026-07-01', '2026-07-21')
    expect(d.elapsedDuration).toBe(10) // ceil(9.5), not floor
    expect(d.remainingDuration).toBe(10)
  })

  it('parses date-only strings as local calendar days (no TZ off-by-one)', () => {
    const d = calculateTaskDuration('2026-07-01', '2026-07-21')
    expect(d.startDate.getDate()).toBe(1)
    expect(d.endDate.getDate()).toBe(21)
    expect(d.startDate.getMonth()).toBe(6)
  })

  it('floors remaining at zero once the due date has passed', () => {
    const d = calculateTaskDuration('2026-07-01', '2026-07-05')
    expect(d.totalDuration).toBe(4)
    expect(d.elapsedDuration).toBe(9)
    expect(d.remainingDuration).toBe(0) // never 4 - 9 = -5
  })

  it('collapses to all zeroes when both dates are missing', () => {
    const d = calculateTaskDuration(null, undefined)
    expect(d.totalDuration).toBe(0)
    expect(d.elapsedDuration).toBe(0)
    expect(d.remainingDuration).toBe(0)
  })
})
