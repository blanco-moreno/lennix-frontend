/**
 * The gaps `approvals-view.test.tsx` leaves: the parent already exercises the
 * seeded pending row, both decisions and the decided-row states through this
 * section, so here it is only the list's own moods — empty, failed, and the
 * state filter actually driving the query.
 */
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import { server } from '@/mocks/server'
import { makeStore } from '@/stores'
import {
  pageOf,
  seedForceStartRequestDTO,
  seedPendingForceStartRequestDTO,
} from '@/tests/fixtures'
import { renderWithProviders } from '@/tests/render-with-providers'

import { ForceStartApprovalsSection } from './force-start-approvals-section'

function renderSection() {
  return renderWithProviders(<ForceStartApprovalsSection />, {
    store: makeStore(),
  })
}

describe('ForceStartApprovalsSection', () => {
  it('shows the empty state when nobody is waiting', async () => {
    server.use(
      http.get('*/v1/force-start-requests', () =>
        HttpResponse.json(pageOf([])),
      ),
    )

    renderSection()

    expect(
      await screen.findByText('No force-start requests'),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'Nobody has asked to start a blocked activity ahead of its dependencies.',
      ),
    ).toBeInTheDocument()
  })

  it('says the list could not be loaded when the request fails', async () => {
    server.use(
      http.get(
        '*/v1/force-start-requests',
        () => new HttpResponse(null, { status: 500 }),
      ),
    )

    renderSection()

    expect(
      await screen.findByText('Force-start requests could not be loaded'),
    ).toBeInTheDocument()
  })

  it('starts on pending and re-queries with the state the filter picks', async () => {
    const states: (string | null)[] = []
    server.use(
      http.get('*/v1/force-start-requests', ({ request }) => {
        const state = new URL(request.url).searchParams.get('state')
        states.push(state)
        return HttpResponse.json(
          pageOf([
            state === 'pending'
              ? seedPendingForceStartRequestDTO()
              : seedForceStartRequestDTO(),
          ]),
        )
      }),
    )

    renderSection()

    // The bandeja defaults to pending — decisions someone is waiting on.
    expect(
      await screen.findByRole('button', { name: 'Approve' }),
    ).toBeInTheDocument()

    await userEvent.click(screen.getByRole('combobox'))
    await userEvent.click(
      await screen.findByRole('option', { name: 'Approved' }),
    )

    await waitFor(() => {
      expect(states).toEqual(['pending', 'approved'])
    })
    // The seed's decided row offers no decision buttons.
    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: 'Approve' }),
      ).not.toBeInTheDocument()
    })
  })
})
