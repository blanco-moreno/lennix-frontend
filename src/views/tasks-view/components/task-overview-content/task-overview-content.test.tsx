import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { mapTaskDTOToTask } from '@/services/task'
import { makeStore } from '@/stores'
import { seedProject, seedTaskListDTO } from '@/tests/fixtures'
import {
  LOCATION_TEST_ID,
  SEARCH_TEST_ID,
  renderWithProviders,
} from '@/tests/render-with-providers'
import { SEED_IDS } from '@/tests/seed'

import { TaskOverviewContent } from './task-overview-content'

/** One page holding rows of two different obras, as the server returns them. */
const torreTask = mapTaskDTOToTask(
  seedTaskListDTO(SEED_IDS.PROJECT_TORRE_ID)[0],
)
const centroTask = mapTaskDTOToTask(
  seedTaskListDTO(SEED_IDS.PROJECT_CENTRO_ID)[0],
)

function renderContent(tasks = [torreTask, centroTask]) {
  return renderWithProviders(<TaskOverviewContent tasks={tasks} />, {
    store: makeStore(),
    route: '/tasks',
  })
}

describe('TaskOverviewContent', () => {
  it('groups the page by obra, naming each group from its own rows', () => {
    renderContent()

    expect(
      screen.getByText(seedProject(SEED_IDS.PROJECT_TORRE_ID).name),
    ).toBeInTheDocument()
    expect(
      screen.getByText(seedProject(SEED_IDS.PROJECT_CENTRO_ID).name),
    ).toBeInTheDocument()
    expect(screen.getByText(torreTask.title)).toBeInTheDocument()
    expect(screen.getByText(centroTask.title)).toBeInTheDocument()
  })

  it('heads the table with one column header per cell an activity row lays out', () => {
    renderContent([torreTask])

    // The header and the row read the same grid template, so a mismatch here
    // is a column that drew in one place and not the other.
    const headers = screen.getAllByRole('columnheader')
    const taskRow = screen
      .getAllByRole('row')
      .find((row) => row.textContent?.includes(torreTask.title))
    expect(taskRow).toBeDefined()
    expect(within(taskRow!).getAllByRole('cell')).toHaveLength(headers.length)
  })

  it('opens the activity from its own title, with no actions column', async () => {
    renderContent([torreTask])

    expect(
      screen.queryByRole('columnheader', { name: 'Actions' }),
    ).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: torreTask.title }))

    await waitFor(() => {
      expect(screen.getByTestId(LOCATION_TEST_ID)).toHaveTextContent(
        `/projects/${SEED_IDS.PROJECT_TORRE_ID}/tasks/${torreTask.id}`,
      )
    })
  })

  it("sends the group heading into the obra's own schedule", async () => {
    renderContent([torreTask])

    await userEvent.click(screen.getByRole('button', { name: /Open schedule/ }))

    await waitFor(() => {
      expect(screen.getByTestId(LOCATION_TEST_ID)).toHaveTextContent(
        `/projects/${SEED_IDS.PROJECT_TORRE_ID}`,
      )
    })
    expect(screen.getByTestId(SEARCH_TEST_ID)).toHaveTextContent('tab=schedule')
  })
})
