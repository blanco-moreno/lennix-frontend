import { http, HttpResponse } from 'msw'

import {
  resolveSeedProjectId,
  seedCriticalPathSummaryDTO,
  seedDelayAnalysisDTO,
  seedOrganizationDashboardDTO,
  seedProjectDashboardDTO,
  seedTaskCompletionStatsDTO,
} from '@/tests/fixtures'

export const criticalPathsHandler = http.get(
  '*/v1/analytics/projects/:projectId/critical-paths',
  ({ params }) => {
    return HttpResponse.json(
      seedCriticalPathSummaryDTO(resolveSeedProjectId(params.projectId)),
    )
  },
)

/** "Refresh" re-derives on read — same payload, nothing persisted. */
export const refreshCriticalPathsHandler = http.post(
  '*/v1/analytics/projects/:projectId/critical-paths/refresh',
  ({ params }) => {
    return HttpResponse.json(
      seedCriticalPathSummaryDTO(resolveSeedProjectId(params.projectId)),
    )
  },
)

export const projectDashboardHandler = http.get(
  '*/v1/analytics/projects/:projectId/dashboard',
  ({ params }) => {
    return HttpResponse.json(
      seedProjectDashboardDTO(resolveSeedProjectId(params.projectId)),
    )
  },
)

export const delayAnalysisHandler = http.get(
  '*/v1/analytics/projects/:projectId/delay-analysis',
  ({ params }) => {
    return HttpResponse.json(
      seedDelayAnalysisDTO(resolveSeedProjectId(params.projectId)),
    )
  },
)

export const completionStatsHandler = http.get(
  '*/v1/analytics/projects/:projectId/completion-stats',
  ({ params }) => {
    return HttpResponse.json(
      seedTaskCompletionStatsDTO(resolveSeedProjectId(params.projectId)),
    )
  },
)

export const orgDashboardHandler = http.get(
  '*/v1/analytics/organizations/:organizationId/dashboard',
  () => {
    return HttpResponse.json(seedOrganizationDashboardDTO())
  },
)

export const analyticsHandlers = [
  criticalPathsHandler,
  refreshCriticalPathsHandler,
  projectDashboardHandler,
  delayAnalysisHandler,
  completionStatsHandler,
  orgDashboardHandler,
]
