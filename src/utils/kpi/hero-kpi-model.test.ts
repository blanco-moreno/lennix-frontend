import { seedOrganizationDashboardDTO } from '@/tests/fixtures'
import type { OrganizationDashboard, ProjectDashboard } from '@/types'

import { buildPortfolioKpis, buildProjectKpis } from './hero-kpi-model'

const portfolio: OrganizationDashboard = {
  delayedProjects: 2,
  delayedOrBlockedTasks: 4,
  criticalPathSlipDays: 9,
  oldestDraftAgeDays: 3,
  // The KPI model reads the counters, never the rows the same response carries.
  projectsNeedingAttention: [],
}

const project: ProjectDashboard = {
  projectId: 'p1',
  projectName: 'Torre A',
  status: 'delayed',
  priority: 'high',
  overallProgress: 40,
  tasksTotal: 10,
  tasksCompleted: 3,
  tasksInProgress: 2,
  tasksBlocked: 1,
  budget: 100,
  allocated: 50,
  spent: 20,
  remaining: 80,
  isOverBudget: false,
  teamSize: 4,
  startDate: null,
  dueDate: null,
  criticalPathsCount: 1,
  problemsCount: 3,
  health: { level: 'delayed', delayDays: 5, daysOverdue: 0 },
  delayedOrBlockedTasks: 2,
  criticalPathSlipDays: 5,
}

describe('the ONE hero KPI system', () => {
  it('reports schedule signals, not generic PM counters', () => {
    const kpis = buildPortfolioKpis(portfolio)

    expect(kpis.map((kpi) => kpi.id)).toEqual([
      'delayedProjects',
      'criticalPathSlip',
      'atRiskTasks',
      'activationWait',
    ])
    expect(kpis.map((kpi) => kpi.value)).toEqual([2, 9, 4, 3])
    // Budget, team size and completed tasks are not KPIs anywhere.
    expect(JSON.stringify(kpis)).not.toContain('budget')
  })

  it('sends the at-risk number to a drill-down, never a dead end', () => {
    const kpis = buildPortfolioKpis(portfolio)
    const atRisk = kpis.find((kpi) => kpi.id === 'atRiskTasks')

    // The portfolio list tab, with the lens on: `_count_delayed_or_blocked_tasks` counts
    // live *top-level* activities across every project, which is the population
    // that tab enumerates and not the one "assigned to me" holds.
    expect(atRisk?.href).toBe('/tasks?tab=list&risk=at_risk')
  })

  it('leaves the project tile without a destination, on purpose', () => {
    // It is already on the project whose activities the schedule lists a scroll
    // away; a link to a portfolio-wide surface would widen the question.
    const atRisk = buildProjectKpis(project).find(
      (kpi) => kpi.id === 'atRiskTasks',
    )

    expect(atRisk?.href).toBeUndefined()
  })

  it('is the project verdict row: progress, the two shared signals, budget', () => {
    const portfolioIds = buildPortfolioKpis(portfolio).map((kpi) => kpi.id)
    const projectIds = buildProjectKpis(project).map((kpi) => kpi.id)

    // The two schedule signals are the same overview → drill-down pair the
    // portfolio shows; progress and budget-used are the front-page questions
    // ("how far along?", "am I over?") promoted from strip and tab.
    expect(projectIds).toEqual([
      'projectProgress',
      'criticalPathSlip',
      'atRiskTasks',
      'budgetUsed',
    ])
    expect(
      (['criticalPathSlip', 'atRiskTasks'] as const).every((id) =>
        portfolioIds.includes(id),
      ),
    ).toBe(true)
    expect(new Set(projectIds).size).toBe(projectIds.length)
  })

  it('reports budget honestly: a percentage when budgeted, no datum when not', () => {
    const budgeted = buildProjectKpis({
      ...project,
      budget: 200,
      spent: 150,
      isOverBudget: false,
    }).find((kpi) => kpi.id === 'budgetUsed')
    expect(budgeted?.value).toBe(75)
    expect(budgeted?.semantic).toBe('info')

    const over = buildProjectKpis({
      ...project,
      budget: 100,
      spent: 130,
      isOverBudget: true,
    }).find((kpi) => kpi.id === 'budgetUsed')
    expect(over?.value).toBe(130)
    expect(over?.semantic).toBe('critical')

    const unbudgeted = buildProjectKpis({ ...project, budget: null }).find(
      (kpi) => kpi.id === 'budgetUsed',
    )
    expect(unbudgeted?.value).toBeNull()
  })

  it('reads quiet at zero and loud above it (graduated transparency)', () => {
    const calm = buildPortfolioKpis({
      ...portfolio,
      delayedProjects: 0,
      criticalPathSlipDays: 0,
      delayedOrBlockedTasks: 0,
    })

    expect(calm.slice(0, 3).map((kpi) => kpi.semantic)).toEqual([
      'success',
      'success',
      'success',
    ])
    expect(buildPortfolioKpis(portfolio)[0].semantic).toBe('critical')
  })

  it('keeps "nothing waiting" distinct from "waiting zero days"', () => {
    const noDrafts = buildPortfolioKpis({
      ...portfolio,
      oldestDraftAgeDays: null,
    })
    const justImported = buildPortfolioKpis({
      ...portfolio,
      oldestDraftAgeDays: 0,
    })

    expect(noDrafts[3].value).toBeNull()
    expect(justImported[3].value).toBe(0)
  })

  it('renders nothing until the query resolves', () => {
    expect(buildPortfolioKpis(undefined)).toEqual([])
    expect(buildProjectKpis(undefined)).toEqual([])
  })

  it('reads the fields the seeded backend actually returns', () => {
    const dto = seedOrganizationDashboardDTO()

    expect(dto.delayed_projects).toBeTypeOf('number')
    expect(dto.delayed_or_blocked_tasks).toBeTypeOf('number')
    expect(dto.critical_path_slip_days).toBeTypeOf('number')
    // The seed carries a pending draft, so activation *is* waiting.
    expect(dto.oldest_draft_age_days).toBe(0)
  })
})
