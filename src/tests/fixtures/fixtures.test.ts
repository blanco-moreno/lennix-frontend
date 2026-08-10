/**
 * Smoke test over every seed-aligned fixture builder.
 *
 * These are what MSW serves, so a builder that throws or drifts off the seed
 * would silently break whichever future session depends on it. Asserting the
 * shape here keeps that failure local and readable.
 */

import {
  DEFAULT_SEED_PROJECT_ID,
  DEFAULT_SEED_SUBTASK_ID,
  DEFAULT_SEED_TASK_ID,
  seedAccessTokenDTO,
  seedBrokenDependentTaskDTO,
  seedBrokenUpstreamTaskDTO,
  seedBudgetVarianceDTO,
  seedCostReportDTO,
  seedCriticalPathSummaryDTO,
  seedCurrentUserDTO,
  seedDelayAnalysisDTO,
  seedDependencyChainDTO,
  seedDivertedImportJobStatusDTO,
  seedDraftProjectListDTO,
  seedForceStartedTaskDTO,
  seedImportAssistedMappingErrorDTO,
  seedImportExecuteDTO,
  seedImportJobStatusDTO,
  seedImportReviewStateDTO,
  seedImportUploadDTO,
  seedOrganizationDashboardDTO,
  seedOrganizationDTO,
  seedOrganizationMemberListDTO,
  seedOrganizationTaskListDTO,
  seedOrganizationUsageDTO,
  seedPlanListDTO,
  seedProjectBudgetDTO,
  seedProjectDashboardDTO,
  seedProjectDetailDTO,
  seedProjectExpenseListDTO,
  seedProjectListDTO,
  seedProjectTeamDTO,
  seedRoleListDTO,
  seedSubtaskExpenseListDTO,
  seedSubtaskListDTO,
  seedTaskCompletionStatsDTO,
  seedTaskDependencyDTO,
  seedTaskListDTO,
  seedUserDTOs,
  resolveSeedProjectId,
  resolveSeedSubtaskId,
  resolveSeedTaskId,
} from '@/tests/fixtures'
import {
  SEED_IDS,
  SEED_IMPORT_JOB,
  SEED_ORGANIZATION,
  SEED_PLANS,
  SEED_PROJECTS,
  SEED_ROLES,
  SEED_SCHEDULE_IMPORT,
  SEED_USERS,
} from '@/tests/seed'

const MONEY = /^-?\d+\.\d{2}$/

describe('auth fixtures', () => {
  it('serves the seeded owner as the current user', () => {
    const me = seedCurrentUserDTO()
    expect(me.user_id).toBe(SEED_ORGANIZATION.ownerId)
    expect(me.organization_id).toBe(SEED_ORGANIZATION.id)
    expect(me.plan_id).toBe(SEED_ORGANIZATION.planId)
  })

  it('serves every seeded user and a token', () => {
    expect(seedUserDTOs()).toHaveLength(SEED_USERS.length)
    expect(seedAccessTokenDTO().token_type).toBe('Bearer')
  })
})

describe('organization fixtures', () => {
  it('serves the org with its plan and owner resolved', () => {
    const org = seedOrganizationDTO()
    expect(org.name).toBe(SEED_ORGANIZATION.name)
    expect(org.plan.id).toBe(SEED_ORGANIZATION.planId)
    expect(org.owner.user_id).toBe(SEED_ORGANIZATION.ownerId)
    expect(org.resolved_limits.source).toBe('plan')
  })

  it('serves all members, plans and roles', () => {
    expect(seedOrganizationMemberListDTO()).toHaveLength(
      SEED_ORGANIZATION.members.length,
    )
    expect(seedPlanListDTO()).toHaveLength(SEED_PLANS.length)
    expect(seedRoleListDTO()).toHaveLength(SEED_ROLES.length)
  })

  it('counts usage against live projects only (drafts are free, D19/D35)', () => {
    const usage = seedOrganizationUsageDTO()
    expect(usage.current_projects).toBe(
      SEED_PROJECTS.filter((project) => !project.isDraft).length,
    )
    expect(usage.current_team_size).toBe(SEED_ORGANIZATION.members.length)
  })
})

