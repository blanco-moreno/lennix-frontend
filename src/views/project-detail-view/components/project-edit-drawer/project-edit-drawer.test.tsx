import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import toast from 'react-hot-toast'

import { server } from '@/mocks/server'
import { makeStore } from '@/stores'
import { setUser } from '@/stores/slices/auth-slice'
import { seedProjectDTO } from '@/tests/fixtures'
import { renderWithProviders } from '@/tests/render-with-providers'
import { SEED_IDS } from '@/tests/seed'
import type { Project } from '@/types'

import { ProjectEditDrawer } from './project-edit-drawer'

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}))

beforeEach(() => {
  vi.mocked(toast.success).mockClear()
  vi.mocked(toast.error).mockClear()
})

/** Torre, as the detail screen holds it after mapping. */
const project: Project = {
  id: SEED_IDS.PROJECT_TORRE_ID,
  organizationId: SEED_IDS.ORG_LENNIX_ID,
  name: 'Torre Residencial Norte',
  description:
    'Construccion de torre residencial de 25 pisos con 120 apartamentos',
  location: 'Av. Principal 123, Ciudad',
  status: 'on_track',
  priority: 'medium',
  budget: 850000,
  currency: 'USD',
  managerId: SEED_IDS.USER_MIGUEL_ID,
  managerName: 'Miguel Santos',
  isDraft: false,
  progress: 75,
  startDate: '2025-06-01',
  dueDate: '2026-08-01',
  allocated: 580000,
  indirectAllocated: 0,
  spent: 637000,
  isOverBudget: false,
  createdAt: '2025-06-01T00:00:00Z',
  health: { level: 'on_track', delayDays: 0, daysOverdue: 0 },
  reviewStep: null,
}

/** Records every body PUT to the project endpoint. */
function captureUpdates() {
  const bodies: Record<string, unknown>[] = []
  server.use(
    http.put(`*/v1/projects/${project.id}`, async ({ request }) => {
      bodies.push((await request.json()) as Record<string, unknown>)
      return HttpResponse.json(seedProjectDTO(project.id))
    }),
  )
  return bodies
}

/** Records every body PATCHed to the priority endpoint. */
function capturePriorityPatches() {
  const bodies: Record<string, unknown>[] = []
  server.use(
    http.patch(`*/v1/projects/${project.id}/priority`, async ({ request }) => {
      bodies.push((await request.json()) as Record<string, unknown>)
      return HttpResponse.json(seedProjectDTO(project.id))
    }),
  )
  return bodies
}

/** Records every body PATCHed to the budget endpoint. */
function captureBudgetPatches() {
  const bodies: Record<string, unknown>[] = []
  server.use(
    http.patch(`*/v1/projects/${project.id}/budget`, async ({ request }) => {
      bodies.push((await request.json()) as Record<string, unknown>)
      return HttpResponse.json(seedProjectDTO(project.id))
    }),
  )
  return bodies
}

/** Records every POST /v1/budget-approvals body the drawer fires. */
function captureApprovalCreates() {
  const bodies: Record<string, unknown>[] = []
  server.use(
    http.post('*/v1/budget-approvals', async ({ request }) => {
      const body = (await request.json()) as Record<string, unknown>
      bodies.push(body)
      return HttpResponse.json(
        {
          id: 'e1000000-0000-0001-0000-000000000000',
          target_type: 'project',
          target_id: project.id,
          requested_amount: String(body.requested_amount),
          previous_amount: '850000.00',
          reason: String(body.reason),
          state: 'pending',
          requestor_id: SEED_IDS.USER_MIGUEL_ID,
          decided_by: null,
          decided_at: null,
          decision_comment: null,
          state_snapshot: { name: project.name },
          created_at: '2025-06-01T00:00:00Z',
          updated_at: '2025-06-01T00:00:00Z',
        },
        { status: 201 },
      )
    }),
  )
  return bodies
}

const ROLE_ID = { owner: 1, user: 5 } as const

