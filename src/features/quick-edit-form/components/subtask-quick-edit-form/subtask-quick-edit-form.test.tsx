import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import toast from 'react-hot-toast'

import { server } from '@/mocks/server'
import { mapSubtaskDTOToSubtask } from '@/services/task'
import { makeStore } from '@/stores'
import { seedSubtaskDTO } from '@/tests/fixtures'
import { renderWithProviders } from '@/tests/render-with-providers'
import { SEED_IDS } from '@/tests/seed'
import type { Subtask } from '@/types'

import { SubtaskQuickEditForm } from './subtask-quick-edit-form'

/** The seeded excavation subactivity — done, with a real assignee. */
const subtask = mapSubtaskDTOToSubtask(
  seedSubtaskDTO(SEED_IDS.P1_SUB_EXCAVATION),
)

/** Captures the PUT that carries the edited fields. */
function captureUpdates() {
  const puts: Record<string, unknown>[] = []
  server.use(
    http.put('*/v1/tasks/subtasks/:id', async ({ request }) => {
      puts.push((await request.json()) as Record<string, unknown>)
      return HttpResponse.json(seedSubtaskDTO(SEED_IDS.P1_SUB_EXCAVATION))
    }),
  )
  return { puts }
}

function renderModal(
  value: Subtask = subtask,
  onOpenChange: (open: boolean) => void = () => {},
) {
  return renderWithProviders(
    <SubtaskQuickEditForm
      subtask={value}
      projectId={SEED_IDS.PROJECT_TORRE_ID}
      open
      onOpenChange={onOpenChange}
    />,
    { store: makeStore() },
  )
}

describe('SubtaskQuickEditForm', () => {
  it('opens on the subactivity as it is', async () => {
    renderModal()

    expect(await screen.findByLabelText('Title')).toHaveValue(subtask.title)
  })

  it('sends only the field that moved — a title edit carries no assignee or priority', async () => {
    const { puts } = captureUpdates()
    renderModal()

    const title = await screen.findByLabelText('Title')
    await userEvent.clear(title)
    await userEvent.type(title, 'Excavacion fase 2')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => expect(puts).toHaveLength(1))
    expect(puts[0]).toEqual({ title: 'Excavacion fase 2' })
  })

  it('clears the assignee with an explicit null', async () => {
    // The subtask contract spells "nobody" as null (the task-level quick edit
    // spells it '' — see task-quick-edit-form.test.tsx).
    const { puts } = captureUpdates()
    renderModal()

    await userEvent.click(await screen.findByLabelText('Assignee'))
    await userEvent.click(
      await screen.findByRole('option', { name: 'Unassigned' }),
    )
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => expect(puts).toHaveLength(1))
    expect(puts[0].assignee_id).toBeNull()
  })

  it('reports a failure instead of closing', async () => {
    const errorToast = vi.spyOn(toast, 'error')
    const onOpenChange = vi.fn()
    server.use(
      http.put(
        '*/v1/tasks/subtasks/:id',
        () => new HttpResponse(null, { status: 500 }),
      ),
    )
    renderModal(subtask, onOpenChange)

    const title = await screen.findByLabelText('Title')
    await userEvent.clear(title)
    await userEvent.type(title, 'Nueva excavacion')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => expect(errorToast).toHaveBeenCalled())
    expect(errorToast).toHaveBeenCalledWith(
      'Could not update the subactivity',
      expect.anything(),
    )
    expect(onOpenChange).not.toHaveBeenCalledWith(false)
    errorToast.mockRestore()
  })
})
