import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { makeStore } from '@/stores'
import { renderWithProviders } from '@/tests/render-with-providers'

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
