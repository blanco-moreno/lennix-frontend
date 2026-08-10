import type {
  BudgetApproval,
  BudgetApprovalCreateInput,
  BudgetApprovalListFilters,
  Page,
} from '@/types'
import type {
  BudgetApprovalCreateRequestDTO,
  BudgetApprovalDecideRequestDTO,
  BudgetApprovalResponseDTO,
} from '@/types/dto/budget-approval-dto'
import type { PageDTO } from '@/types/dto/pagination-dto'

import { api } from '../api-injector'
import { providesPageTags, type AppTagType } from '../cache-tags'
import { mapPage } from '../pagination'

import {
  approveApproval,
  createApproval,
  listApprovals,
  rejectApproval,
} from './budget-approval-endpoint'
import { mapBudgetApprovalResponseDTOToBudgetApproval } from './budget-approval-mapper'

interface DecideArg {
  id: string
  decisionComment: string | null
}

type ApprovalTag = { type: AppTagType; id?: string }

/**
 * Tags invalidated when an approval is approved.
 *
 * Approving writes a project/task budget, so the budget caches must bust — but
 * invalidating the `Project`/`ProjectBudget`/`Task` types wholesale refetched
 * every cached project in the org. The decided approval carries its own
 * `targetType`/`targetId`, so scope off that instead.
 */
function buildApprovalDecideTags(
  result: BudgetApproval | undefined,
  id: string,
): ApprovalTag[] {
  const base: ApprovalTag[] = [
    { type: 'BudgetApproval', id },
    { type: 'BudgetApproval', id: 'LIST' },
  ]

  // No result means the mutation failed; RTK Query skips invalidation anyway.
  if (!result) return base

  if (result.targetType === 'project') {
    return [
      ...base,
      { type: 'Project', id: result.targetId },
      { type: 'ProjectBudget', id: result.targetId },
      { type: 'CostReport', id: result.targetId },
      { type: 'Task', id: `project-${result.targetId}` },
      { type: 'ProjectActivity', id: result.targetId },
    ]
  }

  return [
    ...base,
    { type: 'Task', id: result.targetId },
    { type: 'BudgetVariance', id: result.targetId },
    // A task budget rolls up into its project's allocated/spent/over-budget
    // figures, but the approval doesn't carry the project id — so these two
    // stay type-wide. That's a couple of per-project queries on a hand-made
    // decision, not an org-wide storm.
    { type: 'ProjectBudget' },
    { type: 'Project' },
    // The decision writes a Historial row; a task target carries no project id.
    { type: 'ProjectActivity' },
  ]
}

export const budgetApprovalApi = api.injectEndpoints({
  endpoints: (builder) => ({
    listBudgetApprovals: builder.query<
      Page<BudgetApproval>,
      BudgetApprovalListFilters | void
    >({
      query: (filters) => listApprovals(filters ?? {}),
      transformResponse: (dto: PageDTO<BudgetApprovalResponseDTO>) =>
        mapPage(dto, mapBudgetApprovalResponseDTOToBudgetApproval),
      providesTags: providesPageTags<BudgetApproval>('BudgetApproval'),
    }),

    createBudgetApproval: builder.mutation<
      BudgetApproval,
      BudgetApprovalCreateInput
    >({
      query: (input) => {
        const body: BudgetApprovalCreateRequestDTO = {
          target_type: input.targetType,
          target_id: input.targetId,
          requested_amount: input.requestedAmount,
          reason: input.reason,
        }
        return { url: createApproval, method: 'POST', body }
      },
      transformResponse: (dto: BudgetApprovalResponseDTO) =>
        mapBudgetApprovalResponseDTOToBudgetApproval(dto),
      invalidatesTags: [{ type: 'BudgetApproval', id: 'LIST' }],
    }),

    approveBudgetApproval: builder.mutation<BudgetApproval, DecideArg>({
      query: ({ id, decisionComment }) => {
        const body: BudgetApprovalDecideRequestDTO = {
          decision_comment: decisionComment,
        }
        return { url: approveApproval(id), method: 'POST', body }
      },
      transformResponse: (dto: BudgetApprovalResponseDTO) =>
        mapBudgetApprovalResponseDTOToBudgetApproval(dto),
      invalidatesTags: (result, _err, { id }) =>
        buildApprovalDecideTags(result, id),
    }),

    rejectBudgetApproval: builder.mutation<BudgetApproval, DecideArg>({
      query: ({ id, decisionComment }) => {
        const body: BudgetApprovalDecideRequestDTO = {
          decision_comment: decisionComment,
        }
        return { url: rejectApproval(id), method: 'POST', body }
      },
      transformResponse: (dto: BudgetApprovalResponseDTO) =>
        mapBudgetApprovalResponseDTOToBudgetApproval(dto),
      invalidatesTags: (result, _err, { id }) => [
        { type: 'BudgetApproval', id },
        { type: 'BudgetApproval', id: 'LIST' },
        // The rejection writes a Historial row; only a project target tells us
        // which project's feed to bust.
        ...(result?.targetType === 'project'
          ? [{ type: 'ProjectActivity' as const, id: result.targetId }]
          : [{ type: 'ProjectActivity' as const }]),
      ],
    }),
  }),
})

export const {
  useListBudgetApprovalsQuery,
  useCreateBudgetApprovalMutation,
  useApproveBudgetApprovalMutation,
  useRejectBudgetApprovalMutation,
} = budgetApprovalApi
