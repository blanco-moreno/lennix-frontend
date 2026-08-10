/**
 * The task's stat tiles, in the same card shape the project header uses
 * (`StatCard`, `variant="panel"`): progress plus the elapsed-time facts only
 * this section knows. Status, priority and assignee already sit in the
 * identity row above and are not repeated here.
 */

import { SimpleGrid } from '@chakra-ui/react'
import { Calendar, Clock, Timer, TrendingUp } from 'lucide-react'
import { useIntl } from 'react-intl'

import { StatCard } from '@/components/ui/stat-card'
import type { Task } from '@/types'
import { calculateTaskDuration, formatPercent } from '@/utils'

import { taskDetailHeaderMessages } from '../task-detail-header/task-detail-header-messages'

import { taskOverviewTabMessages as m } from './task-overview-tab-messages'

interface TaskOverviewTabProps {
  task: Task
}

export function TaskOverviewTab({ task }: TaskOverviewTabProps) {
  const intl = useIntl()
  const { totalDuration, elapsedDuration, remainingDuration } =
    calculateTaskDuration(task.startDate, task.dueDate)

  return (
    <SimpleGrid columns={{ base: 2, lg: 4 }} gap={4}>
      <StatCard
        icon={TrendingUp}
        semantic="info"
        label={intl.formatMessage(
          taskDetailHeaderMessages.progressExecutionLabel,
        )}
        value={formatPercent(task.progress)}
      />
      <StatCard
        icon={Calendar}
        semantic="default"
        label={intl.formatMessage(m.totalDaysLabel)}
        value={totalDuration}
      />
      <StatCard
        icon={Clock}
        semantic="default"
        label={intl.formatMessage(m.elapsedDaysLabel)}
        value={elapsedDuration}
      />
      <StatCard
        icon={Timer}
        semantic="default"
        label={intl.formatMessage(m.remainingDaysLabel)}
        value={remainingDuration}
      />
    </SimpleGrid>
  )
}
