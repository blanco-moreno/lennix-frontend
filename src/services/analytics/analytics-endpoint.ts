export const getCriticalPaths = (projectId: string) =>
  `/v1/analytics/projects/${projectId}/critical-paths`

export const refreshCriticalPaths = (projectId: string) => ({
  url: `/v1/analytics/projects/${projectId}/critical-paths/refresh`,
  method: 'POST',
})

export const getProjectDashboard = (projectId: string) =>
  `/v1/analytics/projects/${projectId}/dashboard`

export const getDelayAnalysis = (projectId: string) =>
  `/v1/analytics/projects/${projectId}/delay-analysis`

export const getCompletionStats = ({
  projectId,
  days,
}: {
  projectId: string
  days?: number
}) => ({
  url: `/v1/analytics/projects/${projectId}/completion-stats`,
  params: { ...(days !== undefined && { days }) },
})

export const getOrgDashboard = (orgId: string) =>
  `/v1/analytics/organizations/${orgId}/dashboard`
