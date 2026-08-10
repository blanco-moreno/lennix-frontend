import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import toast from 'react-hot-toast'

import { server } from '@/mocks/server'
import { readSubtaskBlockedFailure } from '@/services/task'
import { makeStore } from '@/stores'
import { DEFAULT_SEED_PROJECT_ID } from '@/tests/fixtures'
import { renderWithProviders } from '@/tests/render-with-providers'
import type { Subtask } from '@/types'

import { SubtaskProgressForm } from './subtask-progress-form'

const subtask = (overrides: Partial<Subtask> = {}): Subtask => ({
  id: 'sub-1',
  parentId: 'task-1',
  title: 'Excavacion',
  description: null,
  status: 'in_progress',
  priority: 'medium',
  progress: 60,
  startDate: null,
  dueDate: null,
  location: null,
  assigneeId: null,
  assigneeName: null,
  spent: 0,
  delayReason: null,
  delayDays: 0,
  isBlocked: false,
  isCriticalPath: false,
  forceStarted: false,
  atRisk: false,
  systemGenerated: false,
  createdAt: '2026-07-01T00:00:00Z',
  ...overrides,
})

/** Captures every PATCH the modal fires, so "what was sent" is assertable. */
function captureProgress() {
  const calls: { url: string; body: unknown }[] = []
  server.use(
    http.patch('*/v1/tasks/subtasks/:id/progress', async ({ request }) => {
      calls.push({ url: request.url, body: await request.json() })
      return HttpResponse.json({})
    }),
    http.patch('*/v1/tasks/subtasks/:id/status', async ({ request }) => {
      calls.push({ url: request.url, body: await request.json() })
      return HttpResponse.json({})
    }),
  )
  return calls
}

function renderModal(s: Subtask) {
  return renderWithProviders(
    <SubtaskProgressForm
      subtask={s}
      projectId={DEFAULT_SEED_PROJECT_ID}
      open
      onOpenChange={() => {}}
    />,
    { store: makeStore() },
  )
}

describe('SubtaskProgressForm', () => {
  it('asks for the percentage, never for a status', async () => {
    // A status Select alongside the slider would let the two contradict each
    // other; the status is a consequence, shown as a sentence, never an input.
    renderModal(subtask())

    expect(await screen.findByText('Progress')).toBeInTheDocument()
    expect(screen.queryByLabelText('Status')).toBeNull()
  })

  it('states what the percentage will make it become', async () => {
    renderModal(subtask({ progress: 100, status: 'done' }))

    // The status is a consequence, shown as a sentence — never an input.
    expect(
      await screen.findByText(/On save it becomes Completed/),
    ).toBeInTheDocument()
  })

  it('sends only the progress, never a status', async () => {
    const calls = captureProgress()
    renderModal(subtask())

    await userEvent.click(await screen.findByRole('button', { name: '75%' }))
    await userEvent.click(screen.getByRole('button', { name: 'Update' }))

    await waitFor(() => expect(calls).toHaveLength(1))
    expect(calls[0].url).toContain('/progress')
    expect(calls[0].body).toEqual({ progress: 75 })
  })

  it('does not tell a healthy report it is behind', async () => {
    // The reason field is always offered so a delay can be flagged proactively,
    // but the "N days behind" notice only appears once the engine derives one.
    renderModal(subtask({ delayDays: 0 }))

    expect(await screen.findByText('Progress')).toBeInTheDocument()
    expect(screen.queryByText(/days late/)).not.toBeInTheDocument()
  })

  it('will not let a report walk the percentage backwards', async () => {
    // Progress is a ratchet on the backend; the quick buttons below the current
    // value are disabled rather than silently rejected.
    renderModal(subtask({ progress: 60 }))

    expect(await screen.findByRole('button', { name: '25%' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '75%' })).toBeEnabled()
  })
})

describe('SubtaskProgressForm — explaining a delay where it is observed', () => {
  const late = (overrides: Partial<Subtask> = {}) =>
    subtask({ delayDays: 4, ...overrides })

  async function pickReason(label: string) {
    await userEvent.click(await screen.findByRole('combobox'))
    await userEvent.click(await screen.findByText(label))
  }

  it('asks for a cause once the engine says it is behind', async () => {
    renderModal(late())

    expect(
      await screen.findByText('This subactivity is 4 days late'),
    ).toBeInTheDocument()
    expect(
      screen.getByLabelText('What is holding it up? (optional)'),
    ).toBeInTheDocument()
  })

  it('sends the cause alongside the percentage, in one report', async () => {
    const calls = captureProgress()
    renderModal(late())

    await userEvent.click(await screen.findByRole('button', { name: '75%' }))
    await pickReason('Weather conditions')
    await userEvent.click(screen.getByRole('button', { name: 'Update' }))

    await waitFor(() => expect(calls).toHaveLength(1))
    expect(calls[0].url).toContain('/progress')
    expect(calls[0].body).toEqual({
      progress: 75,
      delay_reason: 'weather_conditions',
    })
  })

  it('lets the cause be the only thing reported', async () => {
    // Learning *why* is a real update even when the percentage has not moved:
    // the crew is still at 60%, and now we know it is the rain.
    const calls = captureProgress()
    renderModal(late({ progress: 60 }))

    await pickReason('Weather conditions')
    await userEvent.click(screen.getByRole('button', { name: 'Update' }))

    await waitFor(() => expect(calls).toHaveLength(1))
    expect(calls[0].body).toEqual({
      progress: 60,
      delay_reason: 'weather_conditions',
    })
  })

  it('omits the field rather than sending null when no cause is picked', async () => {
    // ms-bk reads absence as "keep what is stored" and an explicit null as
    // "drop it", so a null here would erase a cause somebody already recorded.
    const calls = captureProgress()
    renderModal(late({ delayReason: 'material_shortage' }))

    await userEvent.click(await screen.findByRole('button', { name: '75%' }))
    await userEvent.click(screen.getByRole('button', { name: 'Update' }))

    await waitFor(() => expect(calls).toHaveLength(1))
    expect(calls[0].body).toEqual({ progress: 75 })
  })

  it('opens on the cause already recorded, not on a blank', async () => {
    renderModal(late({ delayReason: 'material_shortage' }))

    expect(await screen.findByText('Material shortage')).toBeInTheDocument()
  })
})

