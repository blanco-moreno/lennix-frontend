import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'

import { server } from '@/mocks/server'
import { makeStore } from '@/stores'
import { seedIndirectBudgetDTO } from '@/tests/fixtures'
import { renderWithProviders } from '@/tests/render-with-providers'
import { SEED_IDS } from '@/tests/seed'

import { ProjectExpenseCreateModal } from './project-expense-create-modal'

describe('ProjectExpenseCreateModal', () => {
  it('renders modal with required fields when open', () => {
    renderWithProviders(
      <ProjectExpenseCreateModal
        projectId="proj-1"
        open={true}
        onOpenChange={vi.fn()}
      />,
      { store: makeStore() },
    )

    expect(
      screen.getByRole('heading', {
        name: /registrar gasto|register expense/i,
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByLabelText(/descripción|description/i),
    ).toBeInTheDocument()
    expect(screen.getByLabelText(/monto|amount/i)).toBeInTheDocument()
  })
})

describe('ProjectExpenseCreateModal overhead line (BUD-11)', () => {
  it('offers no overhead line when the project has none', async () => {
    renderWithProviders(
      <ProjectExpenseCreateModal
        projectId={SEED_IDS.PROJECT_TORRE_ID}
        open={true}
        onOpenChange={vi.fn()}
      />,
      { store: makeStore() },
    )

    await screen.findByLabelText(/monto|amount/i)
    expect(screen.queryByLabelText('Overhead line')).not.toBeInTheDocument()
  })

  it('offers the project lines when it has some', async () => {
    const projectId = SEED_IDS.PROJECT_TORRE_ID
    server.use(
      http.get(`*/v1/projects/${projectId}/indirect-budget`, () =>
        HttpResponse.json(
          seedIndirectBudgetDTO(projectId, [
            {
              category: 'transport',
              amount: '1.00',
              spent: '0.00',
              is_over_budget: false,
            },
          ]),
        ),
      ),
    )
    renderWithProviders(
      <ProjectExpenseCreateModal
        projectId={projectId}
        open={true}
        onOpenChange={vi.fn()}
      />,
      { store: makeStore() },
    )

    expect(await screen.findByLabelText('Overhead line')).toBeInTheDocument()
  })
})
