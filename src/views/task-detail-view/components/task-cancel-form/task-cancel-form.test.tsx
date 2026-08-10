import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import { server } from '@/mocks/server'
import { DELAY_REASONS } from '@/schemas'
import { makeStore } from '@/stores'
import { renderWithProviders } from '@/tests/render-with-providers'
import type { TaskStatus } from '@/types'

import { TaskCancelForm } from './task-cancel-form'

/**
 * Captures the status PATCH, so what reaches the wire is assertable.
 *
 * The reply is a whole `TaskResponseDTO` rather than `{}` on purpose: the RTK
 * Query mapper reads `subtasks`, so a stub body makes it throw and the failure
 * arrives as console noise instead of a red test.
 */
function captureStatus() {
  const calls: { body: Record<string, unknown> }[] = []
  server.use(
    http.patch('*/v1/tasks/:id/status', async ({ request, params }) => {
      calls.push({ body: (await request.json()) as Record<string, unknown> })
      return HttpResponse.json({
        id: params.id,
        project_id: 'project-1',
        title: 'Cimentacion',
        description: null,
        status: 'cancelled',
        priority: 'medium',
        budget: null,
        progress: 0,
        start_date: null,
        due_date: null,
        spent: '0.00',
        is_over_budget: false,
        delay_reason: null,
        delay_days: 0,
        is_draft: false,
        is_blocked: false,
        is_critical_path: false,
        assignee_id: null,
        assignee_name: null,
        force_started: false,
        at_risk: false,
        created_at: '2026-07-01T00:00:00Z',
        subtasks: [],
      })
    }),
  )
  return calls
}

function renderModal(currentStatus: TaskStatus) {
  return renderWithProviders(
    <TaskCancelForm
      taskId="task-1"
      taskTitle="Main activity"
      projectName="Torre Norte"
      currentStatus={currentStatus}
      open
      onOpenChange={() => {}}
    />,
    { store: makeStore() },
  )
}

describe('TaskCancelForm', () => {
  it('is not a status picker', async () => {
    // A status Select would fight the rollup: a task's status is derived from
    // its subtasks.
    renderModal('in_progress')

    expect(
      await screen.findByText('Cancel this main activity?'),
    ).toBeInTheDocument()
    expect(screen.queryByLabelText('Status')).toBeNull()
    expect(screen.queryByText('In progress')).toBeNull()
  })

  it('offers the reason as a closed set, not free text', async () => {
    // The live defect this fixes: `delay_reason` is the `DelayReason` enum on
    // the backend, and this was a textarea — anything typed came back 422, so
    // the field only ever worked while left empty.
    renderModal('in_progress')

    expect(
      await screen.findByLabelText('Reason (optional)'),
    ).toBeInTheDocument()
    expect(screen.queryByRole('textbox')).toBeNull()
    // Proof the negative queries in the progress-modal test are meaningful:
    // a Select here IS found by the same query.
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('sends no reason rather than an empty string when none is picked', async () => {
    // '' is not a member of the enum — the backend rejects it exactly like free
    // text. Only `null` means "not specified".
    const calls = captureStatus()
    renderModal('in_progress')

    await userEvent.click(
      await screen.findByRole('button', { name: 'Cancel it' }),
    )

    await waitFor(() => expect(calls).toHaveLength(1))
    expect(calls[0].body).toEqual({ status: 'cancelled', delay_reason: null })
  })

  it('offers reopen instead when the activity is already cancelled', async () => {
    const calls = captureStatus()
    renderModal('cancelled')

    expect(
      await screen.findByText('Reopen this main activity?'),
    ).toBeInTheDocument()
    // Reopening needs no reason, so the Select is not even rendered.
    expect(screen.queryByLabelText('Reason (optional)')).toBeNull()

    await userEvent.click(screen.getByRole('button', { name: 'Reopen' }))

    await waitFor(() => expect(calls).toHaveLength(1))
    // CANCELLED → TODO is the only reopen edge the backend allows, and the
    // reason that explained the cancellation must not survive it.
    expect(calls[0].body).toEqual({ status: 'todo', delay_reason: null })
  })

  it('offers exactly the ten reasons the backend accepts', () => {
    expect(DELAY_REASONS).toHaveLength(10)
    expect(DELAY_REASONS).toContain('weather_conditions')
    expect(DELAY_REASONS).toContain('material_shortage')
  })
})
