import {
  getBudgetProgressBarColor,
  getBudgetRemainingIconContainerColor,
  getBudgetRemainingTextColor,
  getBudgetSpentIconContainerColor,
  getBudgetSpentTextColor,
  getBudgetVarianceBadgeColor,
  getBudgetVarianceTextColor,
} from './budget-color'

describe('over/under budget getters', () => {
  // "Spent" warns while under budget (money is leaving either way);
  // "remaining" and "variance" celebrate while under budget.
  it.each([
    [
      'spent icon',
      getBudgetSpentIconContainerColor,
      { bg: 'overBudget/10' },
      { bg: 'warning/10' },
    ],
    [
      'spent text',
      getBudgetSpentTextColor,
      { color: 'overBudget' },
      { color: 'warning' },
    ],
    [
      'remaining icon',
      getBudgetRemainingIconContainerColor,
      { bg: 'overBudget/10' },
      { bg: 'success/10' },
    ],
    [
      'remaining text',
      getBudgetRemainingTextColor,
      { color: 'overBudget' },
      { color: 'success' },
    ],
    [
      'variance text',
      getBudgetVarianceTextColor,
      { color: 'overBudget' },
      { color: 'success' },
    ],
  ] as const)(
    'the %s turns overBudget only when over budget',
    (_name, fn, over, under) => {
      expect(fn(true)).toEqual(over)
      expect(fn(false)).toEqual(under)
    },
  )

  it('the variance badge flips its whole family, not just one prop', () => {
    expect(getBudgetVarianceBadgeColor(true)).toEqual({
      bg: 'overBudget/10',
      color: 'overBudget',
      borderColor: 'overBudget/20',
    })
    expect(getBudgetVarianceBadgeColor(false)).toEqual({
      bg: 'success/10',
      color: 'success',
      borderColor: 'success/20',
    })
  })
})

describe('getBudgetProgressBarColor', () => {
  it('paints an over-budget bar red no matter how low the percentage reads', () => {
    // isOverBudget outranks the percentage ladder entirely.
    expect(getBudgetProgressBarColor(true, 10)).toEqual({ bg: 'overBudget' })
  })

  it('starts warning at exactly 90%, not a point later', () => {
    expect(getBudgetProgressBarColor(false, 90)).toEqual({ bg: 'warning' })
    expect(getBudgetProgressBarColor(false, 89.9)).toEqual({ bg: 'success' })
  })

  it('stays warning (not red) at 100% while the cents still balance', () => {
    // Only the money comparison may turn the bar overBudget.
    expect(getBudgetProgressBarColor(false, 100)).toEqual({ bg: 'warning' })
  })

  it('paints a barely-started healthy budget green', () => {
    expect(getBudgetProgressBarColor(false, 5)).toEqual({ bg: 'success' })
  })
})
