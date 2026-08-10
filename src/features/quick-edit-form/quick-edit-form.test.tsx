import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { makeStore } from '@/stores'
import { renderWithProviders } from '@/tests/render-with-providers'

import { QuickEditForm, type QuickEditPatch } from './quick-edit-form'
import { quickEditMessages as m } from './quick-edit-form-messages'

const values = {
  title: 'Pour the slab',
  assigneeId: null,
  priority: 'medium' as const,
}

function renderModal(onSave: (patch: QuickEditPatch) => Promise<unknown>) {
  renderWithProviders(
    <QuickEditForm
      values={values}
      projectId=""
      idPrefix="quick-test"
      titlePlaceholder={m.quickEditTaskTitlePlaceholder}
      successMessage={m.taskUpdateSuccess}
      errorMessage={m.taskUpdateError}
      open
      onOpenChange={() => {}}
      onSave={onSave}
    />,
    { store: makeStore() },
  )
}

describe('QuickEditForm', () => {
  it('sends only the fields that changed', async () => {
    const patches: QuickEditPatch[] = []
    renderModal(async (patch) => {
      patches.push(patch)
    })

    const title = screen.getByLabelText(/title|título/i)
    await userEvent.clear(title)
    await userEvent.type(title, 'Pour the slab, phase 2')
    await userEvent.click(screen.getByRole('button', { name: /save|guardar/i }))

    await waitFor(() => expect(patches).toHaveLength(1))
    expect(patches[0]).toEqual({
      title: 'Pour the slab, phase 2',
      priority: undefined,
    })
  })
})
