import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import { server } from '@/mocks/server'
import { makeStore } from '@/stores'
import { setUser } from '@/stores/slices/auth-slice'
import { seedProjectListDTO } from '@/tests/fixtures'
import {
  LOCATION_TEST_ID,
  renderWithProviders,
} from '@/tests/render-with-providers'
import { SEED_IDS } from '@/tests/seed'

import { DraftsView } from './drafts-view'

function renderDraftsHome() {
  return renderWithProviders(<DraftsView />, {
    store: makeStore(),
    route: '/drafts',
  })
}

/**
 * The same home, signed in as a given system role. Discarding drafts is
 * `project.delete` (owner/admin), which the gate reads off the profile — a
 * logged-out store simply hides the bulk controls.
 */
function renderDraftsHomeAs(roleId: number) {
  const store = makeStore()
  store.dispatch(
    setUser({
      userId: SEED_IDS.USER_CARLOS_ID,
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
  return renderWithProviders(<DraftsView />, { store, route: '/drafts' })
}

describe('DraftsView', () => {
  it('is the one place drafts live, with the plan cap on the same screen', async () => {
    renderDraftsHome()

    expect(
      await screen.findByText('Ampliacion Bodega Logistica (Borrador)'),
    ).toBeInTheDocument()
    // The cap is legible before an import fails on it.
    expect(
      await screen.findByTestId('plan-usage-meter-drafts'),
    ).toBeInTheDocument()
    expect(screen.getByText('3 of 25')).toBeInTheDocument()
  })

  it('opens a draft on its resumable review canvas, never project-detail', async () => {
    renderDraftsHome()

    await userEvent.click(
      await screen.findByText('Ampliacion Bodega Logistica (Borrador)'),
    )

    expect(screen.getByTestId(LOCATION_TEST_ID)).toHaveTextContent(
      `/drafts/${SEED_IDS.PROJECT_DRAFT_ID}/review`,
    )
  })

  it('confirms before discarding, instead of a browser dialog', async () => {
    renderDraftsHomeAs(1)

    await screen.findByText('Ampliacion Bodega Logistica (Borrador)')
    await userEvent.click(screen.getByTestId('select-all-drafts'))
    await userEvent.click(screen.getByText('Delete selected'))

    expect(
      await screen.findByText('Discard the selected drafts?'),
    ).toBeInTheDocument()

    // Leave the dialog closed: an open Chakra dialog keeps its portal (and the
    // body lock) around after unmount, which would leak into the next test.
    await userEvent.click(screen.getByText('Keep them'))
  })

  it('discards the selected drafts through the confirmation', async () => {
    const discarded: string[][] = []
    server.use(
      http.post('*/v1/projects/bulk-delete', async ({ request }) => {
        const body = (await request.json()) as { project_ids: string[] }
        discarded.push(body.project_ids)
        return new HttpResponse(null, { status: 204 })
      }),
    )

    renderDraftsHomeAs(1)

    await screen.findByText('Ampliacion Bodega Logistica (Borrador)')
    await userEvent.click(screen.getByTestId('select-all-drafts'))
    await userEvent.click(screen.getByText('Delete selected'))
    await userEvent.click(await screen.findByText('Discard'))

    await waitFor(() => {
      // Select-all takes every draft the seed carries, not just the first.
      expect(discarded).toHaveLength(1)
      expect(discarded[0]).toContain(SEED_IDS.PROJECT_DRAFT_ID)
      expect(discarded[0]).toHaveLength(3)
    })
  })

  it('lets a draft be picked and un-picked one by one', async () => {
    renderDraftsHomeAs(1)

    await screen.findByText('Ampliacion Bodega Logistica (Borrador)')
    const [, cardCheckbox] = screen.getAllByRole('checkbox')

    await userEvent.click(cardCheckbox)
    expect(await screen.findByText('1 selected')).toBeInTheDocument()

    await userEvent.click(cardCheckbox)
    await waitFor(() => {
      expect(screen.queryByText('1 selected')).toBeNull()
    })
  })

  it('starts a new import from where the drafts are', async () => {
    // The CTA is gated by `project.create`, which reads the role off the auth
    // slice — a logged-out store would simply hide the button.
    renderDraftsHomeAs(1)

    await userEvent.click(await screen.findByText('Import schedule'))

    expect(screen.getByTestId(LOCATION_TEST_ID)).toHaveTextContent(
      '/projects/import',
    )
  })

  // The view is `project.create`, which includes the manager; discarding is
  // `project.delete`, which does not. Offering it here is offering a 403.
  it('offers a manager no way to discard, and nothing to select for it', async () => {
    renderDraftsHomeAs(3)

    await screen.findByText('Ampliacion Bodega Logistica (Borrador)')
    expect(screen.queryByText('Delete selected')).toBeNull()
    expect(screen.queryByTestId('select-all-drafts')).toBeNull()
    expect(screen.queryAllByRole('checkbox')).toEqual([])
  })

  it('invites an import when nothing is waiting', async () => {
    server.use(
      http.get('*/v1/projects*', () =>
        HttpResponse.json({
          items: [],
          total: 0,
          page: 1,
          page_size: 12,
          total_pages: 0,
        }),
      ),
    )

    renderDraftsHome()

    await waitFor(() => {
      expect(screen.getByText('No drafts waiting')).toBeInTheDocument()
    })
  })

  it('never shows a live project — that list has its own home', async () => {
    renderDraftsHome()

    await screen.findByText('Ampliacion Bodega Logistica (Borrador)')
    const live = seedProjectListDTO().find((project) => !project.is_draft)
    expect(screen.queryByText(live?.name ?? '')).toBeNull()
  })

  it('warns before the import path fails when the cap is full', async () => {
    server.use(
      http.get('*/v1/organizations/*/usage', () =>
        HttpResponse.json({
          organization_id: SEED_IDS.ORG_LENNIX_ID,
          current_team_size: 1,
          max_team_size: 15,
          current_projects: 6,
          max_projects: 10,
          current_drafts: 25,
          max_drafts: 25,
        }),
      ),
    )

    renderDraftsHome()

    await waitFor(() => {
      expect(
        screen.getByText(/Your plan allows 25 pending drafts/),
      ).toBeInTheDocument()
    })
  })
})
