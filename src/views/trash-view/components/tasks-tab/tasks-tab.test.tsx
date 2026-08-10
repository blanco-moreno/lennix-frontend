/**
 * `trash-view.test.tsx` covers the tasks tab's level naming with view-local
 * rows; this pins the tab against the one task the seed really soft-deletes
 * (the broken-dependency upstream) and the restore request it sends —
 * the view test only ever restores a *project*.
 */

import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import { server } from '@/mocks/server'
import { makeStore } from '@/stores'
import { renderWithProviders } from '@/tests/render-with-providers'
import { SEED_BROKEN_DEPENDENCY, SEED_IDS } from '@/tests/seed'

import { TasksTab } from './tasks-tab'

const upstream = SEED_BROKEN_DEPENDENCY.upstream

function serveTrashedTasks() {
  server.use(
    http.get('*/v1/trash/tasks', () =>
      HttpResponse.json({
        items: [
          {
            id: upstream.id,
            title: upstream.title,
            project_id: upstream.projectId,
            parent_id: upstream.parentId,
            deleted_at: upstream.deletedAt,
            deleted_by: SEED_IDS.USER_MIGUEL_ID,
          },
        ],
        total: 1,
        page: 1,
        page_size: 20,
        total_pages: 1,
      }),
    ),
  )
}

function renderTab() {
  return renderWithProviders(
    <TasksTab
      onPurge={() => undefined}
      canPurge={false}
      page={1}
      onPageChange={() => undefined}
    />,
    { store: makeStore() },
  )
}

describe('TasksTab', () => {
  it('renders the seed-deleted upstream task as a Main activity', async () => {
    serveTrashedTasks()
    renderTab()

    expect(await screen.findByText(upstream.title)).toBeInTheDocument()
    // `parent_id` is null, so it is a Main activity in the S7 vocabulary.
    expect(screen.getByText('Main activity')).toBeInTheDocument()
  })

  it('restores through the task endpoint with the row id', async () => {
    const restored: string[] = []
    serveTrashedTasks()
    server.use(
      http.post('*/v1/trash/tasks/:id/restore', ({ params }) => {
        restored.push(String(params.id))
        return new HttpResponse(null, { status: 204 })
      }),
    )

    renderTab()

    await userEvent.click(
      await screen.findByRole('button', { name: 'Restore' }),
    )

    await waitFor(() => {
      expect(restored).toEqual([SEED_IDS.P1_TASK_BROKEN_UPSTREAM])
    })
  })
})
