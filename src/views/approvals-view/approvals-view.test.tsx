import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import { server } from '@/mocks/server'
import { makeStore } from '@/stores'
import { setUser } from '@/stores/slices/auth-slice'
import {
  pageOf,
  seedForceStartRequestDTO,
  seedPendingForceStartRequestDTO,
} from '@/tests/fixtures'
import { renderWithProviders } from '@/tests/render-with-providers'
import { SEED_FORCE_START, SEED_IDS } from '@/tests/seed'

import { ApprovalsView } from './approvals-view'

/** Role ids: 1 owner, 2 admin, 3 manager, 5 user. */
function storeWithRole(
  roleId: number,
  userId: string = SEED_IDS.USER_CARLOS_ID,
) {
  const store = makeStore()
  store.dispatch(
    setUser({
      userId,
      email: 'carlos@lennix.cl',
      firstName: 'Carlos',
      lastName: 'Rodriguez',
      phone: null,
      isActive: true,
      planId: null,
      roleId,
      organizationId: SEED_IDS.ORG_LENNIX_ID,
    }),
  )
  return store
}

function serveNoBudgetApprovals() {
  server.use(
    http.get('*/v1/budget-approvals', () => HttpResponse.json(pageOf([]))),
  )
}

function renderApprovals(
  roleId: number,
  userId?: string,
): ReturnType<typeof renderWithProviders> {
  return renderWithProviders(<ApprovalsView />, {
    store: storeWithRole(roleId, userId),
    route: '/approvals?section=force-start',
  })
}

describe('ApprovalsView', () => {
  it('is one home for both decision types', async () => {
    serveNoBudgetApprovals()
    renderApprovals(1)

    expect(
      await screen.findByText('Decisions someone is waiting on.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /budget/i })).toBeInTheDocument()
    expect(
      screen.getByRole('tab', { name: /force start/i }),
    ).toBeInTheDocument()
  })

  it('opens the budget section from the same home', async () => {
    serveNoBudgetApprovals()
    renderApprovals(1)

    await userEvent.click(await screen.findByRole('tab', { name: /budget/i }))

    // The budget bandeja kept its content; it is a section now, not a screen.
    expect(await screen.findByText('No requests')).toBeInTheDocument()
  })

  it('is the same home in read-only "my requests" mode for a `user`', async () => {
    serveNoBudgetApprovals()
    renderApprovals(5)

    // The heading says whose requests these are — the backend scopes the list
    // to `requestor_id`, so what lands here is already only theirs.
    expect(await screen.findByText('My requests')).toBeInTheDocument()
    expect(
      screen.getByText('What you asked for, and where each request stands.'),
    ).toBeInTheDocument()
    // Both sections, because a `user` asks on both.
    expect(screen.getByRole('tab', { name: /budget/i })).toBeInTheDocument()
    expect(
      screen.getByRole('tab', { name: /force start/i }),
    ).toBeInTheDocument()

    // Watching, not deciding: no actions column and no decision buttons.
    await screen.findByText(SEED_FORCE_START.request.reason)
    expect(screen.queryByRole('button', { name: /approve/i })).toBeNull()
    expect(screen.queryByRole('button', { name: /reject/i })).toBeNull()
  })

  it('shows nothing at all for a role the frontend does not map', async () => {
    serveNoBudgetApprovals()
    renderApprovals(99)

    await screen.findByText('My requests')
    expect(screen.queryByRole('tab', { name: /budget/i })).toBeNull()
    expect(screen.queryByRole('tab', { name: /force start/i })).toBeNull()
  })

  it('shows the requester justification and what the activity looked like', async () => {
    serveNoBudgetApprovals()
    renderApprovals(1)

    expect(
      await screen.findByText(SEED_FORCE_START.request.reason),
    ).toBeInTheDocument()
    expect(screen.getByText(SEED_FORCE_START.forced.title)).toBeInTheDocument()
    expect(screen.getByText(/blocked when requested/i)).toBeInTheDocument()
  })

  it('approves a pending request through the bandeja', async () => {
    serveNoBudgetApprovals()
    const decided: { id: string; comment: unknown }[] = []
    server.use(
      http.post(
        '*/v1/force-start-requests/:requestId/approve',
        async ({ params, request }) => {
          const body = (await request.json()) as {
            decision_comment: string | null
          }
          decided.push({
            id: String(params.requestId),
            comment: body.decision_comment,
          })
          return HttpResponse.json(
            seedForceStartRequestDTO({ state: 'approved' }),
          )
        },
      ),
    )

    renderApprovals(1)

    await userEvent.click(
      await screen.findByRole('button', { name: /^approve$/i }),
    )
    const dialog = await screen.findByRole('dialog')
    // The approver is told what approving does before they do it.
    expect(
      within(dialog).getByText(/marks it at risk permanently/i),
    ).toBeInTheDocument()
    await userEvent.click(
      within(dialog).getByRole('button', { name: /^approve$/i }),
    )

    await waitFor(() => {
      expect(decided).toHaveLength(1)
    })
    expect(decided[0].id).toBe(SEED_FORCE_START.request.id)
  })

  it('rejects without touching the activity', async () => {
    serveNoBudgetApprovals()
    const rejected: string[] = []
    server.use(
      http.post('*/v1/force-start-requests/:requestId/reject', ({ params }) => {
        rejected.push(String(params.requestId))
        return HttpResponse.json(
          seedForceStartRequestDTO({ state: 'rejected' }),
        )
      }),
    )

    renderApprovals(1)

    await userEvent.click(
      await screen.findByRole('button', { name: /^reject$/i }),
    )
    const dialog = await screen.findByRole('dialog')
    expect(
      within(dialog).getByText(/leaves the activity blocked/i),
    ).toBeInTheDocument()
    await userEvent.click(
      within(dialog).getByRole('button', { name: /^reject$/i }),
    )

    await waitFor(() => {
      expect(rejected).toEqual([SEED_FORCE_START.request.id])
    })
  })

  it('lets an approver decide their own request', async () => {
    serveNoBudgetApprovals()
    server.use(
      http.get('*/v1/force-start-requests', () =>
        HttpResponse.json(
          pageOf([
            seedPendingForceStartRequestDTO({
              // The approver IS the requester — self-approval is deliberately not
              // gated out; the permission is the only check.
              requestor_id: SEED_IDS.USER_CARLOS_ID,
            }),
          ]),
        ),
      ),
    )

    renderApprovals(3, SEED_IDS.USER_CARLOS_ID)

    expect(
      await screen.findByRole('button', { name: /^approve$/i }),
    ).toBeInTheDocument()
  })

  it('offers no decision buttons on an already-decided request', async () => {
    serveNoBudgetApprovals()
    server.use(
      http.get('*/v1/force-start-requests', () =>
        HttpResponse.json(pageOf([seedForceStartRequestDTO()])),
      ),
    )

    renderApprovals(1)

    await screen.findByText(SEED_FORCE_START.request.reason)
    expect(screen.queryByRole('button', { name: /^approve$/i })).toBeNull()
    expect(screen.queryByRole('button', { name: /^reject$/i })).toBeNull()
  })
})
