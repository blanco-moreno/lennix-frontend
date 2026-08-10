import type { TaskDependency, DependencyChain } from '@/types'
import type {
  TaskDependencyCreateRequestDTO,
  TaskDependencyUpdateRequestDTO,
} from '@/types/dto/dependency-dto'

import { api } from '../api-injector'
import { buildDependencyInvalidationTags } from '../cache-tags'

import {
  createDependency,
  updateDependency,
  removeDependency,
  getDependencyChains,
} from './dependency-endpoint'
import {
  mapDependencyChainResponseDTOToDependencyChain,
  mapTaskDependencyResponseDTOToTaskDependency,
} from './dependency-mapper'

export const dependencyApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createDependency: builder.mutation<
      TaskDependency,
      // `projectId` is optional so the invalidation can scope to one project's
      // schedule when the caller passes it; without it the same tag types are
      // busted type-wide.
      {
        taskId: string
        projectId?: string
        body: TaskDependencyCreateRequestDTO
      }
    >({
      query: createDependency,
      transformResponse: mapTaskDependencyResponseDTOToTaskDependency,
      invalidatesTags: (_result, _error, { taskId, projectId }) =>
        buildDependencyInvalidationTags(taskId, projectId),
    }),

    // Editing an edge changes the derived schedule as much as creating one, so it busts the same tags.
    updateDependency: builder.mutation<
      TaskDependency,
      {
        taskId: string
        depId: number
        projectId?: string
        body: TaskDependencyUpdateRequestDTO
      }
    >({
      query: updateDependency,
      transformResponse: mapTaskDependencyResponseDTOToTaskDependency,
      invalidatesTags: (_result, _error, { taskId, projectId }) =>
        buildDependencyInvalidationTags(taskId, projectId),
    }),

    removeDependency: builder.mutation<
      void,
      { taskId: string; depId: number; projectId?: string }
    >({
      query: removeDependency,
      invalidatesTags: (_result, _error, { taskId, projectId }) =>
        buildDependencyInvalidationTags(taskId, projectId),
    }),

    getDependencyChains: builder.query<DependencyChain, string>({
      query: getDependencyChains,
      transformResponse: mapDependencyChainResponseDTOToDependencyChain,
      providesTags: (_result, _error, projectId) => [
        { type: 'Dependency', id: projectId },
      ],
    }),
  }),
})

export const {
  useCreateDependencyMutation,
  useUpdateDependencyMutation,
  useRemoveDependencyMutation,
  useGetDependencyChainsQuery,
} = dependencyApi
