import { screen, waitFor } from '@testing-library/react'

import { makeStore } from '@/stores'
import { renderWithProviders } from '@/tests/render-with-providers'
import { SEED_IDS } from '@/tests/seed'
import type { Project } from '@/types'

import { ProjectSummaryStrip } from './project-summary-strip'

const project: Project = {
  id: SEED_IDS.PROJECT_TORRE_ID,
  organizationId: SEED_IDS.ORG_LENNIX_ID,
  name: 'Torre Residencial Norte',
  description: null,
  location: null,
  status: 'on_track',
  priority: 'high',
  budget: 1_000_000,
  currency: 'USD',
  managerId: null,
  managerName: 'Miguel Hernandez',
  isDraft: false,
  progress: 42,
  startDate: '2026-03-01',
  dueDate: '2026-12-20',
  allocated: 0,
  spent: 0,
  isOverBudget: false,
  createdAt: '2026-03-01T00:00:00Z',
  health: { level: 'on_track', delayDays: 0, daysOverdue: 0 },
  reviewStep: null,
}

describe('ProjectSummaryStrip', () => {
  it('shows the hero KPIs, the overall progress and both dates', async () => {
    renderWithProviders(<ProjectSummaryStrip project={project} />, {
      store: makeStore(),
      route: `/projects/${project.id}`,
    })

    await waitFor(() => {
      expect(screen.getByTestId('hero-kpi-grid')).toBeInTheDocument()
    })

    // Twice by design since the KPI row: the tile label and the bar heading.
    expect(screen.getAllByText('Overall progress').length).toBeGreaterThan(0)
    expect(screen.getByText(/Start date/)).toBeInTheDocument()
    expect(screen.getByText(/Estimated date/)).toBeInTheDocument()
  })

  it('says "no date" instead of an empty slot when a project has none', async () => {
    renderWithProviders(
      <ProjectSummaryStrip
        project={{ ...project, startDate: null, dueDate: null }}
      />,
      { store: makeStore(), route: `/projects/${project.id}` },
    )

    await waitFor(() => {
      expect(screen.getAllByText(/No date/)).toHaveLength(2)
    })
  })

  it('does not render a second copy of the budget panel', () => {
    renderWithProviders(<ProjectSummaryStrip project={project} />, {
      store: makeStore(),
      route: `/projects/${project.id}`,
    })

    // "Total budget" is the Budget tab's heading — the summary must not repeat it.
    expect(screen.queryByText('Total budget')).not.toBeInTheDocument()
  })
})
