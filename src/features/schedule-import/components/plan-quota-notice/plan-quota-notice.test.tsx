import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { makeStore } from '@/stores'
import {
  LOCATION_TEST_ID,
  renderWithProviders,
} from '@/tests/render-with-providers'

import { PlanQuotaNotice } from './plan-quota-notice'

describe('PlanQuotaNotice', () => {
  it('names the live-project limit instead of failing generically', () => {
    renderWithProviders(
      <PlanQuotaNotice
        failure={{
          code: 'plan_project_limit_exceeded',
          limit: 10,
          current: 10,
          message: 'Plan limit exceeded: maximum 10 projects allowed',
        }}
      />,
      { store: makeStore(), route: '/drafts/x/review' },
    )

    expect(
      screen.getByText('You reached your plan limit: 10 live projects'),
    ).toBeInTheDocument()
    expect(screen.getByText('You are using 10 of 10.')).toBeInTheDocument()
    // The draft is not lost — that reassurance is the point of the copy.
    expect(screen.getByText(/Your draft is safe/)).toBeInTheDocument()
  })

  it('names the draft cap when the upload path hits it', () => {
    renderWithProviders(
      <PlanQuotaNotice
        failure={{
          code: 'plan_draft_limit_exceeded',
          limit: 3,
          current: 3,
          message: 'Plan limit exceeded: maximum 3 pending draft projects',
        }}
      />,
      { store: makeStore(), route: '/projects/import' },
    )

    expect(
      screen.getByText('You reached your plan limit: 3 pending drafts'),
    ).toBeInTheDocument()
  })

  it('offers a way out rather than a dead end', async () => {
    renderWithProviders(
      <PlanQuotaNotice
        failure={{
          code: 'plan_draft_limit_exceeded',
          limit: 3,
          current: 3,
          message: 'Plan limit exceeded',
        }}
      />,
      { store: makeStore(), route: '/projects/import' },
    )

    await userEvent.click(screen.getByRole('button', { name: 'Go to drafts' }))

    expect(screen.getByTestId(LOCATION_TEST_ID)).toHaveTextContent('/drafts')
  })
})
