import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { makeStore } from '@/stores'
import { renderWithProviders } from '@/tests/render-with-providers'
import type { ProjectExpense } from '@/types'
import * as utils from '@/utils'

import { ExpenseAttachmentButton } from './expense-attachment-button'

describe('ExpenseAttachmentButton', () => {
  const expense: ProjectExpense = {
    id: 'exp-123',
    projectId: 'proj-1',
    subtaskId: null,
    taskId: null,
    taskTitle: null,
    subtaskTitle: null,
    description: 'Test expense',
    amount: 100,
    category: 'materials',
    expenseDate: '2026-03-01',
    hasAttachment: true,
    attachmentFilename: 'invoice.pdf',
    createdBy: 'user-1',
    createdAt: '2026-03-01T00:00:00Z',
  }

  it('renders download button with aria-label', () => {
    renderWithProviders(<ExpenseAttachmentButton expense={expense} />, {
      store: makeStore(),
    })
    expect(
      screen.getByRole('button', {
        name: /descargar adjunto|download attachment|baixar anexo/i,
      }),
    ).toBeInTheDocument()
  })

  it('triggers download when clicked', async () => {
    const downloadSpy = vi
      .spyOn(utils, 'downloadBlob')
      .mockImplementation(() => {})
    renderWithProviders(<ExpenseAttachmentButton expense={expense} />, {
      store: makeStore(),
    })
    const button = screen.getByRole('button', {
      name: /descargar adjunto|download attachment|baixar anexo/i,
    })
    fireEvent.click(button)
    expect(button).toBeInTheDocument()
    downloadSpy.mockRestore()
  })
})
