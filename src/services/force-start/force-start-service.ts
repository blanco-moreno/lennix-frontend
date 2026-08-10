import type {
  ForceStartCreateInput,
  ForceStartListFilters,
  ForceStartRequest,
  Page,
} from '@/types'
import type {
  ForceStartCreateRequestDTO,
  ForceStartDecideRequestDTO,
  ForceStartRequestResponseDTO,
} from '@/types/dto/force-start-dto'
import type { PageDTO } from '@/types/dto/pagination-dto'

import { api } from '../api-injector'
import { providesPageTags } from '../cache-tags'
import { mapPage } from '../pagination'

import {
  approveForceStartRequest,
  createForceStartRequest,
  listForceStartRequests,
  rejectForceStartRequest,
} from './force-start-endpoint'
import { mapForceStartRequestDTO } from './force-start-mapper'

interface DecideArg {
  id: string
  decisionComment: string | null
}

/**
 * What an approval busts.
 *
 * Approving actually force-starts the target task: it unblocks it and stamps
 * the permanent at-risk flag. The task's own row and the schedule that
 * draws its block state have to refetch, but the request carries only a
 * `task_id` — no project id — so the schedule-shaped tags stay type-wide. That
 * is a handful of per-project queries on a decision a human just made by hand,
 * not a background storm.
 */
const decideInvalidation = (
  result: ForceStartRequest | undefined,
  id: string,
) => {
  const base = [
    { type: 'ForceStartRequest' as const, id },
    { type: 'ForceStartRequest' as const, id: 'LIST' },
  ]
  if (!result) return base
  return [
    ...base,
    { type: 'Task' as const, id: result.taskId },
    { type: 'Subtask' as const, id: result.taskId },
    { type: 'Task' as const },
    { type: 'CriticalPath' as const },
    { type: 'Dashboard' as const },
    // The graph carries each node's `is_blocked` too, and the override just
    // flipped it — without this the Gantt keeps calling a released activity
    // blocked until something else busts the chain.
    { type: 'Dependency' as const },
    // The decision writes a Historial row; the request carries no project id.
    { type: 'ProjectActivity' as const },
  ]
}

export const forceStartApi = api.injectEndpoints({
  endpoints: (builder) => ({
    listForceStartRequests: builder.query<
      Page<ForceStartRequest>,
      ForceStartListFilters | void
    >({
      query: (filters) => listForceStartRequests(filters ?? {}),
      transformResponse: (dto: PageDTO<ForceStartRequestResponseDTO>) =>
        mapPage(dto, mapForceStartRequestDTO),
      providesTags: providesPageTags<ForceStartRequest>('ForceStartRequest'),
    }),

    createForceStartRequest: builder.mutation<
      ForceStartRequest,
      ForceStartCreateInput
    >({
      query: ({ taskId, reason }) => {
        const body: ForceStartCreateRequestDTO = {
          task_id: taskId,
          reason,
        }
        return { url: createForceStartRequest, method: 'POST', body }
      },
      transformResponse: (dto: ForceStartRequestResponseDTO) =>
        mapForceStartRequestDTO(dto),
      // A request changes nothing about the task yet — only the bandeja moves.
      invalidatesTags: [{ type: 'ForceStartRequest', id: 'LIST' }],
    }),

    approveForceStartRequest: builder.mutation<ForceStartRequest, DecideArg>({
      query: ({ id, decisionComment }) => {
        const body: ForceStartDecideRequestDTO = {
          decision_comment: decisionComment,
        }
        return { url: approveForceStartRequest(id), method: 'POST', body }
      },
      transformResponse: (dto: ForceStartRequestResponseDTO) =>
        mapForceStartRequestDTO(dto),
      invalidatesTags: (result, _error, { id }) =>
        decideInvalidation(result, id),
    }),

    rejectForceStartRequest: builder.mutation<ForceStartRequest, DecideArg>({
      query: ({ id, decisionComment }) => {
        const body: ForceStartDecideRequestDTO = {
          decision_comment: decisionComment,
        }
        return { url: rejectForceStartRequest(id), method: 'POST', body }
      },
      transformResponse: (dto: ForceStartRequestResponseDTO) =>
        mapForceStartRequestDTO(dto),
      // A rejection touches no task — the block stands.
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'ForceStartRequest', id },
        { type: 'ForceStartRequest', id: 'LIST' },
        // The decision writes a Historial row; the request carries no project id.
        { type: 'ProjectActivity' },
      ],
    }),
  }),
})

export const {
  useListForceStartRequestsQuery,
  useCreateForceStartRequestMutation,
  useApproveForceStartRequestMutation,
  useRejectForceStartRequestMutation,
} = forceStartApi
