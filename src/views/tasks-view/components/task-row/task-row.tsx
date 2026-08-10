import { Box, Flex } from '@chakra-ui/react'
import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Layers,
  Lock,
} from 'lucide-react'
import { useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { useNavigate } from 'react-router'

import {
  AssigneeCell,
  AtRiskBadge,
  Badge,
  BlockedBadge,
  Button,
  CriticalPathBadge,
  DelayBadge,
  DueDateCell,
  ListRow,
  RowFact,
  ProgressCell,
  StatusBadge,
  Text,
} from '@/components'
import { TASK_GRID_COLUMNS, TASK_ROW_MIN_H } from '@/constants'
import { BlockedReason, ForceStart } from '@/features'
import { buildTaskDetailPath } from '@/router'
import type { Task } from '@/types'
import { getTaskGroupBorderColor, isTaskBlocked, toneStyle } from '@/utils'

import { SubtaskRow } from '../subtask-row'
import { taskListHeaderMessages as headers } from '../task-list-header/task-list-header-messages'

import { taskRowMessages as m } from './task-row-messages'

interface TaskRowProps {
  task: Task
}

/**
 * One main activity, one row.
 *
 * This replaced a ~200px card: the same facts, laid out as columns under a
 * shared header, so a portfolio of obras reads as a list instead of a wall.
 * The money moved out — it belongs to the activity drawer and the budget
 * surfaces, and it was costing a whole line here on every row.
 *
 * The title opens the drawer over the obra's own schedule; the chevron opens
 * the subactivities in place.
 */
export function TaskRow({ task }: TaskRowProps) {
  const [isOpen, setIsOpen] = useState(false)
  const intl = useIntl()
  const navigate = useNavigate()

  const blocked = isTaskBlocked(task)
  const subtasks = task.subtasks ?? []
  const delayedCount = subtasks.filter((s) => s.delayReason).length

  const openDetail = async () =>
    navigate(buildTaskDetailPath(task.projectId, task.id))

  return (
    <>
      <ListRow
        templateColumns={TASK_GRID_COLUMNS}
        minH={TASK_ROW_MIN_H}
        // The left tick is all that survives of the card's coloured frame:
        // critical or delayed rows stay findable at a glance, for 3px.
        borderLeftWidth="3px"
        {...getTaskGroupBorderColor({
          status: task.status,
          isCriticalPath: task.isCriticalPath,
          isBlocked: blocked,
          delayedSubtaskCount: delayedCount,
        })}
      >
        {/* The chevron belongs to the title, so it sits on the title's line
            rather than centring against a row the badges make taller. */}
        <Box role="cell" alignSelf={{ base: 'start', lg: 'center' }}>
          {subtasks.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              boxSize={{ base: 9, lg: 7 }}
              minW={{ base: 9, lg: 7 }}
              aria-expanded={isOpen}
              aria-label={intl.formatMessage(isOpen ? m.collapse : m.expand, {
                count: subtasks.length,
              })}
              onClick={() => setIsOpen(!isOpen)}
            >
              <Box as={isOpen ? ChevronDown : ChevronRight} boxSize={4} />
            </Button>
          )}
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
            weight="medium"
            color="primary"
            textAlign="start"
            maxW="full"
            _hover={{ textDecoration: 'underline' }}
          >
            <button type="button" onClick={openDetail}>
              {task.title}
            </button>
          </Text>

          {subtasks.length > 0 && (
            <Flex
              flexShrink={0}
              align="center"
              gap={1}
              color="fg.muted"
              title={intl.formatMessage(m.subtaskCount, {
                count: subtasks.length,
              })}
            >
              <Box as={Layers} boxSize={3.5} />
              <Text as="span" size="xs" color="muted">
                {subtasks.length}
              </Text>
            </Flex>
          )}

          {/* Every state the activity carries, at every width. A row that hid
              one would be lying to whoever filtered by it. */}
          {blocked && (
            <BlockedBadge icon={Lock}>
              <FormattedMessage {...m.blocked} />
            </BlockedBadge>
          )}
          {delayedCount > 0 && (
            // The count only, with the sentence kept for screen readers: the
            // full "N delayed subactivities" ate a third of the row.
            <Badge
              {...toneStyle('danger')}
              flexShrink={0}
              display="flex"
              alignItems="center"
              gap={1}
              aria-label={intl.formatMessage(m.delayedSubtasksBadge, {
                count: delayedCount,
              })}
            >
              <Box as={AlertTriangle} boxSize={3} />
              {delayedCount}
            </Badge>
          )}
          {task.delayReason && (
            <DelayBadge reason={task.delayReason} days={task.delayDays} />
          )}
          {task.isCriticalPath && (
            <CriticalPathBadge>
              <FormattedMessage {...m.criticalPath} />
            </CriticalPathBadge>
          )}
          {/* Permanent provenance — this activity jumped its dependencies
              once, and the badge says so for good. */}
          <AtRiskBadge atRisk={task.atRisk} />
          {/* One force-start surface: the row does not implement the override,
              it just says which activity is being forced. */}
          {blocked && (
            <ForceStart target="task" id={task.id} name={task.title} />
          )}

          {/* The badge says "bloqueada"; this says by what — or that the link
              it waits on is dead, the case only the schedule can repair. It
              takes the whole line under the badges rather than a column. */}
          {blocked && (
            <Box flexBasis="100%">
              <BlockedReason
                projectId={task.projectId}
                taskId={task.id}
                isBlocked
              />
            </Box>
          )}
        </Flex>

        {/* The same four cells at both steps, in the same order: columns from
            `lg`, and stacked under the name below it, each carrying the label
            its column would have had. */}
        <Box role="cell" gridColumn={{ base: '2', lg: 'auto' }} minW={0}>
          <RowFact label={<FormattedMessage {...headers.columnProgress} />}>
            <ProgressCell subject={task} />
          </RowFact>
        </Box>

        <Box role="cell" gridColumn={{ base: '2', lg: 'auto' }} minW={0}>
          <RowFact label={<FormattedMessage {...headers.columnStatus} />}>
            <StatusBadge domain="status" value={task.status} />
          </RowFact>
        </Box>

        <Box role="cell" gridColumn={{ base: '2', lg: 'auto' }} minW={0}>
          <RowFact label={<FormattedMessage {...headers.columnPriority} />}>
            <StatusBadge domain="priority" value={task.priority} />
          </RowFact>
        </Box>

        <Box role="cell" gridColumn={{ base: '2', lg: 'auto' }} minW={0}>
          <RowFact label={<FormattedMessage {...headers.columnAssignee} />}>
            <AssigneeCell name={task.assigneeName} />
          </RowFact>
        </Box>

        <Box role="cell" gridColumn={{ base: '2', lg: 'auto' }} minW={0}>
          <RowFact label={<FormattedMessage {...headers.columnDueDate} />}>
            <DueDateCell date={task.dueDate} delayDays={task.delayDays} />
          </RowFact>
        </Box>
      </ListRow>

      {isOpen &&
        subtasks.map((subtask) => (
          <SubtaskRow
            key={subtask.id}
            subtask={subtask}
            projectId={task.projectId}
          />
        ))}
    </>
  )
}
