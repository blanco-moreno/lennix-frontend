import { Box, Flex } from '@chakra-ui/react'
import { Layers } from 'lucide-react'
import { FormattedMessage } from 'react-intl'
import { useNavigate } from 'react-router'

import {
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
import { taskGridColumns, TASK_ROW_MIN_H } from '@/constants'
import { BlockedReason } from '@/features'
import { buildTaskDetailPath } from '@/router'
import type { AssignedSubtask } from '@/types'

import { subtaskRowMessages as m } from '../../../subtask-row/subtask-row-messages'
import { taskListHeaderMessages as headers } from '../../../task-list-header/task-list-header-messages'

interface AssignedSubtaskRowProps {
  subtask: AssignedSubtask
}

/**
 * One row of the "assigned to me" queue, on the same columns as the portfolio
 * list — only the fifth column changes meaning: this queue is already one
 * person's, so it names the obra instead of the responsable.
 *
 * The obra and phase names arrive on the row itself (`project_name`,
 * `parent_title`) — deliberately no per-row lookup. Opening a row goes to its
 * phase: a subactivity has no address of its own.
 *
 * A row whose `parentId` is null is a **first-level activity**: it has no phase
 * above it, so the phase chip is dropped rather than left blank — the obra
 * column alone is its context — and it opens on its own page, which it does
 * have.
 */
export function AssignedSubtaskRow({ subtask }: AssignedSubtaskRowProps) {
  const navigate = useNavigate()

  const open = async () =>
    navigate(
      subtask.parentId === null
        ? buildTaskDetailPath(subtask.projectId, subtask.id)
        : buildTaskDetailPath(subtask.projectId, subtask.parentId, {
            subtaskId: subtask.id,
          }),
    )

  return (
    <ListRow
      templateColumns={taskGridColumns({ expandable: false })}
      minH={TASK_ROW_MIN_H}
    >
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
          weight="medium"
          color="primary"
          textAlign="start"
          maxW="full"
          _hover={{ textDecoration: 'underline' }}
        >
          <button
            type="button"
            onClick={open}
            data-testid={`assigned-subtask-${subtask.id}`}
          >
            {subtask.title}
          </button>
        </Text>

        {/* The phase the row hangs off — the obra is its own column. Absent on
            a first-level activity: an empty chip would read as a missing name
            rather than as "there is no phase". */}
        {subtask.parentTitle !== null && (
          <Flex flexShrink={0} align="center" gap={1} color="fg.muted" minW={0}>
            <Box as={Layers} boxSize={3.5} />
            <Text as="span" size="xs" color="muted">
              {subtask.parentTitle}
            </Text>
          </Flex>
        )}

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
        {/* The queue spans obras, so the row carries its own project id — the
            reason reads the same here as on the activity's page. */}
        {subtask.isBlocked && (
          <Box flexBasis="100%">
            <BlockedReason
              projectId={subtask.projectId}
              taskId={subtask.id}
              isBlocked
            />
          </Box>
        )}
      </Flex>

      <Box role="cell" gridColumn={{ base: '1', lg: 'auto' }} minW={0}>
        <RowFact label={<FormattedMessage {...headers.columnProgress} />}>
          <ProgressCell subject={subtask} />
        </RowFact>
      </Box>

      <Box role="cell" gridColumn={{ base: '1', lg: 'auto' }} minW={0}>
        <RowFact label={<FormattedMessage {...headers.columnStatus} />}>
          <StatusBadge domain="status" value={subtask.status} />
        </RowFact>
      </Box>

      <Box role="cell" gridColumn={{ base: '1', lg: 'auto' }} minW={0}>
        <RowFact label={<FormattedMessage {...headers.columnPriority} />}>
          <StatusBadge domain="priority" value={subtask.priority} />
        </RowFact>
      </Box>

      <Box role="cell" gridColumn={{ base: '1', lg: 'auto' }} minW={0}>
        <RowFact label={<FormattedMessage {...headers.columnProject} />}>
          <Text as="span" size="sm">
            {subtask.projectName}
          </Text>
        </RowFact>
      </Box>

      <Box role="cell" gridColumn={{ base: '1', lg: 'auto' }} minW={0}>
        <RowFact label={<FormattedMessage {...headers.columnDueDate} />}>
          <DueDateCell date={subtask.dueDate} delayDays={subtask.delayDays} />
        </RowFact>
      </Box>
    </ListRow>
  )
}
