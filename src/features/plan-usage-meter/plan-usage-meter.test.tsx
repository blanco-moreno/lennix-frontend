/**
 * `drafts-view.test.tsx` covers the meter on its home; these pin what the
 * generalisation added: the other two vocabularies, and the two states where
 * the meter is deliberately absent.
 */

import { screen, waitFor } from '@testing-library/react'
import { delay, http, HttpResponse } from 'msw'

import type { PlanLimitResource } from '@/hooks'
import { server } from '@/mocks/server'
import { makeStore } from '@/stores'
import { seedOrganizationUsageDTO } from '@/tests/fixtures'
import { renderWithProviders } from '@/tests/render-with-providers'

import { PlanUsageMeter } from './plan-usage-meter'

function serveUsage(overrides: Record<string, number | null> = {}) {
  server.use(
    http.get('*/v1/organizations/*/usage', () =>
      HttpResponse.json({ ...seedOrganizationUsageDTO(), ...overrides }),
    ),
  )
}

function renderMeter(resource: PlanLimitResource) {
  renderWithProviders(<PlanUsageMeter resource={resource} />, {
    store: makeStore(),
  })
}

describe('PlanUsageMeter', () => {
  it('reads live projects against the plan cap', async () => {
    serveUsage({ current_projects: 6, max_projects: 10 })
    renderMeter('projects')

    expect(await screen.findByText('Live project slots used')).toBeVisible()
    expect(screen.getByText('6 of 10')).toBeInTheDocument()
    expect(
      screen.getByText('4 projects left before the cap'),
    ).toBeInTheDocument()
  })

  it('reads team seats, and warns at the cap instead of counting headroom', async () => {
    serveUsage({ current_team_size: 15, max_team_size: 15 })
    renderMeter('members')

    expect(await screen.findByText('Team seats used')).toBeVisible()
    expect(screen.getByText('15 of 15')).toBeInTheDocument()
    await waitFor(() => {
      expect(
        screen.getByText(
          'Your plan allows 15 team members. Remove one or upgrade to add another.',
        ),
      ).toBeInTheDocument()
    })
    expect(screen.queryByText(/left before the cap/)).toBeNull()
  })

  it('says "1 seat left" in the singular', async () => {
    serveUsage({ current_team_size: 14, max_team_size: 15 })
    renderMeter('members')

    expect(
      await screen.findByText('1 seat left before the cap'),
    ).toBeInTheDocument()
  })

  it('reads monthly AI requests against the plan cap', async () => {
    serveUsage({ current_ai_requests: 80, max_ai_requests: 100 })
    renderMeter('ai')

    expect(await screen.findByText('Monthly AI requests used')).toBeVisible()
    expect(screen.getByText('80 of 100')).toBeInTheDocument()
    expect(
      screen.getByText('20 AI requests left this month'),
    ).toBeInTheDocument()
  })

  it('warns at the AI cap and points at the plan, not at a slot to free', async () => {
    serveUsage({ current_ai_requests: 100, max_ai_requests: 100 })
    renderMeter('ai')

    expect(
      await screen.findByText(
        'Your plan allows 100 monthly AI requests. Upgrade your plan to perform more AI imports.',
      ),
    ).toBeInTheDocument()
    expect(screen.queryByText(/left this month/)).toBeNull()
  })

  it('reads storage in whole megabytes against the plan cap', async () => {
    serveUsage({ current_storage_mb: 900, max_storage_mb: 1000 })
    renderMeter('storage')

    expect(await screen.findByText('Storage used (MB)')).toBeVisible()
    expect(screen.getByText('900 of 1000')).toBeInTheDocument()
    expect(screen.getByText('100 MB left before the cap')).toBeInTheDocument()
  })

  it('draws nothing on an unlimited plan — a bar that can never fill is worry, not information', async () => {
    serveUsage({ current_projects: 40, max_projects: null })
    renderWithProviders(
      <>
        <PlanUsageMeter resource="projects" />
        <PlanUsageMeter resource="members" />
      </>,
      { store: makeStore() },
    )

    // The members meter appearing proves usage resolved — so the projects
    // meter is absent by decision, not because the fetch had not landed.
    expect(await screen.findByTestId('plan-usage-meter-members')).toBeVisible()
    expect(screen.queryByTestId('plan-usage-meter-projects')).toBeNull()
  })

  it('shows the count and "no limit" for an unlimited resource when asked to', async () => {
    serveUsage({ current_projects: 40, max_projects: null })
    renderWithProviders(<PlanUsageMeter resource="projects" showUnlimited />, {
      store: makeStore(),
    })

    expect(await screen.findByText('Live project slots used')).toBeVisible()
    expect(screen.getByText('40 · No limit')).toBeInTheDocument()
    expect(screen.queryByText(/left before the cap/)).toBeNull()
  })

  it('draws nothing while usage is still in flight', async () => {
    server.use(
      http.get('*/v1/organizations/*/usage', async () => {
        await delay('infinite')
        return HttpResponse.json(seedOrganizationUsageDTO())
      }),
    )
    renderMeter('drafts')

    expect(screen.queryByTestId('plan-usage-meter-drafts')).toBeNull()
  })
})
