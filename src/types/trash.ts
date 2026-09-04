/** Three soft-deletable entity types from the backend matrix. */
export type TrashKind = 'project' | 'task' | 'expense'

export interface TrashedProject {
  id: string
  name: string
  organizationId: string
  deletedAt: string | null
  deletedBy: string | null
}

export interface TrashedTask {
  id: string
  title: string
  projectId: string
  parentId: string | null
  deletedAt: string | null
  deletedBy: string | null
}

export interface TrashedExpense {
  id: string
  description: string
  /** Numeric(12,2) — Decimal kept as string for precision. */
  amount: string
  subtaskId: string | null
  projectId?: string | null
  deletedAt: string | null
  deletedBy: string | null
}
