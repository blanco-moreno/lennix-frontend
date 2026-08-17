/**
 * Seed-aligned API fixtures — the single source of demo data for the frontend.
 *
 * Every value here is derived from `src/tests/seed` (the generated mirror of
 * the backend `lennix_pro` seed), so MSW mocks and unit tests exercise the same
 * data a seeded Lennix really serves. Do not hand-write demo payloads: add or
 * extend a fixture instead, and run `pnpm seed:sync` when the seed changes.
 */
export {
  FIXTURE_CREATED_AT,
  requiredDecimal,
  seedProject,
  seedTask,
  seedTaskFlags,
  seedUser,
} from './seed-lookup'
export { pageOf } from './pagination-fixtures'
export {
  seedAccessTokenDTO,
  seedCurrentUserDTO,
  seedUserDTO,
  seedUserDTOs,
} from './auth-fixtures'
export {
  seedOrganizationDTO,
  seedOrganizationMemberListDTO,
  seedOrganizationUsageDTO,
  seedPlanSummaryDTO,
  seedPlanListDTO,
  seedResolvedLimitsDTO,
  seedRoleListDTO,
} from './organization-fixtures'
export {
  DEFAULT_SEED_PROJECT_ID,
  resolveSeedProjectId,
  seedDraftProjectListDTO,
  seedProjectBudgetDTO,
  seedProjectDetailDTO,
  seedProjectDTO,
  seedProjectListDTO,
  seedAssignableMembersDTO,
  seedProjectTeamDTO,
} from './project-fixtures'
export {
  FIXTURE_ACTIVITY_LATEST_AT,
  seedEveryProjectActivityActionDTO,
  seedProjectActivityListDTO,
  seedProjectActivityPageDTO,
} from './project-activity-fixtures'
export {
  DEFAULT_SEED_SUBTASK_ID,
  DEFAULT_SEED_TASK_ID,
  resolveSeedSubtaskId,
  resolveSeedTaskId,
  seedAssignedSubtaskListDTO,
  seedBrokenDependentTaskDTO,
  seedDependencyChainDTO,
  seedForceStartedTaskDTO,
  seedOrganizationTaskListDTO,
  seedSubtaskDTO,
  seedSubtaskListDTO,
  seedTaskDependencyDTO,
  seedTaskDTO,
  seedTaskListDTO,
  seedBrokenUpstreamTaskDTO,
} from './task-fixtures'
export {
  seedBudgetVarianceDTO,
  seedCostReportDTO,
  seedExpenseDTO,
  seedProjectExpenseListDTO,
  seedSubtaskExpenseListDTO,
} from './expense-fixtures'
export {
  seedCriticalPathSummaryDTO,
  seedDelayAnalysisDTO,
  seedOrganizationDashboardDTO,
  seedProjectDashboardDTO,
  seedTaskCompletionStatsDTO,
} from './analytics-fixtures'
export {
  FIXTURE_DIVERTED_JOB_ID,
  seedDivertedImportJobStatusDTO,
  seedImportAssistedMappingErrorDTO,
  seedImportExecuteDTO,
  seedImportJobStatusDTO,
  seedImportReviewStateDTO,
  seedImportUploadDTO,
} from './project-import-fixtures'
export {
  seedForceStartRequestDTO,
  seedPendingForceStartRequestDTO,
} from './force-start-fixtures'
