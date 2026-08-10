/**
 * The UI gate is a COURTESY; this is the enforcement path.
 *
 * With two tabs open the ceiling is reached even though the button looked
 * enabled, so the 400 must still be read, named and said out loud. These pin
 * that: the failure route works with no help from the gate.
 */

import { act, renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import type { ReactNode } from 'react'
import toast from 'react-hot-toast'
import { IntlProvider } from 'react-intl'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router'

import { server } from '@/mocks/server'
import { makeStore } from '@/stores'
import { SEED_IDS } from '@/tests/seed'

import enMessages from '../../../../../lang/en.json'

import { useActivateDraft } from './use-activate-draft'

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}))

beforeEach(() => {
  vi.mocked(toast.success).mockClear()
  vi.mocked(toast.error).mockClear()
})

function wrapper({ children }: { children: ReactNode }) {
  return (
    <Provider store={makeStore()}>
      <IntlProvider locale="en" messages={enMessages}>
        <MemoryRouter>{children}</MemoryRouter>
      </IntlProvider>
    </Provider>
  )
}

function renderActivate() {
  return renderHook(
    () => useActivateDraft({ projectId: SEED_IDS.PROJECT_DRAFT_ID, tasks: [] }),
    { wrapper },
  )
}

describe('useActivateDraft — the server is the enforcer', () => {
  it('reads the structured plan-quota 400 and says it out loud', async () => {
    server.use(
      http.post('*/v1/schedule/review/*/activate', () =>
        HttpResponse.json(
          {
            detail: {
              code: 'plan_project_limit_exceeded',
              limit: 3,
              current: 3,
              message: 'Plan limit exceeded',
            },
          },
          { status: 400 },
        ),
      ),
    )

    const { result } = renderActivate()
    await act(async () => {
      await result.current.activate()
    })

    await waitFor(() => {
      expect(result.current.quotaFailure).toEqual({
        code: 'plan_project_limit_exceeded',
        limit: 3,
        current: 3,
        message: 'Plan limit exceeded',
      })
    })
    // The button sits in the sticky nav; the inline notice alone is too far
    // away to count as feedback.
    expect(toast.error).toHaveBeenCalledWith(
      'Go-live blocked: your plan allows 3 live projects and you have 3.',
      expect.anything(),
    )
    expect(result.current.failed).toBe(false)
  })

  it('falls through to the generic failure for anything else', async () => {
    server.use(
      http.post('*/v1/schedule/review/*/activate', () =>
        HttpResponse.json({ detail: 'boom' }, { status: 500 }),
      ),
    )

    const { result } = renderActivate()
    await act(async () => {
      await result.current.activate()
    })

    await waitFor(() => expect(result.current.failed).toBe(true))
    expect(result.current.quotaFailure).toBeNull()
    expect(toast.error).toHaveBeenCalledWith(
      'Go-live failed. Your draft is safe — try again.',
      expect.anything(),
    )
  })
})
