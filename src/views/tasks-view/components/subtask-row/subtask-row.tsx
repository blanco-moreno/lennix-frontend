import { Box, Flex } from '@chakra-ui/react'
import { CornerDownRight } from 'lucide-react'
import { FormattedMessage } from 'react-intl'
import { useNavigate } from 'react-router'

import {
  AssigneeCell,
  BlockedBadge,
  CriticalPathBadge,
  DelayBadge,
  DueDateCell,
  ListRow,
  RowFact,
  ProgressCell,
  StatusBadge,
  Text,
} from '@/components'
import { TASK_GRID_COLUMNS } from '@/constants'
import { BlockedReason, ForceStart } from '@/features'
import { buildTaskDetailPath } from '@/router'
import type { Subtask } from '@/types'
import { getTaskGroupBorderColor, isTaskBlocked } from '@/utils'

import { taskListHeaderMessages as headers } from '../task-list-header/task-list-header-messages'

import { subtaskRowMessages as m } from './subtask-row-messages'

interface SubtaskRowProps {
  subtask: Subtask
  /** The obra the parent activity belongs to — a subactivity carries no id of
   * its own in the URL, it is opened as a selection inside its parent. */
  projectId: string
}

/**
 * One subactivity, expanded under its main activity — on the same columns, so
 * avance, estado, responsable and fecha stay in the columns their header
 * named. Only the tint and the indent say it is a level down.
 */
export function SubtaskRow({ subtask, projectId }: SubtaskRowProps) {
  const navigate = useNavigate()

  const openDetail = async () =>
    navigate(
      buildTaskDetailPath(projectId, subtask.parentId, {
        subtaskId: subtask.id,
      }),
    )

  return (
    // A level down: subtle tint, and the same tick its parent carries. A flat
    // `border` leaves a blocked or finished subactivity grey here and coloured
    // everywhere else.
    <ListRow
      templateColumns={TASK_GRID_COLUMNS}
      minH="2.75rem"
      py={1.5}
      borderLeftWidth="3px"
      {...getTaskGroupBorderColor({
        status: subtask.status,
        isCriticalPath: subtask.isCriticalPath,
        isBlocked: subtask.isBlocked,
      })}
      bg="bg.subtle"
    >
      {/* The chevron belongs to the title, so it sits on the title's line
          rather than centring against a row the badges make taller. */}
      <Box role="cell" alignSelf={{ base: 'start', lg: 'center' }}>
        <Box as={CornerDownRight} boxSize={3.5} color="fg.muted" ml={2} />
      </Box>

      <Flex
        role="cell"
        minW={0}
        align="center"
        gap={2}
        wrap="wrap"
        // The name owns the first line of a stacked row; the facts under it
        // start a little further down than they sit apart from each other.
        mb={{ base: 1, lg: 0 }}
      >
        <Text
          asChild
          size="sm"
          color="primary"
          textAlign="start"
          maxW="full"
          _hover={{ textDecoration: 'underline' }}
        >
          <button type="button" onClick={openDetail}>
            {subtask.title}
          </button>
        </Text>

        {subtask.isBlocked && (
          <BlockedBadge>
            <FormattedMessage {...m.blocked} />
          </BlockedBadge>
        )}
        {subtask.delayReason && (
          <DelayBadge reason={subtask.delayReason} days={subtask.delayDays} />
        )}
        {subtask.isCriticalPath && (
          <CriticalPathBadge>
            <FormattedMessage {...m.criticalPath} />
          </CriticalPathBadge>
        )}
        {isTaskBlocked(subtask) && (
          <>
            <ForceStart target="subtask" id={subtask.id} name={subtask.title} />
            <Box flexBasis="100%">
              <BlockedReason
                projectId={projectId}
                taskId={subtask.id}
                isBlocked
              />
            </Box>
          </>
        )}
      </Flex>

      <Box role="cell" gridColumn={{ base: '2', lg: 'auto' }} minW={0}>
        <RowFact label={<FormattedMessage {...headers.columnProgress} />}>
          <ProgressCell subject={subtask} />
        </RowFact>
      </Box>

      <Box role="cell" gridColumn={{ base: '2', lg: 'auto' }} minW={0}>
        <RowFact label={<FormattedMessage {...headers.columnStatus} />}>
          <StatusBadge domain="status" value={subtask.status} />
        </RowFact>
      </Box>

      <Box role="cell" gridColumn={{ base: '2', lg: 'auto' }} minW={0}>
        <RowFact label={<FormattedMessage {...headers.columnPriority} />}>
          <StatusBadge domain="priority" value={subtask.priority} />
        </RowFact>
      </Box>

      <Box role="cell" gridColumn={{ base: '2', lg: 'auto' }} minW={0}>
        <RowFact label={<FormattedMessage {...headers.columnAssignee} />}>
          <AssigneeCell name={subtask.assigneeName} />
        </RowFact>
      </Box>

      <Box role="cell" gridColumn={{ base: '2', lg: 'auto' }} minW={0}>
        <RowFact label={<FormattedMessage {...headers.columnDueDate} />}>
          <DueDateCell date={subtask.dueDate} delayDays={subtask.delayDays} />
        </RowFact>
      </Box>
    </ListRow>
  )
}
