import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'

import { server } from '@/mocks/server'
import { makeStore } from '@/stores'
import {
  FIXTURE_CREATED_AT,
  pageOf,
  requiredDecimal,
  seedProject,
} from '@/tests/fixtures'
import { renderWithProviders } from '@/tests/render-with-providers'
import { SEED_IDS } from '@/tests/seed'
import type { BudgetApprovalResponseDTO } from '@/types/dto/budget-approval-dto'
import { formatMoney } from '@/utils'

import { BudgetApprovals } from './budget-approvals'

/**
 * Budget-approval requests are not part of the seed (the demo carries none),
 * so the request row is a fixture concern — but its target, amounts and
 * requestor all resolve through the seeded Torre project.
 */
const FIXTURE_REQUEST_ID = 'e1000000-0000-0001-0000-000000000000'
const FIXTURE_REQUESTED_AMOUNT = '900000.00'
const FIXTURE_REASON = 'Steel prices went up after the Q3 tender.'

function approvalDTO(
  overrides: Partial<BudgetApprovalResponseDTO> = {},
): BudgetApprovalResponseDTO {
  const project = seedProject(SEED_IDS.PROJECT_TORRE_ID)
  return {
    id: FIXTURE_REQUEST_ID,
    target_type: 'project',
    target_id: project.id,
    requested_amount: FIXTURE_REQUESTED_AMOUNT,
    previous_amount: requiredDecimal(project.budget),
    reason: FIXTURE_REASON,
    state: 'pending',
    requestor_id: SEED_IDS.USER_MIGUEL_ID,
    decided_by: null,
    decided_at: null,
    decision_comment: null,
    state_snapshot: { name: project.name },
    created_at: FIXTURE_CREATED_AT,
    updated_at: FIXTURE_CREATED_AT,
    ...overrides,
  }
}

function serveApprovals(rows: BudgetApprovalResponseDTO[]) {
  server.use(
    http.get('*/v1/budget-approvals', () => HttpResponse.json(pageOf(rows))),
  )
}

function renderSection() {
  return renderWithProviders(<BudgetApprovals />, {
    store: makeStore(),
  })
}

describe('BudgetApprovals', () => {
  it('renders a pending request with its target, amounts, delta and reason', async () => {
    const row = approvalDTO()
    serveApprovals([row])
    renderSection()

    const project = seedProject(SEED_IDS.PROJECT_TORRE_ID)
    expect(await screen.findByText(project.name)).toBeInTheDocument()
    expect(screen.getByText('Project')).toBeInTheDocument()
    // The amounts render twice — the column at `lg` and the inline line the
    // narrow steps read instead — and jsdom resolves no media query.
    expect(
      screen.getAllByText(formatMoney(row.previous_amount)).length,
    ).toBeGreaterThan(0)
    expect(
      screen.getByText(formatMoney(row.requested_amount)),
    ).toBeInTheDocument()
    // 850,000 seeded → 900,000 requested reads as an explicit signed delta.
    const delta = Number(row.requested_amount) - Number(row.previous_amount)
    expect(delta).toBeGreaterThan(0)
    expect(
      screen.getAllByText(`+${formatMoney(delta)}`).length,
    ).toBeGreaterThan(0)
    expect(screen.getByText(FIXTURE_REASON)).toBeInTheDocument()
  })

  it('offers decide controls only while the request is pending', async () => {
    serveApprovals([approvalDTO()])
    renderSection()

    expect(
      await screen.findByRole('button', { name: /approve/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reject/i })).toBeInTheDocument()
  })

  it('shows a decided request read-only, with the approver comment', async () => {
    serveApprovals([
      approvalDTO({
        state: 'approved',
        decided_by: SEED_IDS.USER_CARLOS_ID,
        decided_at: FIXTURE_CREATED_AT,
        decision_comment: 'Within the revised portfolio ceiling.',
      }),
    ])
    renderSection()

    expect(await screen.findByText('Approved')).toBeInTheDocument()
    expect(
      screen.getByText(/Within the revised portfolio ceiling\./),
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /approve/i })).toBeNull()
    expect(screen.queryByRole('button', { name: /reject/i })).toBeNull()
  })

  it('says "No requests" when nothing matches the filter', async () => {
    serveApprovals([])
    renderSection()

    await waitFor(() => {
      expect(screen.getByText('No requests')).toBeInTheDocument()
    })
  })
})
