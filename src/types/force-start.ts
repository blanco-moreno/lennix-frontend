import type { ForceStartStateDTO } from './dto/force-start-dto'

export type ForceStartState = ForceStartStateDTO

export interface ForceStartRequest {
  id: string
  taskId: string
  reason: string
  state: ForceStartState
  requestorId: string
  decidedBy: string | null
  decidedAt: string | null
  decisionComment: string | null
  stateSnapshot: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface ForceStartCreateInput {
  taskId: string
  reason: string
}

export interface ForceStartListFilters {
  state?: ForceStartState
  taskId?: string
}
