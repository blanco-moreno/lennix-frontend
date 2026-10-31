import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import toast from 'react-hot-toast'

import { server } from '@/mocks/server'
import { makeStore } from '@/stores'
import { setUser } from '@/stores/slices/auth-slice'
import { seedIndirectBudgetDTO } from '@/tests/fixtures'
import { renderWithProviders } from '@/tests/render-with-providers'
import { SEED_IDS } from '@/tests/seed'

import { IndirectBudgetPanel } from './indirect-budget-panel'

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}))

const projectId = SEED_IDS.PROJECT_TORRE_ID
const ROLE_ID = { owner: 1, user: 5 } as const

beforeEach(() => {
  vi.mocked(toast.success).mockClear()
  vi.mocked(toast.error).mockClear()
})

function withLines(lines: Parameters<typeof seedIndirectBudgetDTO>[1]) {
  server.use(
    http.get(`*/v1/projects/${projectId}/indirect-budget`, () =>
      HttpResponse.json(seedIndirectBudgetDTO(projectId, lines)),
    ),
  )
}

function render(roleId: number = ROLE_ID.owner) {
  const store = makeStore()
  store.dispatch(
    setUser({
      userId: SEED_IDS.USER_CARLOS_ID,
      email: 'carlos.rodriguez@lennix-test.com',
      firstName: 'Carlos',
      lastName: 'Rodriguez',
      phone: null,
      isActive: true,
      planId: null,
      roleId,
      organizationId: SEED_IDS.ORG_LENNIX_ID,
    }),
  )
  return renderWithProviders(<IndirectBudgetPanel projectId={projectId} />, {
    store,
  })
}

describe('IndirectBudgetPanel', () => {
  it('says so when the project has no overhead lines', async () => {
    render()

    expect(
      await screen.findByText('This project has no overhead lines.'),
    ).toBeInTheDocument()
  })

  it('shows each line with its spend, and flags one over budget', async () => {
    withLines([
      {
        category: 'staff',
        amount: '100000.00',
        spent: '110000.00',
        is_over_budget: true,
      },
      {
        category: 'transport',
        amount: '50000.00',
        spent: '10000.00',
        is_over_budget: false,
      },
    ])
    render()

    const staff = await screen.findByTestId('indirect-line-staff')
    expect(staff).toHaveTextContent('Site staff')
    expect(staff).toHaveTextContent('Over budget')
    expect(screen.getByTestId('indirect-line-transport')).not.toHaveTextContent(
      'Over budget',
    )
    expect(screen.getByTestId('indirect-budget-totals')).toHaveTextContent(
      'Overheads: $150,000.00',
    )
  })

  it('adds a line in a category the project does not have yet', async () => {
    const user = userEvent.setup()
    const bodies: unknown[] = []
    server.use(
      http.put(
        `*/v1/projects/${projectId}/indirect-budget/site_setup`,
        async ({ request }) => {
          bodies.push(await request.json())
          return HttpResponse.json(seedIndirectBudgetDTO(projectId))
        },
      ),
    )
    render()

    await user.click(await screen.findByLabelText('New line'))
    await user.click(await screen.findByText('Site setup'))
    await user.type(screen.getByLabelText('Amount'), '250000')
    await user.click(screen.getByRole('button', { name: 'Add line' }))

    await waitFor(() => expect(bodies).toEqual([{ amount: '250000.00' }]))
    expect(vi.mocked(toast.success)).toHaveBeenCalledWith(
      'Overhead line saved',
      expect.anything(),
    )
  })

  it('says a line that does not fit the budget was refused', async () => {
    const user = userEvent.setup()
    server.use(
      http.put(`*/v1/projects/${projectId}/indirect-budget/general`, () =>
        HttpResponse.json({ detail: 'exceeds' }, { status: 400 }),
      ),
    )
    render()

    await user.click(await screen.findByLabelText('New line'))
    await user.click(await screen.findByText('General overheads'))
    await user.type(screen.getByLabelText('Amount'), '999999999')
    await user.click(screen.getByRole('button', { name: 'Add line' }))

    await waitFor(() =>
      expect(vi.mocked(toast.error)).toHaveBeenCalledWith(
        expect.stringContaining('That amount does not fit'),
        expect.anything(),
      ),
    )
  })

  it('offers only the categories the project has not used', async () => {
    const user = userEvent.setup()
    withLines([
      {
        category: 'staff',
        amount: '1.00',
        spent: '0.00',
        is_over_budget: false,
      },
    ])
    render()

    await screen.findByTestId('indirect-line-staff')
    await user.click(screen.getByLabelText('New line'))

    expect(await screen.findByText('Transport')).toBeInTheDocument()
    expect(screen.getAllByText('Site staff')).toHaveLength(1)
  })

  it('lets a plain user read the lines but never change them', async () => {
    withLines([
      {
        category: 'staff',
        amount: '1.00',
        spent: '0.00',
        is_over_budget: false,
      },
    ])
    render(ROLE_ID.user)

    expect(await screen.findByTestId('indirect-line-staff')).toBeInTheDocument()
    expect(screen.queryByTestId('indirect-budget-add')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Remove Site staff' }),
    ).not.toBeInTheDocument()
  })
})
