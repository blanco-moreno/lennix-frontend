/**
 * Route smoke: `/projects/import` renders the upload canvas. The import flow
 * itself is pinned in `src/components/schedule-import/components/import-upload-canvas/`.
 */

import { screen } from '@testing-library/react'

import { PATHS } from '@/constants'
import { makeStore } from '@/stores'
import { renderWithProviders } from '@/tests/render-with-providers'

import { ProjectImportView } from './project-import-view'

describe('ProjectImportView', () => {
  it('renders the upload canvas on its route', async () => {
    renderWithProviders(<ProjectImportView />, {
      store: makeStore(),
      route: PATHS.PROJECT_IMPORT,
    })

    expect(await screen.findByText('Drop your schedule in')).toBeInTheDocument()
  })
})
