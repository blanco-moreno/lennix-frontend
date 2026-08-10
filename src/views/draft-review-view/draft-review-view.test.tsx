import { screen } from '@testing-library/react'

import { PATHS } from '@/constants'
import { makeStore } from '@/stores'
import { seedImportReviewStateDTO } from '@/tests/fixtures'
import { renderWithProviders } from '@/tests/render-with-providers'

import { DraftReviewView } from './draft-review-view'

describe('DraftReviewView', () => {
  it('opens the draft named in the route', async () => {
    const projectId = seedImportReviewStateDTO().project.id

    renderWithProviders(<DraftReviewView />, {
      store: makeStore(),
      path: PATHS.DRAFT_REVIEW,
      route: `/drafts/${projectId}/review`,
    })

    expect(await screen.findByTestId('draft-review-canvas')).toBeInTheDocument()
  })
})
