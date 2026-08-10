/**
 * Route smoke: `/projects` renders the project *list* with seed data.
 * The dashboard itself is pinned in `src/views/projects-view/`.
 */

import { screen } from '@testing-library/react'

import { PATHS } from '@/constants'
import { makeStore } from '@/stores'
import { seedProject } from '@/tests/fixtures'
import { renderWithProviders } from '@/tests/render-with-providers'
import { SEED_IDS } from '@/tests/seed'

import { ProjectsView } from './projects-view'

describe('ProjectsView', () => {
  it('renders the project list on its route', async () => {
    renderWithProviders(<ProjectsView />, {
      store: makeStore(),
      route: PATHS.PROJECTS,
    })

    expect(
      await screen.findByText('Manage all construction projects'),
    ).toBeInTheDocument()
    expect(
      await screen.findByText(seedProject(SEED_IDS.PROJECT_TORRE_ID).name),
    ).toBeInTheDocument()
  })
})
