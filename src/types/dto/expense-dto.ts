/** Expense API DTOs — matches the backend contract for /v1/expenses endpoints. */

/**
 * The wire spells this as a string, but the vocabulary is the closed
 * `ExpenseCategory` enum in `lennix-ms-bk/app/expenses/constants.py`: every
 * write is enum-validated, so no other value can reach a response.
 */
export type ExpenseCategoryDTO =
  | 'labor'
  | 'materials'
  | 'equipment'
  | 'subcontractor'
  | 'other'

/** POST /v1/expenses — request */
export interface ExpenseCreateRequestDTO {
  subtask_id: string
  description: string
  amount: string
  category: string
  expense_date: string
}

/** PUT /v1/expenses/:id — request */
export interface ExpenseUpdateRequestDTO {
  description?: string | null
  amount?: string | null
  category?: string | null
  expense_date?: string | null
}

/** Expense endpoints — response */
export interface ExpenseResponseDTO {
  id: string
  subtask_id: string
  description: string
  amount: string
  category: ExpenseCategoryDTO
  expense_date: string
  created_by: string
  created_at: string
}

/** GET /v1/expenses/projects/:project_id — response */
export interface ProjectExpenseResponseDTO extends ExpenseResponseDTO {
  task_id: string
  task_title: string
  subtask_title: string
}

/** GET /v1/expenses/tasks/:task_id/variance — response */
export interface BudgetVarianceResponseDTO {
  entity_id: string
  entity_name: string
  entity_type: string
  budget: string | null
  spent: string
  remaining: string
  variance: string
  variance_percentage: number
  is_over_budget: boolean
}

/** GET /v1/expenses/projects/:project_id/cost-report — response */
export interface CostReportResponseDTO {
  project_id: string
  budget: string | null
  allocated: string
  unallocated: string
  spent: string
  remaining: string
  is_over_budget: boolean
  utilization_percentage: number
  category_breakdown: Record<string, string>
  task_variances: BudgetVarianceResponseDTO[]
}
