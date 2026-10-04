import { Box } from '@chakra-ui/react'
import { useIntl } from 'react-intl'

import { ListRowSkeleton } from '@/components'
import { TASK_GRID_COLUMNS, TASK_ROW_MIN_H } from '@/constants'
import type { AssignedSubtask } from '@/types'

import { tasksViewMessages as m } from '../../../../tasks-view-messages'
import { TaskListHeader } from '../../../task-list-header'
import { AssignedSubtaskRow } from '../assigned-subtask-row'

interface AssignedSubtaskTableProps {
  subtasks: AssignedSubtask[]
  /** The listing draws its own rows while they arrive — no outer branch. */
  isLoading?: boolean
}

/**
 * The caller's own activities, as the same table the portfolio list reads —
 * one row per subactivity under one header, and the loading rows on the same
 * column template, so the tab never changes shape between the two.
 */
export function AssignedSubtaskTable({
  subtasks,
  isLoading = false,
}: AssignedSubtaskTableProps) {
  const intl = useIntl()

  return (
    <Box
      role={isLoading ? 'presentation' : 'table'}
      aria-label={isLoading ? undefined : intl.formatMessage(m.tabAssigned)}
      aria-busy={isLoading || undefined}
      borderWidth="1px"
      borderColor="border"
      rounded="lg"
      bg="bg.panel"
    >
      <TaskListHeader context="project" presentational={isLoading} />
      {isLoading ? (
        <ListRowSkeleton
          templateColumns={TASK_GRID_COLUMNS}
          minH={TASK_ROW_MIN_H}
          count={6}
        />
      ) : (
        subtasks.map((subtask) => (
          <AssignedSubtaskRow key={subtask.id} subtask={subtask} />
        ))
      )}
    </Box>
  )
}
