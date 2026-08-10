import { subtractMoney, toCents } from '../format/format'

export function calculateBudgetMetrics(budget: number, spent: number) {
  const budgetRemaining = subtractMoney(budget, spent)
  // Ratio, not money — a plain float percentage is correct here.
  const budgetPercentage = budget > 0 ? (spent / budget) * 100 : 0
  const isOverBudget = toCents(spent) > toCents(budget)
  return { budgetRemaining, budgetPercentage, isOverBudget }
}
