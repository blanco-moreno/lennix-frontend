/** GET /v1/trash/projects — response item */
export interface TrashedProjectResponseDTO {
  id: string
  name: string
  organization_id: string
  deleted_at: string | null
  deleted_by: string | null
}

/** GET /v1/trash/tasks — response item */
export interface TrashedTaskResponseDTO {
  id: string
  title: string
  project_id: string
  parent_id: string | null
  deleted_at: string | null
  deleted_by: string | null
}

/** GET /v1/trash/expenses — response item */
export interface TrashedExpenseResponseDTO {
  id: string
  description: string
  amount: string
  subtask_id: string | null
  project_id?: string | null
  deleted_at: string | null
  deleted_by: string | null
}
