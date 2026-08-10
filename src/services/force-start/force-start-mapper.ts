import type { ForceStartRequest } from '@/types'
import type { ForceStartRequestResponseDTO } from '@/types/dto/force-start-dto'

export function mapForceStartRequestDTO(
  dto: ForceStartRequestResponseDTO,
): ForceStartRequest {
  return {
    id: dto.id,
    taskId: dto.task_id,
    reason: dto.reason,
    state: dto.state,
    requestorId: dto.requestor_id,
    decidedBy: dto.decided_by,
    decidedAt: dto.decided_at,
    decisionComment: dto.decision_comment,
    stateSnapshot: dto.state_snapshot,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  }
}

/** Title of the target activity, from the audit snapshot taken at request time. */
export function snapshotTitle(snapshot: Record<string, unknown>): string {
  const title = snapshot.title
  return typeof title === 'string' && title.length > 0 ? title : '—'
}
