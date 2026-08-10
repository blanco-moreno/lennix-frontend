/**
 * The force-start request the seed carries (seed `11_force_start`).
 *
 * The seed's request is already `approved` — it is what left `Montaje de
 * Fachada` permanently at risk. The pending variant below is the same row
 * rewound to before the decision, which is the only state the approvals
 * bandeja offers buttons for.
 */

import { SEED_FORCE_START } from '@/tests/seed'
import type { ForceStartRequestResponseDTO } from '@/types/dto/force-start-dto'

import { FIXTURE_CREATED_AT } from './seed-lookup'

function snapshotOf(): Record<string, unknown> {
  const forced = SEED_FORCE_START.forced
  return {
    id: forced.id,
    title: forced.title,
    status: forced.status,
    // The snapshot records the block the request was raised against, which the
    // approval then overrode — the live row reads `is_blocked: false`.
    is_blocked: true,
    project_id: forced.projectId,
    parent_id: forced.parentId,
  }
}

export function seedForceStartRequestDTO(
  overrides: Partial<ForceStartRequestResponseDTO> = {},
): ForceStartRequestResponseDTO {
  const request = SEED_FORCE_START.request
  return {
    id: request.id,
    task_id: request.taskId,
    reason: request.reason,
    state: request.state as ForceStartRequestResponseDTO['state'],
    requestor_id: request.requestorId,
    decided_by: request.decidedBy,
    decided_at: request.decidedAt,
    decision_comment: request.decisionComment,
    state_snapshot: snapshotOf(),
    created_at: FIXTURE_CREATED_AT,
    updated_at: FIXTURE_CREATED_AT,
    ...overrides,
  }
}

/** The same request before anyone decided it. */
export function seedPendingForceStartRequestDTO(
  overrides: Partial<ForceStartRequestResponseDTO> = {},
): ForceStartRequestResponseDTO {
  return seedForceStartRequestDTO({
    state: 'pending',
    decided_by: null,
    decided_at: null,
    decision_comment: null,
    ...overrides,
  })
}
