/**
 * The draft's vitals on one line: main activities, subactivities, the span its
 * rows cover and its dependencies. The schedule and confirm steps render this
 * same line, so one draft never reads as two different counts.
 */

import { useIntl } from 'react-intl'

import { Text } from '@/components'
import { useFormatDate } from '@/i18n'
import type { ReviewTask } from '@/types'

import { scheduleFactsMessages as m } from './schedule-facts-messages'

/** Counted the way the listing draws them: phase rows and the rows under them. */
export function summarizeSchedule(tasks: ReviewTask[]) {
  const days = tasks
    .flatMap((task) => [
      task.startDate,
      task.dueDate,
      ...task.subtasks.flatMap((subtask) => [
        subtask.startDate,
        subtask.dueDate,
      ]),
    ])
    .filter((day): day is string => day !== null)
    .sort()
  return {
    phases: tasks.length,
    subtasks: tasks.reduce((total, task) => total + task.subtasks.length, 0),
    start: days[0] ?? null,
    end: days.at(-1) ?? null,
  }
}

export interface ScheduleFactsProps {
  tasks: ReviewTask[]
  dependencyCount: number
}

export function ScheduleFacts({ tasks, dependencyCount }: ScheduleFactsProps) {
  const intl = useIntl()
  const formatDate = useFormatDate()
  const { phases, subtasks, start, end } = summarizeSchedule(tasks)

  return (
    <Text
      size="sm"
      weight="medium"
      color="primary"
      data-testid="schedule-facts"
    >
      {[
        intl.formatMessage(m.phases, { count: phases }),
        intl.formatMessage(m.subtasks, { count: subtasks }),
        start && end
          ? intl.formatMessage(m.span, {
              start: formatDate(start),
              end: formatDate(end),
            })
          : intl.formatMessage(m.noDates),
        intl.formatMessage(m.dependencies, { count: dependencyCount }),
      ].join(' · ')}
    </Text>
  )
}
