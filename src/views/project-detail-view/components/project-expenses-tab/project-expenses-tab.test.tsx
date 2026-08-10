import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import { server } from '@/mocks/server'
import { makeStore } from '@/stores'
import { seedProjectExpenseListDTO } from '@/tests/fixtures'
import { renderWithProviders } from '@/tests/render-with-providers'
import { SEED_IDS } from '@/tests/seed'

import { ProjectExpensesTab } from './project-expenses-tab'

const projectId = SEED_IDS.PROJECT_TORRE_ID

function renderTab() {
  return renderWithProviders(<ProjectExpensesTab projectId={projectId} />, {
    store: makeStore(),
    route: `/projects/${projectId}`,
  })
}

describe('ProjectExpensesTab', () => {
  it('lists the seeded expenses with formatted money and category badges', async () => {
    renderTab()

    const rows = seedProjectExpenseListDTO(projectId)
    expect(
      await screen.findByText('Mano de obra excavacion'),
    ).toBeInTheDocument()
    expect(screen.getByText(`Expenses (${rows.length})`)).toBeInTheDocument()
    // Wire decimals become money on screen…
    expect(screen.getByText('$28,000.00')).toBeInTheDocument()
    // …and category keys become translated badges.
    expect(screen.getAllByText('Labor').length).toBeGreaterThan(0)
    expect(screen.queryByText('labor')).not.toBeInTheDocument()
  })

  it('asks the server for a category, instead of filtering the page', async () => {
    const urls: string[] = []
    server.use(
      http.get('*/v1/expenses/projects/:projectId', ({ request }) => {
        urls.push(request.url)
        const url = new URL(request.url)
        const category = url.searchParams.get('category')
        return HttpResponse.json(
          seedProjectExpenseListDTO(projectId).filter(
            (expense) => category === null || expense.category === category,
          ),
        )
      }),
    )
    renderTab()

    await screen.findByText('Mano de obra excavacion')
    // The initial read carries no category param.
    expect(new URL(urls[0]).searchParams.get('category')).toBeNull()

    // The category select shows "All" until a category is chosen.
    await userEvent.click(screen.getByText('All'))
    await userEvent.click(
      await screen.findByRole('option', { name: 'Equipment' }),
    )

    await waitFor(() => {
      expect(
        urls.some(
          (url) => new URL(url).searchParams.get('category') === 'equipment',
        ),
      ).toBe(true)
    })
    await waitFor(() => {
      expect(screen.queryByText('Mano de obra excavacion')).toBeNull()
    })
    expect(screen.getByText('Alquiler excavadora')).toBeInTheDocument()
  })

  it('narrows to one main activity and resets the subactivity filter with it', async () => {
    renderTab()

    await screen.findByText('Mano de obra excavacion')

    // Narrow the subactivity first…
    await userEvent.click(screen.getByText('All subactivities'))
    await userEvent.click(
      await screen.findByRole('option', {
        name: 'Cimentacion profunda y estructura',
      }),
    )
    await waitFor(() => {
      expect(screen.queryByText('Mano de obra excavacion')).toBeNull()
    })

    // …then switching the main activity resets it rather than keeping a
    // subactivity that no longer belongs to the selection.
    await userEvent.click(screen.getByText('All main activities'))
    await userEvent.click(
      await screen.findByRole('option', { name: 'Estructura' }),
    )

    await waitFor(() => {
      expect(screen.getByText('All subactivities')).toBeInTheDocument()
    })
    expect(screen.queryByText('Mano de obra cimentacion')).toBeNull()
    expect(screen.queryByText('Mano de obra excavacion')).toBeNull()
  })

  it('distinguishes an empty filter result from a load failure', async () => {
    server.use(
      http.get('*/v1/expenses/projects/:projectId', () =>
        HttpResponse.json([]),
      ),
    )
    renderTab()

    expect(
      await screen.findByText('No expenses match the selected filters.'),
    ).toBeInTheDocument()
  })

  it('says the expenses could not be loaded', async () => {
    server.use(
      http.get('*/v1/expenses/projects/:projectId', () =>
        HttpResponse.json({ detail: 'boom' }, { status: 500 }),
      ),
    )
    renderTab()

    expect(
      await screen.findByText('Could not load expenses.'),
    ).toBeInTheDocument()
  })
})
