/**
 * Route smoke: `/projects/:projectId` opens the project named in the route.
 * The detail surface itself is pinned in `src/views/project-detail-view/`.
 */

import { screen } from '@testing-library/react'

import { PATHS } from '@/constants'
import { makeStore } from '@/stores'
import { seedProject } from '@/tests/fixtures'
import { renderWithProviders } from '@/tests/render-with-providers'
import { SEED_IDS } from '@/tests/seed'

import { ProjectDetailView } from './project-detail-view'

describe('ProjectDetailView', () => {
  it('opens the project named in the route', async () => {
    const project = seedProject(SEED_IDS.PROJECT_TORRE_ID)

    renderWithProviders(<ProjectDetailView />, {
      store: makeStore(),
      path: PATHS.PROJECT_DETAIL,
      route: `/projects/${project.id}`,
    })

    expect(
      await screen.findByText(project.description as string),
    ).toBeInTheDocument()
  })
})
