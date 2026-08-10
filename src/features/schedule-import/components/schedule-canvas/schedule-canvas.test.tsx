import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { mapScheduleReviewStateDTO } from '@/services/schedule-import'
import { makeStore } from '@/stores'
import { seedImportReviewStateDTO } from '@/tests/fixtures'
import { renderWithProviders } from '@/tests/render-with-providers'
import type { ReviewTask } from '@/types'

import { sortChronologically } from './canvas-model'
import { ScheduleCanvas } from './schedule-canvas'

const seededTasks = (): ReviewTask[] =>
  mapScheduleReviewStateDTO(seedImportReviewStateDTO()).tasks

describe('ScheduleCanvas', () => {
  it('renders the imported schedule the user lands on', () => {
    renderWithProviders(<ScheduleCanvas tasks={seededTasks()} />)

    expect(screen.getByTestId('schedule-canvas')).toBeInTheDocument()
    expect(screen.getByText('OBRAS PRELIMINARES')).toBeInTheDocument()
    expect(screen.getByText('Cierre perimetral')).toBeInTheDocument()
  })

  it('lays the rows out as one listing under one header', () => {
    renderWithProviders(<ScheduleCanvas tasks={seededTasks()} />)

    // Columns under a shared header, the same shape `/tasks` uses — not a
    // card per phase, which stood 200px tall before its first row.
    expect(screen.getByText('Activity')).toBeInTheDocument()
    expect(screen.getByText('Dates')).toBeInTheDocument()
    expect(screen.getByText('Duration')).toBeInTheDocument()
  })

  it('renders phases in chronological order', () => {
    const tasks = seededTasks()
    renderWithProviders(<ScheduleCanvas tasks={tasks} />)

    const expected = sortChronologically(tasks).map((task) => task.title)
    const rendered = screen
      .getAllByTestId('schedule-phase')
      .map((phase) => phase.textContent ?? '')

    expect(rendered).toHaveLength(expected.length)
    expected.forEach((title, index) => {
      expect(rendered[index]).toContain(title)
    })
    // The seeded file starts with the site-preparation section.
    expect(rendered[0]).toContain('OBRAS PRELIMINARES')
  })

  it('opens the first phase only, and folds it away on demand', async () => {
    const tasks = sortChronologically(
      seededTasks().filter((task) => task.subtasks.length > 0),
    )
    renderWithProviders(<ScheduleCanvas tasks={tasks} />)

    const first = tasks[0].subtasks[0].title
    expect(screen.getByText(first)).toBeInTheDocument()
    // Everything after it starts collapsed: twelve open sections is 200 rows
    // before the second heading.
    expect(screen.queryByText(tasks[1].subtasks[0].title)).toBeNull()

    await userEvent.click(
      screen.getByRole('button', { name: /Hide \d+ subactivit/ }),
    )
    expect(screen.queryByText(first)).not.toBeInTheDocument()
  })

  it('says a row is undated instead of inventing a date', () => {
    const tasks = seededTasks()
    tasks[0] = { ...tasks[0], startDate: null, dueDate: null, subtasks: [] }

    renderWithProviders(<ScheduleCanvas tasks={tasks} />)

    expect(screen.getAllByText('No dates').length).toBeGreaterThan(0)
  })

  it('states what a childless phase gets, without asking permission for it', () => {
    const tasks = seededTasks().map((task) => ({ ...task, subtasks: [] }))

    renderWithProviders(<ScheduleCanvas tasks={tasks} />)

    // One quiet line on the open phase, no accept button: ms-bk creates the
    // mirror itself, so there is nothing for the user to consent to.
    expect(
      screen.getByText('Lennix adds one subactivity here when you activate.'),
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /accept/i })).toBeNull()
  })

  it('marks a row the user already edited', () => {
    const tasks = seededTasks()
    tasks[0] = { ...tasks[0], edited: true }

    renderWithProviders(<ScheduleCanvas tasks={tasks} />)

    expect(screen.getAllByText('Edited').length).toBeGreaterThan(0)
  })

  it('opens the edit form under the row it edits, never inside a column', async () => {
    const tasks = [seededTasks()[0]]
    renderWithProviders(<ScheduleCanvas tasks={tasks} projectId="p1" />, {
      store: makeStore(),
    })

    expect(screen.queryByTestId('inline-row-edit')).not.toBeInTheDocument()
    await userEvent.click(
      screen.getByRole('button', { name: `Edit ${tasks[0].title}` }),
    )

    const form = screen.getByTestId('inline-row-edit')
    expect(within(form).getByLabelText('Name')).toBeInTheDocument()
  })

  it('is read-only without a draft to write to', () => {
    renderWithProviders(<ScheduleCanvas tasks={seededTasks()} />)

    expect(screen.queryByRole('button', { name: /^Edit / })).toBeNull()
  })

  it('offers an honest empty state instead of a blank canvas', () => {
    renderWithProviders(<ScheduleCanvas tasks={[]} />)

    expect(screen.getByText('This draft has no rows yet')).toBeInTheDocument()
  })
})
