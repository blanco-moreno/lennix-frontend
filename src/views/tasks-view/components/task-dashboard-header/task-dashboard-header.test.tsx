import { screen } from '@testing-library/react'

import { renderWithProviders } from '@/tests/render-with-providers'

import { TaskDashboardHeader } from './task-dashboard-header'

describe('TaskDashboardHeader', () => {
  it('titles the surface without offering a create action', () => {
    renderWithProviders(<TaskDashboardHeader />)

    expect(
      screen.getByText(
        'Every activity of every project in one place. To work on one project, open its schedule.',
      ),
    ).toBeInTheDocument()
    // Creating an activity lives in a project's schedule, not here.
    expect(
      screen.queryByRole('button', { name: /activity/i }),
    ).not.toBeInTheDocument()
  })
})
