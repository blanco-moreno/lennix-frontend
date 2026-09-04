/** Expense domain types — matches the backend contract for /v1/expenses. */

export type ExpenseDocumentType = 'invoice' | 'receipt' | 'purchase_order'

export interface ExpenseItem {
  id: string
  projectId?: string | null
  subtaskId?: string | null
  description: string
  amount: number
  category: ExpenseCategory
  expenseDate: string
  documentType?: ExpenseDocumentType | null
  documentNumber?: string | null
  attachmentFilename?: string | null
  attachmentSizeBytes?: number | null
  attachmentContentType?: string | null
  hasAttachment?: boolean
  createdBy: string
  createdAt: string
}

export interface ProjectExpense extends ExpenseItem {
  taskId?: string | null
  taskTitle?: string | null
  subtaskTitle?: string | null
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