describe('project fixtures', () => {
  it('keeps the draft out of the main listing', () => {
    const live = seedProjectListDTO()
    const drafts = seedDraftProjectListDTO()
    expect(live.every((project) => !project.is_draft)).toBe(true)
    expect(drafts).toHaveLength(3)
    expect(drafts.map((draft) => draft.id)).toContain(SEED_IDS.PROJECT_DRAFT_ID)
  })

  it('resolves the manager name from the seeded user', () => {
    const project = seedProjectDetailDTO(DEFAULT_SEED_PROJECT_ID)
    expect(project.manager_name).toBe('Miguel Santos')
    expect(project.members.length).toBeGreaterThan(0)
    expect(project.members[0].member_email).toContain('@lennix-test.com')
  })

  it('formats money as the API does', () => {
    const budget = seedProjectBudgetDTO(DEFAULT_SEED_PROJECT_ID)
    expect(budget.budget).toMatch(MONEY)
    expect(budget.spent).toMatch(MONEY)
    expect(budget.remaining).toMatch(MONEY)
  })

  it('falls back to the default project for an unknown id', () => {
    expect(resolveSeedProjectId('nope')).toBe(DEFAULT_SEED_PROJECT_ID)
    expect(resolveSeedProjectId(SEED_IDS.PROJECT_CENTRO_ID)).toBe(
      SEED_IDS.PROJECT_CENTRO_ID,
    )
    expect(
      seedProjectTeamDTO(SEED_IDS.PROJECT_CENTRO_ID).length,
    ).toBeGreaterThan(0)
  })
})

describe('task fixtures', () => {
  it('nests the seeded subtasks under their parent phase', () => {
    const tasks = seedTaskListDTO(DEFAULT_SEED_PROJECT_ID)
    expect(
      tasks.every((task) => task.project_id === DEFAULT_SEED_PROJECT_ID),
    ).toBe(true)
    const foundation = tasks.find((task) => task.id === DEFAULT_SEED_TASK_ID)
    expect(foundation?.title).toBe('Cimentacion')
    expect(foundation?.subtasks.length).toBeGreaterThan(0)
    expect(foundation?.subtasks[0].assignee_name).toBeTruthy()
  })

  it('includes the demo scenarios and excludes the deleted upstream', () => {
    const ids = seedTaskListDTO(DEFAULT_SEED_PROJECT_ID).map((task) => task.id)
    expect(ids).toContain(SEED_IDS.P1_TASK_FORCE_STARTED)
    expect(ids).toContain(SEED_IDS.P1_TASK_BROKEN_DEPENDENT)
    expect(ids).not.toContain(SEED_IDS.P1_TASK_BROKEN_UPSTREAM)

    expect(seedForceStartedTaskDTO().at_risk).toBe(true)
    expect(seedBrokenDependentTaskDTO().is_blocked).toBe(true)
    expect(seedBrokenUpstreamTaskDTO().id).toBe(
      SEED_IDS.P1_TASK_BROKEN_UPSTREAM,
    )
  })

  it('serves subtasks and the org-wide task list', () => {
    expect(seedSubtaskListDTO(DEFAULT_SEED_TASK_ID).length).toBeGreaterThan(0)
    expect(seedOrganizationTaskListDTO().length).toBeGreaterThan(
      seedTaskListDTO(DEFAULT_SEED_PROJECT_ID).length,
    )
    expect(resolveSeedTaskId('nope')).toBe(DEFAULT_SEED_TASK_ID)
    // A parent task is not a valid subtask id.
    expect(resolveSeedSubtaskId(DEFAULT_SEED_TASK_ID)).toBe(
      DEFAULT_SEED_SUBTASK_ID,
    )
  })

  it('groups dependencies the way the backend does', () => {
    const chains = seedDependencyChainDTO(DEFAULT_SEED_PROJECT_ID)
    expect(chains.inter_phase.length).toBeGreaterThan(0)
    expect(Object.keys(chains.intra_phase).length).toBeGreaterThan(0)
    // The edge onto the soft-deleted upstream is surfaced, not dropped: it is
    // the broken state the re-link acts on.
    const everyNode = [
      ...chains.inter_phase,
      ...Object.values(chains.intra_phase).flat(),
    ]
    const brokenNode = everyNode.find(
      (node) => node.depends_on?.id === SEED_IDS.P1_TASK_BROKEN_UPSTREAM,
    )
    expect(brokenNode?.is_broken).toBe(true)
    // Every other edge is healthy and defaults to finish-to-start, no lag.
    const healthy = everyNode.filter((node) => !node.is_broken)
    expect(healthy.length).toBeGreaterThan(0)
    expect(healthy.every((node) => node.depends_on !== null)).toBe(true)
    expect(healthy.every((node) => node.relationship_type === 'FS')).toBe(true)
    expect(healthy.every((node) => node.lag_days === 0)).toBe(true)
    expect(seedTaskDependencyDTO().dependency_type).toBe('inter_phase')
  })
})

