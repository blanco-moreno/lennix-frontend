import { screen, waitFor } from '@testing-library/react'

import { makeStore } from '@/stores'
import { renderWithProviders } from '@/tests/render-with-providers'
import { SEED_IDS } from '@/tests/seed'

import { ProjectBudgetTab } from './project-budget-tab'

const projectId = SEED_IDS.PROJECT_TORRE_ID

describe('ProjectBudgetTab', () => {
  it('orders the three money views budget → cost report → expenses', async () => {
    const { container } = renderWithProviders(
      <ProjectBudgetTab projectId={projectId} />,
      { store: makeStore(), route: `/projects/${projectId}` },
    )

    await waitFor(() => {
      expect(screen.getByText('Budget control')).toBeInTheDocument()
    })

    const headings = Array.from(
      container.querySelectorAll('h1, h2, h3, h4'),
    ).map((node) => node.textContent)

    expect(headings[0]).toBe('Budget control')
    expect(headings).toContain('Cost report')
    expect(headings.indexOf('Budget control')).toBeLessThan(
      headings.indexOf('Cost report'),
    )
  })

  it('states what each level is for instead of stacking three peers', async () => {
    renderWithProviders(<ProjectBudgetTab projectId={projectId} />, {
      store: makeStore(),
      route: `/projects/${projectId}`,
    })

    await waitFor(() => {
      expect(
        screen.getByText(/single place the project budget is set and read/i),
      ).toBeInTheDocument()
    })
    expect(screen.getByText(/where that budget is going/i)).toBeInTheDocument()
    expect(
      screen.getByText(/every expense behind the figures above/i),
    ).toBeInTheDocument()
  })
})
