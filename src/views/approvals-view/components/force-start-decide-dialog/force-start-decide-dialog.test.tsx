/**
 * The dialog in isolation — `approvals-view.test.tsx` already walks both
 * decisions end to end, so here it is only what the parent test cannot see:
 * the optional comment travelling as `decision_comment` (typed vs empty → null)
 * and the cancel path leaving the backend untouched.
 */
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import { server } from '@/mocks/server'
import { makeStore } from '@/stores'
import { seedForceStartRequestDTO } from '@/tests/fixtures'
import { renderWithProviders } from '@/tests/render-with-providers'
import { SEED_FORCE_START } from '@/tests/seed'

import { ForceStartDecideDialog } from './force-start-decide-dialog'

/** Not a seed fact: what the approver types into the optional comment box. */
const FIXTURE_COMMENT = 'Structural certificate promised for Friday'

function renderDialog(mode: 'approve' | 'reject', onClose = () => {}) {
  return renderWithProviders(
    <ForceStartDecideDialog
      requestId={SEED_FORCE_START.request.id}
      mode={mode}
      onClose={onClose}
    />,
    { store: makeStore() },
  )
}

function recordDecisions() {
  const decided: { path: string; id: string; comment: unknown }[] = []
  for (const path of ['approve', 'reject'] as const) {
    server.use(
      http.post(
        `*/v1/force-start-requests/:requestId/${path}`,
        async ({ params, request }) => {
          const body = (await request.json()) as {
            decision_comment: string | null
          }
          decided.push({
            path,
            id: String(params.requestId),
            comment: body.decision_comment,
          })
          return HttpResponse.json(
            seedForceStartRequestDTO({
              state: path === 'approve' ? 'approved' : 'rejected',
            }),
          )
        },
      ),
    )
  }
  return decided
}

describe('ForceStartDecideDialog', () => {
  it('approving sends the typed comment as the decision comment and closes', async () => {
    const decided = recordDecisions()
    const onClose = vi.fn()
    renderDialog('approve', onClose)

    const dialog = await screen.findByRole('dialog')
    // The "Comment" label carries no `htmlFor`; the textarea is the dialog's
    // only textbox.
    await userEvent.type(within(dialog).getByRole('textbox'), FIXTURE_COMMENT)
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Approve' }),
    )

    await waitFor(() => {
      expect(decided).toEqual([
        {
          path: 'approve',
          id: SEED_FORCE_START.request.id,
          comment: FIXTURE_COMMENT,
        },
      ])
    })
    expect(onClose).toHaveBeenCalled()
  })

  it('rejecting with the comment left empty sends null, not an empty string', async () => {
    const decided = recordDecisions()
    renderDialog('reject')

    const dialog = await screen.findByRole('dialog')
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Reject' }),
    )

    await waitFor(() => {
      expect(decided).toEqual([
        { path: 'reject', id: SEED_FORCE_START.request.id, comment: null },
      ])
    })
  })

  it('cancelling closes without deciding anything', async () => {
    const decided = recordDecisions()
    const onClose = vi.fn()
    renderDialog('approve', onClose)

    const dialog = await screen.findByRole('dialog')
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Cancel' }),
    )

    await waitFor(() => expect(onClose).toHaveBeenCalled())
    expect(decided).toEqual([])
  })
})