describe('expense fixtures', () => {
  it('joins the parent-task context into project expenses', () => {
    const expenses = seedProjectExpenseListDTO(DEFAULT_SEED_PROJECT_ID)
    expect(expenses.length).toBeGreaterThan(0)
    expect(expenses[0].task_title).toBeTruthy()
    expect(expenses[0].subtask_title).toBeTruthy()
    expect(expenses[0].amount).toMatch(MONEY)
    expect(
      seedSubtaskExpenseListDTO(DEFAULT_SEED_SUBTASK_ID).length,
    ).toBeGreaterThan(0)
  })

  it('reports cost by category over the seeded rows', () => {
    const report = seedCostReportDTO(DEFAULT_SEED_PROJECT_ID)
    expect(Object.keys(report.category_breakdown).length).toBeGreaterThan(1)
    expect(report.task_variances.length).toBeGreaterThan(0)
    expect(seedBudgetVarianceDTO(DEFAULT_SEED_TASK_ID).entity_type).toBe('task')
  })
})

describe('analytics fixtures', () => {
  it('computes the project dashboard from the seeded rows', () => {
    const dashboard = seedProjectDashboardDTO(DEFAULT_SEED_PROJECT_ID)
    expect(dashboard.project_name).toBe(SEED_PROJECTS[0].name)
    expect(dashboard.tasks_total).toBeGreaterThan(0)
    expect(dashboard.team_size).toBe(SEED_PROJECTS[0].members.length)
  })

  it('computes the org signals over every seeded project', () => {
    const dashboard = seedOrganizationDashboardDTO()
    // The fixture is asserted on what the home renders.
    expect(dashboard.delayed_projects).toBe(
      SEED_PROJECTS.filter((p) => !p.isDraft && p.status === 'delayed').length,
    )
    expect(dashboard.delayed_or_blocked_tasks).toBeGreaterThan(0)
    expect(dashboard.projects_needing_attention.length).toBeGreaterThan(0)
  })

  it('reports the seeded slips and the critical chain', () => {
    const delays = seedDelayAnalysisDTO(DEFAULT_SEED_PROJECT_ID)
    expect(delays.total_delayed).toBeGreaterThan(0)
    expect(delays.most_delayed[0].delay_reason).toBeTruthy()

    const summary = seedCriticalPathSummaryDTO(DEFAULT_SEED_PROJECT_ID)
    expect(summary.critical_paths[0].code).toBe('RT-1')
    expect(summary.critical_paths[0].impact_chain.length).toBeGreaterThan(1)

    expect(
      seedTaskCompletionStatsDTO(DEFAULT_SEED_PROJECT_ID).total_tasks,
    ).toBeGreaterThan(0)
  })
})

