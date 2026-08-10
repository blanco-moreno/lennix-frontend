import { calculateBudgetMetrics } from './budget'

describe('calculateBudgetMetrics', () => {
  it('computes remaining, percentage and flag for an under-budget project', () => {
    const m = calculateBudgetMetrics(900, 300.3)
    expect(m.budgetRemaining).toBe(599.7)
    expect(m.budgetPercentage).toBeCloseTo(33.3667, 4)
    expect(m.isOverBudget).toBe(false)
  })

  it('subtracts in cents, so remaining carries no float artifacts', () => {
    // Naive float math would return 0.19999999999999998 here.
    expect(calculateBudgetMetrics(0.3, 0.1).budgetRemaining).toBe(0.2)
  })

  it('does not call an exactly-consumed budget over budget', () => {
    const m = calculateBudgetMetrics(100, 100)
    expect(m.isOverBudget).toBe(false)
    expect(m.budgetRemaining).toBe(0)
    expect(m.budgetPercentage).toBe(100)
  })

  it('flags over budget from a single cent of overrun', () => {
    const m = calculateBudgetMetrics(100, 100.01)
    expect(m.isOverBudget).toBe(true)
    expect(m.budgetRemaining).toBe(-0.01)
  })

  it('compares in cents, so sub-cent float noise cannot flip the flag', () => {
    // 3 * 33.333333 sums with float error just under/over 100 depending on
    // rounding; toCents rounds both sides before comparing.
    expect(calculateBudgetMetrics(100, 99.999999).isOverBudget).toBe(false)
  })

  it('reads a zero budget as 0% spent, never Infinity or NaN', () => {
    const m = calculateBudgetMetrics(0, 500)
    expect(m.budgetPercentage).toBe(0)
    expect(m.isOverBudget).toBe(true)
    expect(m.budgetRemaining).toBe(-500)
  })
})
