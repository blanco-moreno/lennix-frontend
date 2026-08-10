import type {
  Page,
  TrashKind,
  TrashedExpense,
  TrashedProject,
  TrashedTask,
} from '@/types'
import type { PageDTO } from '@/types/dto/pagination-dto'
import type {
  TrashedExpenseResponseDTO,
  TrashedProjectResponseDTO,
  TrashedTaskResponseDTO,
} from '@/types/dto/trash-dto'

import { api } from '../api-injector'
import { mapPage } from '../pagination'

import {
  listTrashedExpenses,
  listTrashedProjects,
  listTrashedTasks,
  purgeTrashed,
  restoreTrashed,
  bulkPurgeTrashed,
} from './trash-endpoint'
import {
  mapTrashedExpenseDTOToDomain,
  mapTrashedProjectDTOToDomain,
  mapTrashedTaskDTOToDomain,
} from './trash-mapper'

interface MutateArg {
  kind: TrashKind
  id: string
}

/** Query args for a trash list. Both optional — the backend defaults them. */
export interface TrashPageArg {
  page?: number
  pageSize?: number
}

function pageQuery(url: string, { page, pageSize }: TrashPageArg = {}) {
  return {
    url,
    params: {
      ...(page === undefined ? {} : { page }),
      ...(pageSize === undefined ? {} : { page_size: pageSize }),
    },
  }
}

/**
 * Restoring an item brings the project/task/expense back to the
 * active surface, so we must bust the regular query caches for it.
 * Use a broad invalidation rather than id-scoped tags because the
 * trashed payload doesn't carry enough metadata (e.g. the project
 * id for a restored task is known but the org id isn't).
 */
const TRASH_MUTATION_INVALIDATION = [
  { type: 'Trash' as const, id: 'projects' },
  { type: 'Trash' as const, id: 'tasks' },
  { type: 'Trash' as const, id: 'expenses' },
  { type: 'Project' as const },
  { type: 'ProjectBudget' as const },
  { type: 'Task' as const },
  { type: 'Subtask' as const },
  { type: 'Expense' as const },
  { type: 'Dashboard' as const },
  // Restores and purges write Historial rows; MutateArg carries no project id.
  { type: 'ProjectActivity' as const },
  // Restoring a project re-charges its plan slot and purging frees one, so
  // every plan-gated button has to re-read the meter.
  { type: 'OrgUsage' as const },
]

export const trashApi = api.injectEndpoints({
  endpoints: (builder) => ({
    listTrashedProjects: builder.query<
      Page<TrashedProject>,
      TrashPageArg | void
    >({
      query: (arg) => pageQuery(listTrashedProjects, arg ?? undefined),
      transformResponse: (dto: PageDTO<TrashedProjectResponseDTO>) =>
        mapPage(dto, mapTrashedProjectDTOToDomain),
      providesTags: [{ type: 'Trash', id: 'projects' }],
    }),
    listTrashedTasks: builder.query<Page<TrashedTask>, TrashPageArg | void>({
      query: (arg) => pageQuery(listTrashedTasks, arg ?? undefined),
      transformResponse: (dto: PageDTO<TrashedTaskResponseDTO>) =>
        mapPage(dto, mapTrashedTaskDTOToDomain),
      providesTags: [{ type: 'Trash', id: 'tasks' }],
    }),
    listTrashedExpenses: builder.query<
      Page<TrashedExpense>,
      TrashPageArg | void
    >({
      query: (arg) => pageQuery(listTrashedExpenses, arg ?? undefined),
      transformResponse: (dto: PageDTO<TrashedExpenseResponseDTO>) =>
        mapPage(dto, mapTrashedExpenseDTOToDomain),
      providesTags: [{ type: 'Trash', id: 'expenses' }],
    }),

    restoreTrashed: builder.mutation<void, MutateArg>({
      query: ({ kind, id }) => ({
        url: restoreTrashed(kind, id),
        method: 'POST',
      }),
      invalidatesTags: TRASH_MUTATION_INVALIDATION,
    }),

    purgeTrashed: builder.mutation<void, MutateArg>({
      query: ({ kind, id }) => ({
        url: purgeTrashed(kind, id),
        method: 'DELETE',
      }),
      invalidatesTags: TRASH_MUTATION_INVALIDATION,
    }),

    bulkPurgeTrashed: builder.mutation<
      void,
      { kind: TrashKind; ids: string[] }
    >({
      query: ({ kind, ids }) => ({
        url: bulkPurgeTrashed,
        method: 'POST',
        body: { kind, ids },
      }),
      invalidatesTags: TRASH_MUTATION_INVALIDATION,
    }),
  }),
})

export const {
  useListTrashedProjectsQuery,
  useListTrashedTasksQuery,
  useListTrashedExpensesQuery,
  useRestoreTrashedMutation,
  usePurgeTrashedMutation,
  useBulkPurgeTrashedMutation,
} = trashApi
