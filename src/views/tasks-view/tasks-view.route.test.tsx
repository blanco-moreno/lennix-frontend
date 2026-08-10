/**
 * Route smoke: `/tasks` renders the cross-project activity list. The dashboard
 * itself is pinned in `src/views/tasks-view/`.
 */

import { screen } from '@testing-library/react'

import { PATHS } from '@/constants'
import { makeStore } from '@/stores'
import { renderWithProviders } from '@/tests/render-with-providers'

import { TasksView } from './tasks-view'

describe('TasksView', () => {
  it('renders the activity dashboard on its route', async () => {
    renderWithProviders(<TasksView />, {
      store: makeStore(),
      route: PATHS.TASKS,
    })

    expect(
      await screen.findByText(
        'Every activity of every project in one place. To work on one project, open its schedule.',
      ),
    ).toBeInTheDocument()
  })
})
