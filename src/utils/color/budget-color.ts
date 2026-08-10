import type { ColorStyle } from './color-style'

/** Budget color helpers — return Chakra style props to spread onto elements. */

export function getBudgetSpentIconContainerColor(
  isOverBudget: boolean,
): ColorStyle {
  return isOverBudget ? { bg: 'overBudget/10' } : { bg: 'warning/10' }
}

export function getBudgetSpentTextColor(isOverBudget: boolean): ColorStyle {
  return isOverBudget ? { color: 'overBudget' } : { color: 'warning' }
}

export function getBudgetRemainingIconContainerColor(
  isOverBudget: boolean,
): ColorStyle {
  return isOverBudget ? { bg: 'overBudget/10' } : { bg: 'success/10' }
}

export function getBudgetRemainingTextColor(isOverBudget: boolean): ColorStyle {
  return isOverBudget ? { color: 'overBudget' } : { color: 'success' }
}

export function getBudgetVarianceTextColor(isOverBudget: boolean): ColorStyle {
  return isOverBudget ? { color: 'overBudget' } : { color: 'success' }
}

export function getBudgetVarianceBadgeColor(isOverBudget: boolean): ColorStyle {
  return isOverBudget
    ? {
        bg: 'overBudget/10',
        color: 'overBudget',
        borderColor: 'overBudget/20',
      }
    : { bg: 'success/10', color: 'success', borderColor: 'success/20' }
}

export function getBudgetProgressBarColor(
  isOverBudget: boolean,
  percentage: number,
): ColorStyle {
  if (isOverBudget) return { bg: 'overBudget' }
  if (percentage >= 90) return { bg: 'warning' }
  return { bg: 'success' }
}
