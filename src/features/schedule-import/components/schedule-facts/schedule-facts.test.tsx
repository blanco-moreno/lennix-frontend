import { screen } from '@testing-library/react'

import { mapScheduleReviewStateDTO } from '@/services/schedule-import'
import { seedImportReviewStateDTO } from '@/tests/fixtures'
import { displayedDate } from '@/tests/intl-date'
import { renderWithProviders } from '@/tests/render-with-providers'

import { ScheduleFacts, summarizeSchedule } from './schedule-facts'

const state = () => mapScheduleReviewStateDTO(seedImportReviewStateDTO())

describe('summarizeSchedule', () => {
  it('counts phase rows and the rows under them, and spans every dated row', () => {
    const { tasks } = state()
    const summary = summarizeSchedule(tasks)
    const days = tasks
      .flatMap((task) => [task, ...task.subtasks])
      .flatMap((row) => [row.startDate, row.dueDate])
      .filter((day): day is string => day !== null)
      .sort()

    expect(summary.phases).toBe(tasks.length)
    expect(summary.subtasks).toBe(
      tasks.reduce((total, task) => total + task.subtasks.length, 0),
    )
    expect(summary.start).toBe(days[0])
    expect(summary.end).toBe(days.at(-1))
  })

  it('has no span when no row carries a date', () => {
    const tasks = state().tasks.map((task) => ({
      ...task,
      startDate: null,
      dueDate: null,
      subtasks: task.subtasks.map((subtask) => ({
        ...subtask,
        startDate: null,
        dueDate: null,
      })),
    }))
    expect(summarizeSchedule(tasks)).toMatchObject({ start: null, end: null })
  })
})

describe('ScheduleFacts', () => {
  it('states counts, span and dependencies on one line', () => {
    const { tasks } = state()
    const { phases, start, end } = summarizeSchedule(tasks)
    renderWithProviders(<ScheduleFacts tasks={tasks} dependencyCount={3} />)

    const line = screen.getByTestId('schedule-facts')
    expect(line).toHaveTextContent(`${phases} main activit`)
    expect(line).toHaveTextContent(
      `${displayedDate(start!)} – ${displayedDate(end!)}`,
    )
    expect(line).toHaveTextContent('3 dependencies')
  })
})
