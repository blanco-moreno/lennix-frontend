import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import { server } from '@/mocks/server'
import { mapScheduleReviewStateDTO } from '@/services/schedule-import'
import { makeStore } from '@/stores'
import { seedImportReviewStateDTO } from '@/tests/fixtures'
import {
  renderWithProviders,
  SEARCH_TEST_ID,
} from '@/tests/render-with-providers'
import { signedInStore } from '@/tests/signed-in-store'
import type { ReviewDependency, ReviewTask } from '@/types'

import { buildReviewScheduleRows } from '../schedule-preview/review-gantt-rows'

import { ScheduleCanvas, type ScheduleCanvasProps } from './schedule-canvas'

const seeded = () => mapScheduleReviewStateDTO(seedImportReviewStateDTO())
const seededTasks = (): ReviewTask[] => seeded().tasks

function renderCanvas(
  props: Partial<ScheduleCanvasProps> = {},
  store = signedInStore(),
) {
  const onOpenRow = vi.fn()
  renderWithProviders(
    <ScheduleCanvas
      projectId={seeded().project.id}
      tasks={seededTasks()}
      dependencies={[]}
      onOpenRow={onOpenRow}
      {...props}
    />,
    { store, route: '/drafts/d/review?step=schedule' },
  )
  return { onOpenRow }
}

/** Main activities with subactivities, in the order the chart paints them. */
const groups = (tasks: ReviewTask[]) => {
  const order = buildReviewScheduleRows(tasks).map((row) => row.id)
  return tasks
    .filter((task) => task.subtasks.length > 0)
    .sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id))
}

const label = (title: string) =>
  screen
    .getAllByTestId('gantt-row-label')
    .find((element) => element.textContent?.startsWith(title))

async function select(title: string) {
  await userEvent.click(label(title)!)
  return screen.findByTestId('schedule-selection')
}

