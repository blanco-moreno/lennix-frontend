import { INDIRECT_CATEGORIES, type IndirectCategory } from '@/types'

import { subtractMoney, toCents } from '../format/format'

export function calculateBudgetMetrics(budget: number, spent: number) {
  const budgetRemaining = subtractMoney(budget, spent)
  // Ratio, not money — a plain float percentage is correct here.
  const budgetPercentage = budget > 0 ? (spent / budget) * 100 : 0
  const isOverBudget = toCents(spent) > toCents(budget)
  return { budgetRemaining, budgetPercentage, isOverBudget }
}

// 'staff' -> 'staff' · 'profit' | null -> null
// A line the frontend cannot name is dropped rather than shown under a raw key.
export function toIndirectCategory(value: unknown): IndirectCategory | null {
  return INDIRECT_CATEGORIES.includes(value as IndirectCategory)
    ? (value as IndirectCategory)
    : null
}
