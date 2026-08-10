/**
 * `trash-view.test.tsx` already walks the projects tab's happy restore path
 * end-to-end, so this covers the branch it does not: a restore the backend
 * refuses. Toasts render through the app-level <Toaster/>, which is not
 * mounted here, so the toast call itself is the observable.
 */

import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import toast from 'react-hot-toast'

import { server } from '@/mocks/server'
import { makeStore } from '@/stores'
import { seedProject } from '@/tests/fixtures'
import { renderWithProviders } from '@/tests/render-with-providers'
import { SEED_IDS } from '@/tests/seed'

import { ProjectsTab } from './projects-tab'

/** Deletion is a runtime event the seed does not stamp for this row. */
const FIXTURE_DELETED_AT = '2026-07-24T12:00:00Z'

function trashedProjectDTO() {
  const project = seedProject(SEED_IDS.PROJECT_TORRE_ID)
  return {
    id: project.id,
    name: project.name,
    organization_id: project.organizationId,
    deleted_at: FIXTURE_DELETED_AT,
    deleted_by: SEED_IDS.USER_CARLOS_ID,
  }
}

describe('ProjectsTab', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('reports a refused restore and keeps the row where it is', async () => {
    const errorToast = vi.spyOn(toast, 'error')
    server.use(
      http.get('*/v1/trash/projects', () =>
        HttpResponse.json({
          items: [trashedProjectDTO()],
          total: 1,
          page: 1,
          page_size: 20,
          total_pages: 1,
        }),
      ),
      http.post('*/v1/trash/projects/:id/restore', () =>
        HttpResponse.json({ detail: 'boom' }, { status: 500 }),
      ),
    )

    renderWithProviders(
      <ProjectsTab
        onPurge={() => undefined}
        canPurge={false}
        page={1}
        onPageChange={() => undefined}
      />,
      { store: makeStore() },
    )

    await userEvent.click(
      await screen.findByRole('button', { name: 'Restore' }),
    )

    await waitFor(() => {
      expect(errorToast).toHaveBeenCalledWith(
        'Could not restore the item',
        expect.anything(),
      )
    })
    // Nothing was restored, so the row must not vanish.
    expect(screen.getByText('Torre Residencial Norte')).toBeInTheDocument()
  })
})
