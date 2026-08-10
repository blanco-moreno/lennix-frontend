import { http, HttpResponse } from 'msw'

import {
  pageOf,
  seedForceStartRequestDTO,
  seedPendingForceStartRequestDTO,
} from '@/tests/fixtures'
import type {
  ForceStartCreateRequestDTO,
  ForceStartDecideRequestDTO,
} from '@/types/dto/force-start-dto'

/**
 * The force-start approval flow.
 *
 * The list answers the seed's request, filtered by `state` and `task_id` the
 * way the backend does. Both filters matter: the bandeja defaults to `pending`,
 * and the per-task query the request button makes must not report *another*
 * activity's pending request as this one's.
 */
export const listForceStartRequestsHandler = http.get(
  '*/v1/force-start-requests',
  ({ request }) => {
    const params = new URL(request.url).searchParams
    const state = params.get('state')
    const taskId = params.get('task_id')

    const row =
      state === 'pending'
        ? seedPendingForceStartRequestDTO()
        : seedForceStartRequestDTO()

    // The seed's row is `approved` — a `pending` query answers the rewound
    // variant, and a `rejected` one has nothing to show.
    const rows =
      state === 'rejected' || (taskId && taskId !== row.task_id) ? [] : [row]
    return HttpResponse.json(pageOf(rows))
  },
)

export const createForceStartRequestHandler = http.post(
  '*/v1/force-start-requests',
  async ({ request }) => {
    const body = (await request.json()) as ForceStartCreateRequestDTO
    return HttpResponse.json(
      seedPendingForceStartRequestDTO({
        task_id: body.task_id,
        reason: body.reason,
      }),
      { status: 201 },
    )
  },
)

/**
 * Approving is what actually force-starts the task and stamps its permanent
 * at-risk mark server-side — here it just returns the decided request, which is
 * what the client reads. Self-approval is allowed, so there is deliberately
 * no requestor check.
 */
export const approveForceStartRequestHandler = http.post(
  '*/v1/force-start-requests/:requestId/approve',
  async ({ params, request }) => {
    const body = (await request.json()) as ForceStartDecideRequestDTO
    return HttpResponse.json(
      seedForceStartRequestDTO({
        id: String(params.requestId),
        state: 'approved',
        decision_comment: body.decision_comment,
      }),
    )
  },
)

export const rejectForceStartRequestHandler = http.post(
  '*/v1/force-start-requests/:requestId/reject',
  async ({ params, request }) => {
    const body = (await request.json()) as ForceStartDecideRequestDTO
    return HttpResponse.json(
      seedForceStartRequestDTO({
        id: String(params.requestId),
        state: 'rejected',
        decision_comment: body.decision_comment,
      }),
    )
  },
)

export const forceStartHandlers = [
  approveForceStartRequestHandler,
  rejectForceStartRequestHandler,
  listForceStartRequestsHandler,
  createForceStartRequestHandler,
]
