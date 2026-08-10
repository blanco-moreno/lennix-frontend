import { Stack } from '@chakra-ui/react'
import { FormattedMessage, useIntl } from 'react-intl'

import { ProgressPanel } from '@/components'
import { BlockedReason } from '@/features'
import { useFormatDate } from '@/i18n'
import type { Task } from '@/types'
import { getProgressColor, resolveProgressHealth, isTaskBlocked } from '@/utils'

import { taskOverviewTabMessages as dateM } from '../task-overview-tab/task-overview-tab-messages'

import { taskDetailHeaderMessages as m } from './task-detail-header-messages'

interface TaskHeaderVitalsProps {
  task: Task
}

/**
 * The activity's state, under its identity: what a blocked phase waits on and
 * the execution progress. The status/priority badges live in the shell's
 * identity row (`TaskHeaderBadges`), the delay it carries in
 * `TaskHeaderDelayAlert` — this is what stays on screen at every width.
 */
export function TaskHeaderVitals({ task }: TaskHeaderVitalsProps) {
  const intl = useIntl()
  const formatDate = useFormatDate()

  return (
    <Stack gap={4}>
      {/* The phase whose work is finished but cannot close — starting or
          completing a blocked task is forbidden, so name what it waits on. */}
      <BlockedReason
        projectId={task.projectId}
        taskId={task.id}
        isBlocked={isTaskBlocked(task)}
        size="sm"
      />

      <ProgressPanel
        heading={<FormattedMessage {...m.progressExecutionLabel} />}
        dates={[
          {
            label: <FormattedMessage {...dateM.startDateLabel} />,
            value: task.startDate
              ? formatDate(task.startDate)
              : intl.formatMessage(dateM.noStartDate),
          },
          {
            label: <FormattedMessage {...dateM.dueDateLabel} />,
            value: task.dueDate
              ? formatDate(task.dueDate)
              : intl.formatMessage(dateM.noDueDate),
          },
        ]}
        value={task.progress}
        indicator={getProgressColor(resolveProgressHealth(task))}
      />
    </Stack>
  )
}
