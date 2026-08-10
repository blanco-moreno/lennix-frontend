/** Expense domain types — matches the backend contract for /v1/expenses. */

export interface ExpenseItem {
  id: string
  subtaskId: string
  description: string
  amount: number
  category: ExpenseCategory
  expenseDate: string
  createdBy: string
  createdAt: string
}

export interface ProjectExpense extends ExpenseItem {
  taskId: string
  taskTitle: string
  subtaskTitle: string
}

export type ExpenseCategory =
  | 'labor'
  | 'materials'
  | 'equipment'
  | 'subcontractor'
  | 'other'

export interface BudgetVariance {
  entityId: string
  entityName: string
  entityType: string
  budget: number | null
  spent: number
  remaining: number
  variance: number
  variancePercentage: number
  isOverBudget: boolean
}

export interface CostReport {
  projectId: string
  budget: number | null
  allocated: number
  unallocated: number
  spent: number
  remaining: number
  isOverBudget: boolean
  utilizationPercentage: number
  categoryBreakdown: Record<string, number>
  taskVariances: BudgetVariance[]
}
