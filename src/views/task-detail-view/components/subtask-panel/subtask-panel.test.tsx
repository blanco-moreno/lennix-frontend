import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { makeStore } from '@/stores'
import { setUser } from '@/stores/slices/auth-slice'
import { seedTaskListDTO } from '@/tests/fixtures'
import {
  SEARCH_TEST_ID,
  renderWithProviders,
} from '@/tests/render-with-providers'
import { SEED_IDS } from '@/tests/seed'

import { SubtaskPanel } from './subtask-panel'

const TASK_ID = SEED_IDS.P1_TASK_FOUNDATION
const PROJECT_ID = SEED_IDS.PROJECT_TORRE_ID

const seedSubtasks = () =>
  seedTaskListDTO(PROJECT_ID).find((task) => task.id === TASK_ID)!.subtasks

/** Role ids: 1 owner, 99 unmapped (no task.registerProgress). */
function renderPanel(roleId = 1, search = '') {
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
    <SubtaskPanel
      taskId={TASK_ID}
      taskTitle="Main activity"
      projectId={PROJECT_ID}
    />,
    { store, route: `/projects/${PROJECT_ID}${search}` },
  )
}

describe('SubtaskPanel — the listing', () => {
  it('lays the subactivities out as table rows under announced columns', async () => {
    renderPanel()

    const table = await screen.findByRole('table', { name: 'Subactivities' })
    expect(
      within(table).getByRole('columnheader', { name: 'Subactivity' }),
    ).toBeInTheDocument()
    expect(within(table).getAllByTestId('subtask-row')).toHaveLength(
      seedSubtasks().length,
    )
  })

  it('puts the row’s actions on the row itself, with nothing to expand', async () => {
    renderPanel()

    const open = seedSubtasks().find(
      (subtask) => subtask.status !== 'done' && subtask.status !== 'cancelled',
    )!
    await screen.findByText(open.title)

    expect(
      screen.getByRole('button', { name: `Report progress on ${open.title}` }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: `Actions for ${open.title}` }),
    ).toBeInTheDocument()
  })
})

describe('SubtaskPanel — filters', () => {
  it('narrows by text and resets back to the whole list', async () => {
    const user = userEvent.setup()
    renderPanel()

    const all = seedSubtasks()
    await screen.findByRole('table', { name: 'Subactivities' })

    await user.type(
      screen.getByPlaceholderText('Search by name or assignee…'),
      all[0].title,
    )
    await waitFor(() => {
      expect(screen.getAllByTestId('subtask-row')).toHaveLength(1)
    })

    await user.click(screen.getByRole('button', { name: /clear filters/i }))
    expect(screen.getAllByTestId('subtask-row')).toHaveLength(all.length)
  })

  it('says so instead of showing an empty table when nothing matches', async () => {
    const user = userEvent.setup()
    renderPanel()
    await screen.findByRole('table', { name: 'Subactivities' })

    await user.type(
      screen.getByPlaceholderText('Search by name or assignee…'),
      'zzz-nothing-matches',
    )

    expect(
      await screen.findByText('No subactivities match'),
    ).toBeInTheDocument()
    expect(screen.queryByTestId('subtask-row')).not.toBeInTheDocument()
  })

  it('treats ?subtask= as a filter: that row and nothing else', async () => {
    const selected = seedSubtasks()[0]
    renderPanel(1, `?subtask=${selected.id}`)

    await waitFor(() => {
      expect(screen.getAllByTestId('subtask-row')).toHaveLength(1)
    })
    expect(screen.getByText(selected.title)).toBeInTheDocument()
  })

  it('shows the selected subactivity’s name in the search box, so the filter is visible', async () => {
    const selected = seedSubtasks()[0]
    renderPanel(1, `?subtask=${selected.id}`)

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText('Search by name or assignee…'),
      ).toHaveValue(selected.title)
    })
  })

  it('typing in the box drops the id selection and searches as plain text', async () => {
    const user = userEvent.setup()
    const selected = seedSubtasks()[0]
    renderPanel(1, `?subtask=${selected.id}`)
    await waitFor(() => {
      expect(screen.getAllByTestId('subtask-row')).toHaveLength(1)
    })

    const box = screen.getByPlaceholderText('Search by name or assignee…')
    await user.clear(box)

    await waitFor(() => {
      expect(screen.getByTestId(SEARCH_TEST_ID)).not.toHaveTextContent(
        'subtask=',
      )
    })
    // An empty box searches nothing: the whole list is back.
    expect(screen.getAllByTestId('subtask-row')).toHaveLength(
      seedSubtasks().length,
    )
  })

  it('reset clears the ?subtask= selection along with the rest', async () => {
    const user = userEvent.setup()
    const selected = seedSubtasks()[0]
    renderPanel(1, `?subtask=${selected.id}`)
    await waitFor(() => {
      expect(screen.getAllByTestId('subtask-row')).toHaveLength(1)
    })

    await user.click(screen.getByRole('button', { name: /clear filters/i }))

    await waitFor(() => {
      expect(screen.getAllByTestId('subtask-row')).toHaveLength(
        seedSubtasks().length,
      )
    })
    expect(screen.getByTestId(SEARCH_TEST_ID)).not.toHaveTextContent('subtask=')
  })
})

describe('SubtaskPanel — role-scoped access', () => {
  it('lets a role with task.registerProgress reach the per-row progress action', async () => {
    renderPanel(1)

    await waitFor(() => {
      expect(
        screen.getAllByRole('button', { name: /Report progress on/ }).length,
      ).toBeGreaterThan(0)
    })
  })

  it('hides the progress opener from a role without task.registerProgress', async () => {
    // Reporting progress belongs to all four roles on an obra they are on, so
    // the denial case is a role id the frontend cannot resolve.
    renderPanel(99)

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
    })
    expect(
      screen.queryByRole('button', { name: /report progress/i }),
    ).not.toBeInTheDocument()
  })
})
