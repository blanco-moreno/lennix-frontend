import { Flex } from '@chakra-ui/react'
import { FormattedMessage } from 'react-intl'

import {
  Badge,
  BlockedBadge,
  CriticalPathBadge,
  DelayBadge,
} from '@/components'
import { usePriorityLabel, useStatusLabel } from '@/hooks'
import type { Task } from '@/types'
import { getTaskStatusColor, getPriorityColor, isTaskBlocked } from '@/utils'

import { taskDetailViewMessages } from '../../task-detail-view-messages'

interface TaskHeaderBadgesProps {
  task: Task
}

/** The activity's state at a glance, next to its identity line. */
export function TaskHeaderBadges({ task }: TaskHeaderBadgesProps) {
  const statusLabel = useStatusLabel()
  const priorityLabel = usePriorityLabel()

  return (
    <Flex wrap="wrap" gap={2}>
      <Badge {...getTaskStatusColor(task.status)}>
        {statusLabel(task.status)}
      </Badge>
      {isTaskBlocked(task) && (
        <BlockedBadge>
          <FormattedMessage {...taskDetailViewMessages.blockedBadge} />
        </BlockedBadge>
      )}
      <Badge {...getPriorityColor(task.priority)}>
        <FormattedMessage {...taskDetailViewMessages.priorityLabel} />:{' '}
        {priorityLabel(task.priority)}
      </Badge>
      {task.isCriticalPath && (
        <CriticalPathBadge>
          <FormattedMessage {...taskDetailViewMessages.criticalBadge} />
        </CriticalPathBadge>
      )}
      {task.delayReason && (
        <DelayBadge reason={task.delayReason} days={task.delayDays} />
      )}
    </Flex>
  )
}