describe('ScheduleCanvas', () => {
  it('draws the draft on the schedule Gantt, claiming nothing the engine owns', () => {
    renderCanvas()

    expect(screen.getByTestId('schedule-gantt')).toBeInTheDocument()
    expect(screen.queryByTestId('gantt-bar-critical')).toBeNull()
    expect(screen.queryByTestId('gantt-dependency-legend')).toBeNull()
  })

  it('opens the first main activity only, and folds it away on demand', async () => {
    const [first, second] = groups(seededTasks())
    renderCanvas()

    expect(label(first.subtasks[0].title)).toBeDefined()
    expect(label(second.subtasks[0].title)).toBeUndefined()

    await userEvent.click(
      screen.getByRole('button', { name: `Collapse “${first.title}”` }),
    )
    expect(label(first.subtasks[0].title)).toBeUndefined()
  })

  it('draws an edge between the rows it links', () => {
    const tasks = seededTasks()
    const [a, b] = groups(tasks)
    const dependencies: ReviewDependency[] = [
      {
        id: 1,
        taskId: b.id,
        dependsOnId: a.id,
        relationshipType: 'FS',
        lagDays: 0,
        source: 'manual',
      },
    ]
    renderCanvas({ tasks, dependencies })

    expect(screen.getAllByTestId('gantt-edge').length).toBeGreaterThan(0)
  })

  it('selects a row into the URL and states it in the panel, with no status', async () => {
    const tasks = seededTasks()
    const [group] = groups(tasks)
    const subtask = { ...group.subtasks[0], edited: true }
    group.subtasks[0] = subtask
    renderCanvas({ tasks })

    const panel = await select(subtask.title)

    expect(screen.getByTestId(SEARCH_TEST_ID)).toHaveTextContent(
      `task=${subtask.id}`,
    )
    expect(panel).toHaveTextContent('Subactivity')
    expect(panel).toHaveTextContent('Edited')
    expect(panel).not.toHaveTextContent('Pending')
    expect(panel).not.toHaveTextContent('Owner')
    expect(panel).toHaveTextContent(`Row ${subtask.source!.row}`)
  })

  it('counts the predecessors the selected row waits on', async () => {
    const tasks = seededTasks()
    const [a, b] = groups(tasks)
    renderCanvas({
      tasks,
      dependencies: [
        {
          id: 1,
          taskId: b.id,
          dependsOnId: a.id,
          relationshipType: 'FS',
          lagDays: 0,
          source: 'manual',
        },
      ],
    })

    const panel = await select(b.title)
    expect(panel).toHaveTextContent('Dependencies1')
  })

  it('edits the selected row, or adds a subactivity under a main activity', async () => {
    const [group] = groups(seededTasks())
    const { onOpenRow } = renderCanvas()

    const panel = await select(group.title)
    await userEvent.click(
      within(panel).getByRole('button', { name: 'Add subactivity' }),
    )
    expect(onOpenRow).toHaveBeenCalledWith({
      mode: 'create-subtask',
      parentId: group.id,
    })

    await userEvent.click(within(panel).getByRole('button', { name: 'Edit' }))
    expect(onOpenRow).toHaveBeenCalledWith({ mode: 'edit', rowId: group.id })
  })

  it('says a main activity’s progress is the file’s until go-live', async () => {
    const [group] = groups(seededTasks())
    renderCanvas()

    expect(await select(group.title)).toHaveTextContent(
      /progress is the file’s until activation/,
    )
  })

  it('says what a childless main activity gets at go-live', async () => {
    const tasks = seededTasks().map((task) => ({ ...task, subtasks: [] }))
    renderCanvas({ tasks })

    expect(await select(tasks[0].title)).toHaveTextContent(
      'No subactivities. Activating creates one with the same name.',
    )
  })

  it('adds a main activity from the toolbar', async () => {
    const { onOpenRow } = renderCanvas()

    await userEvent.click(
      screen.getByRole('button', { name: 'Add main activity' }),
    )

    expect(onOpenRow).toHaveBeenCalledWith({ mode: 'create-task' })
  })

  it('marks a row with an open question and opens its drawer on it', async () => {
    const [group] = groups(seededTasks())
    const { onOpenRow } = renderCanvas({ markedRowIds: new Set([group.id]) })

    expect(
      within(label(group.title)!).getByTestId('gantt-mark-question'),
    ).toBeInTheDocument()

    const panel = await select(group.title)
    await userEvent.click(
      within(panel).getByRole('button', { name: 'Resolve open question' }),
    )

    expect(onOpenRow).toHaveBeenCalledWith({ mode: 'edit', rowId: group.id })
  })

  it('deletes only after the in-app confirmation', async () => {
    const [group] = groups(seededTasks())
    const deleted = vi.fn()
    server.use(
      http.delete('*/v1/tasks/:taskId', ({ params }) => {
        deleted(params.taskId)
        return new HttpResponse(null, { status: 204 })
      }),
    )
    renderCanvas()

    const panel = await select(group.title)
    await userEvent.click(within(panel).getByRole('button', { name: 'Delete' }))
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText(/goes to the trash/)).toBeInTheDocument()
    expect(deleted).not.toHaveBeenCalled()

    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Delete' }),
    )

    await waitFor(() => expect(deleted).toHaveBeenCalledWith(group.id))
  })

  it('refuses to delete the only subactivity a main activity has', async () => {
    const [group] = groups(seededTasks())
    const only = { ...group, subtasks: [group.subtasks[0]] }
    renderCanvas({ tasks: [only] })

    const panel = await select(only.subtasks[0].title)
    await userEvent.click(within(panel).getByRole('button', { name: 'Delete' }))

    const dialog = await screen.findByRole('dialog')
    expect(
      within(dialog).getByText(/only subactivity of its main activity/),
    ).toBeInTheDocument()
    expect(
      within(dialog).getByRole('button', { name: 'Delete' }),
    ).toBeDisabled()
  })

  it('offers no row actions to whoever holds none of the permissions', async () => {
    const [group] = groups(seededTasks())
    renderCanvas({}, makeStore())

    const panel = await select(group.title)
    expect(within(panel).queryByRole('button', { name: 'Edit' })).toBeNull()
    expect(within(panel).queryByRole('button', { name: 'Delete' })).toBeNull()
    expect(
      screen.queryByRole('button', { name: 'Add main activity' }),
    ).toBeNull()
  })
})
