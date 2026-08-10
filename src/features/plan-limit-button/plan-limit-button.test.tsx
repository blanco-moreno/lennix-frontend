/**
 * The safety net under the whole point of this control.
 *
 * The blocked button must NOT carry the HTML `disabled` attribute: a disabled
 * button fires no pointer events, so its tooltip never opens and the user gets
 * a dead control with no reason. If someone "simplifies" it back to
 * `disabled`, the tooltip test below is the thing that fails.
 */

import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { delay, http, HttpResponse } from 'msw'

import { server } from '@/mocks/server'
import { makeStore } from '@/stores'
import { seedOrganizationUsageDTO } from '@/tests/fixtures'
import { renderWithProviders } from '@/tests/render-with-providers'

import { PlanLimitButton } from './plan-limit-button'

function serveUsage(overrides: Record<string, number | null> = {}) {
  server.use(
    http.get('*/v1/organizations/*/usage', () =>
      HttpResponse.json({ ...seedOrganizationUsageDTO(), ...overrides }),
    ),
  )
}

const AT_DRAFT_CAP = { current_drafts: 25, max_drafts: 25 }

function renderButton(onClick = vi.fn()) {
  renderWithProviders(
    <PlanLimitButton resource="drafts" onClick={onClick}>
      Import schedule
    </PlanLimitButton>,
    { store: makeStore() },
  )
  return onClick
}

describe('PlanLimitButton', () => {
  it('explains the ceiling in a tooltip instead of dying silently', async () => {
    serveUsage(AT_DRAFT_CAP)
    renderButton()

    const button = await screen.findByTestId('plan-limit-blocked')

    // The trap: `disabled` would swallow the hover and the tooltip below
    // would never open.
    expect(button).not.toBeDisabled()
    expect(button).toHaveAttribute('aria-disabled', 'true')

    await userEvent.hover(button)

    await waitFor(() => {
      expect(
        screen.getByText(
          'You reached your plan’s draft limit (25 of 25). Activate or delete a draft, or upgrade your plan.',
        ),
      ).toBeInTheDocument()
    })
  })

  it('names the resource, the numbers and the way out — never just "unavailable"', async () => {
    serveUsage(AT_DRAFT_CAP)
    renderButton()

    const button = await screen.findByTestId('plan-limit-blocked')
    expect(button).toHaveAccessibleName(
      'You reached your plan’s draft limit (25 of 25). Activate or delete a draft, or upgrade your plan.',
    )
  })

  it('swallows the click while blocked', async () => {
    serveUsage(AT_DRAFT_CAP)
    const onClick = renderButton()

    await userEvent.click(await screen.findByTestId('plan-limit-blocked'))

    expect(onClick).not.toHaveBeenCalled()
  })

  it('does not look blocked while usage is still in flight', async () => {
    server.use(
      http.get('*/v1/organizations/*/usage', async () => {
        await delay('infinite')
        return HttpResponse.json(seedOrganizationUsageDTO())
      }),
    )
    const onClick = renderButton()

    // "I don't know yet" is not "you can't": the button works, and it never
    // flickers from blocked to enabled a second later.
    const button = await screen.findByRole('button', {
      name: 'Import schedule',
    })
    expect(button).not.toHaveAttribute('aria-disabled')
    expect(screen.queryByTestId('plan-limit-blocked')).toBeNull()

    await userEvent.click(button)
    expect(onClick).toHaveBeenCalled()
  })

  it('leaves the button alone when the plan has room', async () => {
    serveUsage()
    const onClick = renderButton()

    await userEvent.click(
      await screen.findByRole('button', { name: 'Import schedule' }),
    )

    await waitFor(() => expect(onClick).toHaveBeenCalled())
    expect(screen.queryByTestId('plan-limit-blocked')).toBeNull()
  })

  it('re-enables itself when a slot frees up', async () => {
    serveUsage(AT_DRAFT_CAP)
    const store = makeStore()
    renderWithProviders(
      <PlanLimitButton resource="drafts">Import schedule</PlanLimitButton>,
      { store },
    )

    await screen.findByTestId('plan-limit-blocked')

    // What a draft deletion does: free a slot, then bust `OrgUsage`.
    serveUsage({ current_drafts: 24, max_drafts: 25 })
    store.dispatch({
      type: 'api/invalidateTags',
      payload: [{ type: 'OrgUsage' }],
    })

    await waitFor(() => {
      expect(screen.queryByTestId('plan-limit-blocked')).toBeNull()
    })
  })

  it('never blocks on an unlimited plan, whichever way the backend spells it', async () => {
    // `max_drafts: 0` is the backend's `limit or 0` for "no ceiling".
    serveUsage({ current_drafts: 40, max_drafts: 0 })
    renderButton()

    expect(
      await screen.findByRole('button', { name: 'Import schedule' }),
    ).toBeInTheDocument()
    expect(screen.queryByTestId('plan-limit-blocked')).toBeNull()
  })
})
