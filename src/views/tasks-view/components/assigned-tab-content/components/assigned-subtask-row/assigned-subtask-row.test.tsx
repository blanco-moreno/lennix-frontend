import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { mapAssignedSubtaskDTO } from '@/services/task'
import { makeStore } from '@/stores'
import { seedAssignedSubtaskListDTO } from '@/tests/fixtures'
import { displayedDate } from '@/tests/intl-date'
import {
  LOCATION_TEST_ID,
  SEARCH_TEST_ID,
  renderWithProviders,
} from '@/tests/render-with-providers'
import type { AssignedSubtask } from '@/types'
import { formatPercent } from '@/utils'

import { AssignedSubtaskRow } from './assigned-subtask-row'

/** Both levels answer the queue, and the seed carries a row of each. */
const queue = seedAssignedSubtaskListDTO().map(mapAssignedSubtaskDTO)
const underPhase = queue.filter((row) => row.parentId !== null)
const firstLevel = queue.filter((row) => row.parentId === null)

/** A seeded queue row, with the flags forced off so the badge tests own them. */
const base: AssignedSubtask = {
  ...underPhase[0],
  isBlocked: false,
  isCriticalPath: false,
  dueDate: '2026-08-14',
  delayDays: 0,
}

function renderRow(subtask: AssignedSubtask = base) {
  return renderWithProviders(<AssignedSubtaskRow subtask={subtask} />, {
    // A blocked row asks the graph what is holding it, so the row needs a
    // store even when the test is only about badges.
    store: makeStore(),
    route: '/tasks?tab=assigned',
  })
}

describe('AssignedSubtaskRow', () => {
  it('says where the row came from: obra, phase, and the work itself', () => {
    const { container } = renderRow()

    expect(container.querySelector('.lucide-layers')).not.toBeNull()
    expect(screen.getByText(base.projectName)).toBeInTheDocument()
    expect(screen.getByText(String(base.parentTitle))).toBeInTheDocument()
    expect(screen.getByText(base.title)).toBeInTheDocument()
    // Once, not once per layout: the same cell is a column from `lg` and a
    // labelled line below it.
    expect(screen.getAllByText(formatPercent(base.progress)).length).toBe(1)
    expect(screen.getByText(displayedDate('2026-08-14'))).toBeInTheDocument()
  })

  it('raises the blocked and critical badges only when the row is flagged', () => {
    renderRow()
    expect(screen.queryByText('Blocked')).not.toBeInTheDocument()
    expect(screen.queryByText('Critical Path')).not.toBeInTheDocument()
  })

  it('shows both badges on a flagged row', () => {
    renderRow({ ...base, isBlocked: true, isCriticalPath: true })

    expect(screen.getByText('Blocked')).toBeInTheDocument()
    expect(screen.getByText('Critical Path')).toBeInTheDocument()
  })

  it('opens the phase page with the subactivity selected — the row has no address of its own', async () => {
    renderRow()

    await userEvent.click(screen.getByTestId(`assigned-subtask-${base.id}`))

    await waitFor(() => {
      expect(screen.getByTestId(LOCATION_TEST_ID)).toHaveTextContent(
        `/projects/${base.projectId}/tasks/${base.parentId}`,
      )
    })
    expect(screen.getByTestId(SEARCH_TEST_ID)).toHaveTextContent(
      `subtask=${base.id}`,
    )
  })

  it('drops the phase chip on a first-level activity — the obra is its whole context', () => {
    const activity = firstLevel[0]
    const { container } = renderRow(activity)

    expect(screen.getByText(activity.title)).toBeInTheDocument()
    expect(screen.getByText(activity.projectName)).toBeInTheDocument()
    // The chip is gone, not blank: an empty one reads as a missing name.
    expect(container.querySelector('.lucide-layers')).toBeNull()
  })

  it('opens a first-level activity on its own page — it has an address', async () => {
    const activity = firstLevel[0]
    renderRow(activity)

    await userEvent.click(screen.getByTestId(`assigned-subtask-${activity.id}`))

    await waitFor(() => {
      expect(screen.getByTestId(LOCATION_TEST_ID)).toHaveTextContent(
        `/projects/${activity.projectId}/tasks/${activity.id}`,
      )
    })
    expect(screen.getByTestId(SEARCH_TEST_ID)).not.toHaveTextContent('subtask=')
  })

  it('offers neither edit nor a second door — the title is the whole affordance', () => {
    renderRow()

    expect(
      screen.queryByRole('button', { name: `Edit ${base.title}` }),
    ).toBeNull()
    expect(
      screen.queryByRole('button', { name: `View detail of ${base.title}` }),
    ).toBeNull()
  })
})