describe('readSubtaskBlockedFailure', () => {
  const blocked = (blockedBy: unknown) => ({
    status: 400,
    data: { detail: { code: 'subtask_blocked', blocked_by: blockedBy } },
  })

  it('reads the predecessors out of the refusal', () => {
    expect(
      readSubtaskBlockedFailure(
        blocked([{ id: 'sub-a', title: 'Excavacion' }]),
      ),
    ).toEqual({ blockedBy: [{ id: 'sub-a', title: 'Excavacion' }] })
  })

  it('accepts a refusal with nobody to name — a broken edge still refuses', () => {
    expect(readSubtaskBlockedFailure(blocked([]))).toEqual({ blockedBy: [] })
  })

  it('falls through for any other failure, so the generic path still runs', () => {
    expect(readSubtaskBlockedFailure(null)).toBeNull()
    expect(readSubtaskBlockedFailure({ status: 500 })).toBeNull()
    expect(
      readSubtaskBlockedFailure({
        status: 400,
        data: { detail: { code: 'assignee_not_project_member' } },
      }),
    ).toBeNull()
  })

  it('ignores malformed entries rather than trusting the shape', () => {
    expect(
      readSubtaskBlockedFailure(blocked([{ id: 'sub-a' }, 'nope', null])),
    ).toEqual({ blockedBy: [] })
  })
})

describe('SubtaskProgressForm — the blocked refusal', () => {
  // Toasts render through the app-level <Toaster/>, which isn't mounted here.
  const errorToast = vi.spyOn(toast, 'error')

  afterEach(() => errorToast.mockClear())

  it('names what is holding it instead of "could not update"', async () => {
    // The modal is not offered for a blocked subactivity, so this is the race:
    // somebody else re-blocked it between opening and saving. The refusal must
    // be named, never swallowed.
    server.use(
      http.patch('*/v1/tasks/subtasks/:id/progress', () =>
        HttpResponse.json(
          {
            detail: {
              code: 'subtask_blocked',
              message: 'Cannot update progress ...',
              blocked_by: [{ id: 'sub-a', title: 'Excavacion' }],
            },
          },
          { status: 400 },
        ),
      ),
    )
    renderModal(subtask())

    await userEvent.click(await screen.findByRole('button', { name: '75%' }))
    await userEvent.click(screen.getByRole('button', { name: 'Update' }))

    await waitFor(() => expect(errorToast).toHaveBeenCalled())
    expect(errorToast).toHaveBeenCalledWith(
      'Waiting on Excavacion to finish.',
      expect.anything(),
    )
  })

  it('still says something when the block has no predecessor to name', async () => {
    server.use(
      http.patch('*/v1/tasks/subtasks/:id/progress', () =>
        HttpResponse.json(
          { detail: { code: 'subtask_blocked', blocked_by: [] } },
          { status: 400 },
        ),
      ),
    )
    renderModal(subtask())

    await userEvent.click(await screen.findByRole('button', { name: '75%' }))
    await userEvent.click(screen.getByRole('button', { name: 'Update' }))

    await waitFor(() => expect(errorToast).toHaveBeenCalled())
    expect(errorToast).toHaveBeenCalledWith(
      'Waiting on a dependency that no longer exists. Re-link it to continue.',
      expect.anything(),
    )
  })

  it('keeps the generic message for a failure it does not recognise', async () => {
    server.use(
      http.patch('*/v1/tasks/subtasks/:id/progress', () =>
        HttpResponse.json({ detail: 'boom' }, { status: 500 }),
      ),
    )
    renderModal(subtask())

    await userEvent.click(await screen.findByRole('button', { name: '75%' }))
    await userEvent.click(screen.getByRole('button', { name: 'Update' }))

    await waitFor(() => expect(errorToast).toHaveBeenCalled())
    expect(errorToast).toHaveBeenCalledWith(
      'Could not update progress',
      expect.anything(),
    )
  })
})
