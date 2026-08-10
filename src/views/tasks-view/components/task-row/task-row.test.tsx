import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { buildTaskDetailPath } from '@/router'
import { mapTaskDTOToTask } from '@/services/task'
import { makeStore } from '@/stores'
import {
  DEFAULT_SEED_PROJECT_ID,
  seedBrokenDependentTaskDTO,
  seedForceStartedTaskDTO,
  seedTaskListDTO,
} from '@/tests/fixtures'
import {
  LOCATION_TEST_ID,
  renderWithProviders,
} from '@/tests/render-with-providers'
import { SEED_ORGANIZATION, SEED_USERS } from '@/tests/seed'
import type { Task } from '@/types'
import { formatPercent } from '@/utils'

import { TaskRow } from './task-row'

/** P1's first phase — Cimentacion, with its seeded subactivities. */
function seedPhase(): Task {
  return mapTaskDTOToTask(seedTaskListDTO(DEFAULT_SEED_PROJECT_ID)[0])
}

/**
 * Tokenless on purpose: `getMe` stays skipped, so the MSW `/v1/auth/me`
 * handler (always Carlos, owner) cannot shadow the role under test.
 */
function storeWithRole(roleId: number) {
  const seed = SEED_USERS.find((user) => user.roleId === roleId)
  if (!seed) throw new Error(`no seeded user carries roleId ${roleId}`)
  return makeStore({
    auth: {
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      user: {
        userId: seed.userId,
        email: seed.email,
        firstName: seed.firstName,
        lastName: seed.lastName,
        phone: null,
        isActive: true,
        planId: SEED_ORGANIZATION.planId,
        roleId: seed.roleId,
        organizationId: SEED_ORGANIZATION.id,
      },
    },
  })
}

function renderRow(task: Task, store = makeStore()) {
  return renderWithProviders(<TaskRow task={task} />, {
    store,
    route: '/tasks',
  })
}

describe('TaskRow', () => {
  it('puts the whole activity on one row: name, avance, responsable, fecha', () => {
    const task = seedPhase()
    renderRow(task)

    expect(screen.getByText(task.title)).toBeInTheDocument()
    // Once, not once per layout: the same cell is a column from `lg` and a
    // labelled line below it. The money lives in the drawer.
    expect(screen.getAllByText(formatPercent(task.progress)).length).toBe(1)
    expect(screen.queryByText(/Spent \//)).toBeNull()
  })

  it('expands its subactivities from the row, not from a card', async () => {
    const task = seedPhase()
    renderRow(task)

    const firstSubtask = task.subtasks[0]
    expect(screen.queryByText(firstSubtask.title)).toBeNull()

    // The chevron says how many rows it is about to open.
    const expand = screen.getByRole('button', {
      name: `Show ${task.subtasks.length} subactivities`,
    })
    expect(expand).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(expand)

    for (const subtask of task.subtasks) {
      expect(screen.getByText(subtask.title)).toBeInTheDocument()
    }
    expect(
      screen.getByRole('button', {
        name: `Hide ${task.subtasks.length} subactivities`,
      }),
    ).toHaveAttribute('aria-expanded', 'true')
  })

  it('offers no chevron for a phase with nothing under it', () => {
    renderRow({ ...seedPhase(), subtasks: [] })

    expect(screen.queryByRole('button', { name: /subactivities/ })).toBeNull()
  })

  it('badges the blocked dependent of a broken dependency', () => {
    renderRow(mapTaskDTOToTask(seedBrokenDependentTaskDTO()))

    expect(screen.getByText('Blocked')).toBeInTheDocument()
  })

  it('does not call a force-started activity blocked — it carries At risk instead', () => {
    renderRow(mapTaskDTOToTask(seedForceStartedTaskDTO()))

    expect(screen.queryByText('Blocked')).toBeNull()
    expect(screen.getByText('At risk')).toBeInTheDocument()
  })

  it('opens the activity page, inside its project, from the name itself', async () => {
    const task = seedPhase()
    renderRow(task)

    await userEvent.click(screen.getByText(task.title))

    await waitFor(() => {
      expect(screen.getByTestId(LOCATION_TEST_ID)).toHaveTextContent(
        buildTaskDetailPath(task.projectId, task.id),
      )
    })
  })

  it('draws every marker it carries, however many that is', () => {
    renderRow({
      ...seedPhase(),
      isCriticalPath: true,
      atRisk: true,
      delayReason: 'weather',
      delayDays: 3,
    })

    // A marker the row hid would be a state the reader cannot see and cannot
    // trust the filters about. The row grows instead.
    const row = screen.getByRole('row')
    expect(within(row).getByText('Critical path')).toBeInTheDocument()
    expect(within(row).getByText('At risk')).toBeInTheDocument()
    expect(within(row).getByText(/weather/i)).toBeInTheDocument()
    expect(within(row).queryByText(/^\+\d/)).toBeNull()
  })

  it('keeps the title as the only door — no actions track duplicating it', () => {
    const task = seedPhase()
    // Even an admin (Carlos, roleId 1) who holds task.edit gets neither an
    // edit nor a second "view" button: the eye called the same handler the
    // title does, for a quarter of a phone's width.
    renderRow(task, storeWithRole(1))

    expect(
      screen.queryByRole('button', { name: `View detail of ${task.title}` }),
    ).toBeNull()
    expect(
      screen.queryByRole('button', { name: `Edit ${task.title}` }),
    ).toBeNull()
  })
})
