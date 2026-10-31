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

export type ExpenseDocumentTypeDTO = 'invoice' | 'receipt' | 'purchase_order'

/** POST /v1/expenses — request */
export interface ExpenseCreateRequestDTO {
  project_id?: string | null
  subtask_id?: string | null
  description: string
  amount: string
  category: string
  expense_date: string
  document_type?: ExpenseDocumentTypeDTO | null
  document_number?: string | null
  /** ms-bk `IndirectCategory`; project-level expenses only (`BUD-11`). */
  indirect_category?: string | null
}

/** PUT /v1/expenses/:id — request */
export interface ExpenseUpdateRequestDTO {
  description?: string | null
  amount?: string | null
  category?: string | null
  expense_date?: string | null
  document_type?: ExpenseDocumentTypeDTO | null
  document_number?: string | null
}

/** Expense endpoints — response */
export interface ExpenseResponseDTO {
  id: string
  project_id?: string | null
  subtask_id?: string | null
  description: string
  amount: string
  category: ExpenseCategoryDTO
  indirect_category?: string | null
  expense_date: string
  document_type?: ExpenseDocumentTypeDTO | null
  document_number?: string | null
  attachment_filename?: string | null
  attachment_size_bytes?: number | null
  attachment_content_type?: string | null
  has_attachment: boolean
  created_by: string
  created_at: string
}

/** GET /v1/expenses/projects/:project_id — response */
export interface ProjectExpenseResponseDTO extends ExpenseResponseDTO {
  task_id?: string | null
  task_title?: string | null
  subtask_title?: string | null
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