function renderModal(
  roleId: number = ROLE_ID.owner,
  onOpenChange: (open: boolean) => void = () => {},
) {
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
  return renderWithProviders(
    <ProjectEditDrawer project={project} open onOpenChange={onOpenChange} />,
    { store, route: `/projects/${project.id}` },
  )
}

describe('ProjectEditDrawer', () => {
  it('prefills the project general information', async () => {
    renderModal()

    expect(await screen.findByLabelText(/Project name/)).toHaveValue(
      project.name,
    )
    expect(screen.getByLabelText('Description')).toHaveValue(
      project.description,
    )
    expect(screen.getByLabelText('Location')).toHaveValue(project.location)
    // Priority and budget are inline fields now, not separate modals.
    expect(screen.getByText('Medium')).toBeInTheDocument()
    expect(screen.getByLabelText('Budget (USD)')).toBeInTheDocument()
  })

  it('sends no manager_id when the manager was not touched', async () => {
    const bodies = captureUpdates()
    const onOpenChange = vi.fn()
    renderModal(ROLE_ID.owner, onOpenChange)

    const name = await screen.findByLabelText(/Project name/)
    await userEvent.clear(name)
    await userEvent.type(name, 'Torre Norte II')
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }))

    await waitFor(() => expect(bodies).toHaveLength(1))
    // Only a handover the user actually made travels: the API applies
    // `manager_id` whenever it arrives, so re-sending the current manager is
    // noise — the body carries exactly the general-info fields.
    expect(bodies[0]).toEqual({
      name: 'Torre Norte II',
      description: project.description,
      location: project.location,
    })
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('sends manager_id only for a real handover', async () => {
    const bodies = captureUpdates()
    renderModal()

    // Candidates are the project team; Fernando is on Torre's roster.
    await userEvent.click(await screen.findByLabelText('Project manager'))
    await userEvent.click(await screen.findByText('Fernando Lopez'))
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }))

    await waitFor(() => expect(bodies).toHaveLength(1))
    expect(bodies[0]).toEqual({
      name: project.name,
      description: project.description,
      location: project.location,
      manager_id: SEED_IDS.USER_FERNANDO_ID,
    })
  })

  it('refuses an empty name instead of sending it', async () => {
    const bodies = captureUpdates()
    renderModal()

    const name = await screen.findByLabelText(/Project name/)
    await userEvent.clear(name)
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }))

    await waitFor(() => {
      expect(name).toHaveAttribute('aria-invalid', 'true')
    })
    expect(bodies).toHaveLength(0)
  })

  it('leaves untouched priority and budget off the wire', async () => {
    captureUpdates()
    const priorityBodies = capturePriorityPatches()
    const budgetBodies = captureBudgetPatches()
    renderModal()

    await screen.findByLabelText(/Project name/)
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }))

    await waitFor(() => expect(vi.mocked(toast.success)).toHaveBeenCalled())
    expect(priorityBodies).toHaveLength(0)
    expect(budgetBodies).toHaveLength(0)
  })

  it('saves the budget directly for a role with budget.edit.direct', async () => {
    captureUpdates()
    const budgetBodies = captureBudgetPatches()
    const approvalBodies = captureApprovalCreates()
    const onOpenChange = vi.fn()
    renderModal(ROLE_ID.owner, onOpenChange)

    const budget = await screen.findByLabelText('Budget (USD)')
    await userEvent.clear(budget)
    await userEvent.type(budget, '900000')
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }))

    await waitFor(() => expect(budgetBodies).toHaveLength(1))
    expect(budgetBodies[0]).toEqual({ budget: '900000.00' })
    // Direct edit means no approval request was created.
    expect(approvalBodies).toHaveLength(0)
    expect(vi.mocked(toast.success)).toHaveBeenCalledWith(
      'Project updated',
      expect.anything(),
    )
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('shows the request framing to a role with only budget.edit.request', async () => {
    renderModal(ROLE_ID.user)

    // A `user` edits the obra like anyone else on it — the budget is the one
    // field that goes through an approver instead (D-B).
    expect(await screen.findByLabelText(/Project name/)).toBeInTheDocument()
    // The UI says out loud this is a request, not an applied change.
    expect(
      await screen.findByText(/You are requesting a budget change/),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Justification')).toBeInTheDocument()
  })

  it('routes a budget change into the approval flow for a requester', async () => {
    const budgetBodies = captureBudgetPatches()
    const approvalBodies = captureApprovalCreates()
    const onOpenChange = vi.fn()
    renderModal(ROLE_ID.user, onOpenChange)

    const budget = await screen.findByLabelText('Budget (USD)')
    await userEvent.clear(budget)
    await userEvent.type(budget, '900000')
    await userEvent.type(
      screen.getByLabelText('Justification'),
      'Steel prices went up after the Q3 tender.',
    )
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }))

    await waitFor(() => expect(approvalBodies).toHaveLength(1))
    expect(approvalBodies[0]).toEqual({
      target_type: 'project',
      target_id: project.id,
      requested_amount: '900000.00',
      reason: 'Steel prices went up after the Q3 tender.',
    })
    // Nothing touched the budget itself: it waits for the approver. The rest
    // of the form did apply, so the toast says the save was partial.
    expect(budgetBodies).toHaveLength(0)
    expect(vi.mocked(toast.success)).toHaveBeenCalledWith(
      'Changes saved. The budget change was sent for approval and is still pending.',
      expect.anything(),
    )
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('requires a justification before sending an approval request', async () => {
    const approvalBodies = captureApprovalCreates()
    renderModal(ROLE_ID.user)

    const budget = await screen.findByLabelText('Budget (USD)')
    await userEvent.clear(budget)
    await userEvent.type(budget, '900000')
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(
      await screen.findByText('The reason is required'),
    ).toBeInTheDocument()
    expect(approvalBodies).toHaveLength(0)
  })

  it('says the save was partial when fields applied but the budget is pending', async () => {
    const priorityBodies = capturePriorityPatches()
    const approvalBodies = captureApprovalCreates()
    const onOpenChange = vi.fn()
    renderModal(ROLE_ID.user, onOpenChange)

    // The `user` changes both priority (applies immediately) and budget (goes
    // to approval): the toast must not pretend everything was saved.
    await userEvent.click(await screen.findByLabelText('Priority'))
    await userEvent.click(await screen.findByText('High'))
    const budget = screen.getByLabelText('Budget (USD)')
    await userEvent.clear(budget)
    await userEvent.type(budget, '900000')
    await userEvent.type(
      screen.getByLabelText('Justification'),
      'Steel prices went up after the Q3 tender.',
    )
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }))

    await waitFor(() => expect(approvalBodies).toHaveLength(1))
    expect(priorityBodies).toEqual([{ priority: 'high' }])
    expect(vi.mocked(toast.success)).toHaveBeenCalledWith(
      'Changes saved. The budget change was sent for approval and is still pending.',
      expect.anything(),
    )
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('relabels the currency for a role with budget.edit.direct (BUD-10)', async () => {
    const bodies = captureUpdates()
    renderModal(ROLE_ID.owner)

    await userEvent.click(await screen.findByLabelText('Currency'))
    await userEvent.click(await screen.findByText('Chilean peso (CLP)'))
    // The budget field now reads in pesos.
    expect(screen.getByLabelText('Budget (CLP)')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }))

    await waitFor(() => expect(bodies).toHaveLength(1))
    expect(bodies[0]).toEqual({
      name: project.name,
      description: project.description,
      location: project.location,
      currency: 'CLP',
    })
  })

  it('offers no currency to a role that only requests budget changes', async () => {
    renderModal(ROLE_ID.user)

    expect(await screen.findByLabelText(/Project name/)).toBeInTheDocument()
    expect(screen.queryByLabelText('Currency')).not.toBeInTheDocument()
  })
})