describe('import fixtures', () => {
  it('serves the seeded pending draft', () => {
    expect(seedImportUploadDTO().project_id).toBe(SEED_IDS.PROJECT_DRAFT_ID)
    const executed = seedImportExecuteDTO()
    expect(executed.project_name).toContain('Borrador')
    expect(executed.total_duration_days).toBeGreaterThan(0)
    expect(executed.total_tasks).toBeGreaterThan(0)
    // `execute_import_endpoint` returns a JSON number here, not string money.
    expect(typeof executed.total_budget).toBe('number')
    expect(executed).not.toHaveProperty('tasks')
  })

  it('hands the FE a status handle on the upload (6.4)', () => {
    const upload = seedImportUploadDTO()
    expect(upload.import_job_id).toBe(SEED_IMPORT_JOB.id)
    expect(upload.import_id).toBe(SEED_SCHEDULE_IMPORT.id)
    expect(upload.outcome).toBe('parsed')
  })

  it('resolves the import job to the draft it produced', () => {
    const job = seedImportJobStatusDTO()
    expect(job.status).toBe('draft_ready')
    expect(job.terminal).toBe(true)
    expect(job.failure_code).toBeNull()
    expect(job.project_id).toBe(SEED_IDS.PROJECT_DRAFT_ID)
    expect(job.schedule_import_id).toBe(SEED_SCHEDULE_IMPORT.id)
    // A landed draft serves the trust outputs from its review state, not here.
    expect(job.report).toEqual({})
    expect(job.ledger).toEqual([])
  })

  it('carries report and ledger on the diverted job — Lane F has no draft', () => {
    const diverted = seedDivertedImportJobStatusDTO()
    expect(diverted.status).toBe('needs_assisted_mapping')
    expect(diverted.project_id).toBeNull()
    expect(diverted.report).toBe(SEED_SCHEDULE_IMPORT.contract.report)
    expect(diverted.ledger.length).toBeGreaterThan(0)

    const error = seedImportAssistedMappingErrorDTO()
    expect(error.code).toBe('needs_assisted_mapping')
    expect(error.import_job_id).toBe(diverted.id)
  })

  it('rebuilds the draft from the contract the way ms-bk maps it', () => {
    const state = seedImportReviewStateDTO()
    const rows = SEED_SCHEDULE_IMPORT.contract.rows
    const flat = [...state.tasks, ...state.tasks.flatMap((t) => t.subtasks)]

    // Every contract row lands, once, on its seeded id — nothing invented.
    expect(flat).toHaveLength(rows.length)
    for (const row of rows) {
      const task = flat.find((entry) => entry.ref === row.ref)
      expect(task?.id).toBe(SEED_SCHEDULE_IMPORT.taskIdByRef[row.ref])
      // Source dates are authoritative: no recompute at import.
      expect(task?.start_date).toBe(row.start)
      expect(task?.due_date).toBe(row.finish)
    }

    // Progress lands on leaves only; a main task derives its own.
    expect(state.tasks.every((task) => task.progress === 0)).toBe(true)
    const done = state.tasks
      .flatMap((task) => task.subtasks)
      .find((subtask) => subtask.ref === '1.1')
    expect(done?.progress).toBe(100)
    // Context the domain has no column for survives as description.
    expect(done?.description).toContain('Resources: Cuadrilla A')

    // A hand-made Gantt: the human owns the graph, and no filler is invented.
    expect(state.dependencies).toEqual([])
    expect(state.unresolved_edges).toEqual([])
    expect(
      state.tasks.flatMap((t) => t.subtasks).some((s) => s.system_generated),
    ).toBe(false)
    // Childless phases stay childless in the draft (the mirror-subtask
    // invariant is enforced at go-live, not on drafts).
    expect(state.tasks.some((task) => task.subtasks.length === 0)).toBe(true)
  })

  it('serves the trust outputs verbatim off the immutable contract', () => {
    const state = seedImportReviewStateDTO()
    expect(state.outcome).toBe('parsed')
    expect(state.report).toBe(SEED_SCHEDULE_IMPORT.contract.report)
    expect(state.quality).toBe(SEED_SCHEDULE_IMPORT.contract.quality)
    expect(state.schedule_import?.id).toBe(SEED_SCHEDULE_IMPORT.id)
    expect(state.stats.main_tasks).toBe(state.tasks.length)
    expect(state.stats.edited_tasks).toBe(0)
  })
})
