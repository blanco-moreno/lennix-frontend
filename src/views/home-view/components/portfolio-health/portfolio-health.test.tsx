import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import { server } from '@/mocks/server'
import { makeStore } from '@/stores'
import { seedOrganizationDashboardDTO } from '@/tests/fixtures'
import {
  LOCATION_TEST_ID,
  renderWithProviders,
} from '@/tests/render-with-providers'

import { PortfolioHealth } from './portfolio-health'

/**
 * Pinned, not `new Date()`: the seed's due dates are fixed, so a floating clock
 * would silently change *which* obras this surface is asserting about the day
 * one of them passes. On this date "Torre Residencial Norte" (due 2026-08-01)
 * is not yet overdue, which is what makes it a real absence to assert.
 */
const TODAY = new Date('2026-07-25T00:00:00Z')

function serveRollupAt(today: Date) {
  server.use(
    http.get('*/v1/analytics/organizations/:organizationId/dashboard', () =>
      HttpResponse.json(seedOrganizationDashboardDTO(today)),
    ),
  )
}

/** Every request the surface issues, by path. */
function captureRequests() {
  const paths: string[] = []
  server.events.on('request:start', ({ request }) => {
    paths.push(new URL(request.url).pathname)
  })
  return paths
}

function renderPortfolioHealth() {
  renderWithProviders(<PortfolioHealth />, {
    store: makeStore(),
    route: '/dashboard',
  })
}

describe('PortfolioHealth', () => {
  it('shows the slipping projects with their schedule numbers', async () => {
    serveRollupAt(TODAY)
    renderPortfolioHealth()

    // The seed's delayed obras are the ones needing attention; the healthy ones
    // are not repeated here, and a due date still ahead is not a problem yet.
    await waitFor(() => {
      expect(screen.getByText('Centro Comercial Plaza')).toBeInTheDocument()
    })
    expect(screen.getByText('Complejo Habitacional Sur')).toBeInTheDocument()
    expect(screen.queryByText('Torre Residencial Norte')).toBeNull()
    // …with the schedule numbers the plain project card never showed.
    expect(
      (await screen.findAllByText(/activit(y|ies) at risk/)).length,
    ).toBeGreaterThan(0)
  })

  it('ranks the engine verdict above a date that merely passed', async () => {
    serveRollupAt(TODAY)
    renderPortfolioHealth()

    // "Oficinas Corporativas" is `ahead` with a due date in the past — overdue,
    // so it is listed, but behind both obras the engine itself calls delayed,
    // even though at 90% it is the furthest along of the three.
    //
    // Inside the delayed bucket the least progress comes first: Complejo (25%)
    // before Centro (45%). The furthest from done is the one a slipping date
    // hurts most.
    const rows = await screen.findAllByTestId(/^portfolio-health-row-/)
    const names = rows.map((row) => row.textContent ?? '')

    expect(names[0]).toContain('Complejo Habitacional Sur')
    expect(names[1]).toContain('Centro Comercial Plaza')
    expect(names[2]).toContain('Oficinas Corporativas')
  })

  it('reads one rollup instead of a dashboard per slipping row', async () => {
    const paths = captureRequests()
    serveRollupAt(TODAY)
    renderPortfolioHealth()

    await waitFor(() => {
      expect(screen.getByText('Centro Comercial Plaza')).toBeInTheDocument()
    })

    // The rollup must answer alone — no project-list or per-project dashboard
    // fetches (N+1) allowed.
    expect(paths.filter((path) => /\/v1\/projects\/?$/.test(path))).toEqual([])
    expect(
      paths.filter((path) => /\/v1\/analytics\/projects\//.test(path)),
    ).toEqual([])
    expect(
      paths.filter((path) => /\/v1\/analytics\/organizations\//.test(path)),
    ).toHaveLength(1)
  })

  it('links to the one project-list home instead of duplicating it', async () => {
    serveRollupAt(TODAY)
    renderPortfolioHealth()

    await userEvent.click(await screen.findByText('All projects'))

    expect(screen.getByTestId(LOCATION_TEST_ID)).toHaveTextContent('/projects')
  })

  it('heads its rows with the same columns /projects names', async () => {
    serveRollupAt(TODAY)
    renderPortfolioHealth()

    const table = await screen.findByRole('table')
    const headers = within(table).getAllByRole('columnheader')
    const [firstRow] = within(table)
      .getAllByRole('row')
      .filter((row) => within(row).queryAllByRole('cell').length > 0)

    // One unlabelled leading track, not two: the dashboard does not select,
    // so no checkbox column is reserved.
    expect(headers.map((header) => header.textContent)).toEqual([
      '',
      'Project',
      'Progress',
      'Status',
      'Deadline',
      'Budget',
    ])
    expect(within(firstRow).getAllByRole('cell')).toHaveLength(headers.length)
  })
})
