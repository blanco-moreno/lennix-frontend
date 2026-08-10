import { screen, waitFor } from '@testing-library/react'

import { PATHS } from '@/constants'
import { makeStore } from '@/stores'
import { renderWithProviders } from '@/tests/render-with-providers'
import { SEED_IDS } from '@/tests/seed'

import { usePageCrumbs } from './use-page-crumbs'

/** The hook's output, rendered flat so the trail and title can be asserted. */
function CrumbsProbe() {
  const { trail, title } = usePageCrumbs()
  return (
    <>
      <div data-testid="trail">
        {trail.map((crumb) => crumb.label).join(' > ')}
      </div>
      <div data-testid="title">{title}</div>
    </>
  )
}

describe('usePageCrumbs', () => {
  it('walks Projects → project → Activities on the activity page', async () => {
    renderWithProviders(<CrumbsProbe />, {
      store: makeStore(),
      path: PATHS.TASK_DETAIL,
      route: `/projects/${SEED_IDS.PROJECT_TORRE_ID}/tasks/${SEED_IDS.P1_TASK_FOUNDATION}`,
    })

    await waitFor(() => {
      expect(screen.getByTestId('trail')).toHaveTextContent(
        'Projects > Torre Residencial Norte > Activities',
      )
    })
    expect(screen.getByTestId('title')).toHaveTextContent('Cimentacion')
  })

  it('keeps the project as the deepest crumb on project detail', async () => {
    renderWithProviders(<CrumbsProbe />, {
      store: makeStore(),
      path: PATHS.PROJECT_DETAIL,
      route: `/projects/${SEED_IDS.PROJECT_TORRE_ID}`,
    })

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'Torre Residencial Norte',
      )
    })
    expect(screen.getByTestId('trail')).toHaveTextContent(/^Projects$/)
  })
})
