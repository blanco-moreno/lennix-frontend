import type {
  CriticalPathSummary,
  ProjectDashboard,
  DelayAnalysis,
  TaskCompletionStats,
  OrganizationDashboard,
} from '@/types'

import { api } from '../api-injector'

import {
  getCriticalPaths,
  refreshCriticalPaths,
  getProjectDashboard,
  getDelayAnalysis,
  getCompletionStats,
  getOrgDashboard,
} from './analytics-endpoint'
import {
  mapCriticalPathSummaryResponseDTOToCriticalPathSummary,
  mapProjectDashboardResponseDTOToProjectDashboard,
  mapDelayAnalysisResponseDTOToDelayAnalysis,
  mapTaskCompletionStatsResponseDTOToTaskCompletionStats,
  mapOrganizationDashboardResponseDTOToOrganizationDashboard,
} from './analytics-mapper'

export const analyticsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCriticalPaths: builder.query<CriticalPathSummary, string>({
      query: getCriticalPaths,
      transformResponse: mapCriticalPathSummaryResponseDTOToCriticalPathSummary,
      providesTags: (_result, _error, projectId) => [
        { type: 'CriticalPath', id: projectId },
      ],
    }),

    refreshCriticalPaths: builder.mutation<CriticalPathSummary, string>({
      query: refreshCriticalPaths,
      transformResponse: mapCriticalPathSummaryResponseDTOToCriticalPathSummary,
      invalidatesTags: (_result, _error, projectId) => [
        { type: 'CriticalPath', id: projectId },
      ],
    }),

    getProjectDashboard: builder.query<ProjectDashboard, string>({
      query: getProjectDashboard,
      transformResponse: mapProjectDashboardResponseDTOToProjectDashboard,
      providesTags: (_result, _error, projectId) => [
        { type: 'Dashboard', id: projectId },
      ],
    }),

    getDelayAnalysis: builder.query<DelayAnalysis, string>({
      query: getDelayAnalysis,
      transformResponse: mapDelayAnalysisResponseDTOToDelayAnalysis,
      providesTags: (_result, _error, projectId) => [
        { type: 'DelayAnalysis', id: projectId },
      ],
    }),

    getCompletionStats: builder.query<
      TaskCompletionStats,
      { projectId: string; days?: number }
    >({
      query: getCompletionStats,
      transformResponse: mapTaskCompletionStatsResponseDTOToTaskCompletionStats,
      providesTags: (_result, _error, { projectId }) => [
        { type: 'CompletionStats', id: projectId },
      ],
    }),

    getOrgDashboard: builder.query<OrganizationDashboard, string>({
      query: getOrgDashboard,
      transformResponse:
        mapOrganizationDashboardResponseDTOToOrganizationDashboard,
      providesTags: (_result, _error, orgId) => [
        { type: 'OrgDashboard', id: orgId },
      ],
    }),
  }),
})

export const {
  useGetCriticalPathsQuery,
  useRefreshCriticalPathsMutation,
  useGetProjectDashboardQuery,
  useGetDelayAnalysisQuery,
  useGetCompletionStatsQuery,
  useGetOrgDashboardQuery,
} = analyticsApi
