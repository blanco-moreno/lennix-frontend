import { Box, Flex, Stack } from '@chakra-ui/react'
import {
  Ban,
  MoreHorizontal,
  Pencil,
  RotateCcw,
  Trash2,
  TrendingUp,
} from 'lucide-react'
import { FormattedMessage, useIntl } from 'react-intl'

import {
  AssigneeCell,
  AtRiskBadge,
  BlockedBadge,
  Button,
  CriticalPathBadge,
  DelayBadge,
  DropdownMenu,
  DueDateCell,
  ListRow,
  RowFact,
  ProgressCell,
  StatusBadge,
  Text,
} from '@/components'
import { TASK_ROW_MIN_H } from '@/constants'
import { BlockedReason, ForceStart } from '@/features'
import { useFormatDate } from '@/i18n'
import type { Subtask } from '@/types'
import {
  getDestructiveActionTextColor,
  getTaskGroupBorderColor,
  isTaskBlocked,
} from '@/utils'

import { taskListHeaderMessages as headers } from '../../../../../tasks-view/components/task-list-header/task-list-header-messages'
import { taskDetailViewMessages } from '../../../../task-detail-view-messages'
import { SUBTASK_GRID_COLUMNS } from '../../subtask-grid'
import { subtaskPanelMessages as m } from '../../subtask-panel-messages'

interface SubtaskRowProps {
  subtask: Subtask
  /** The obra — a subactivity carries no project id of its own. */
  projectId: string
  canEditTask: boolean
  canDeleteTask: boolean
  canRegisterProgress: boolean
  onEdit: () => void
  onReportProgress: () => void
  onDelete: () => void
  onCancelToggle: () => void
}

/**
 * One subactivity as a listing row — the same shell, columns and cells as
 * /tasks (`ListRow` + `TASK_GRID_COLUMNS`), so avance, estado, responsable and
 * fechas read as columns instead of a ~90px card each.
 *
 * The row does not expand — an inline panel only repeats the row's own
 * columns back at the reader. Dates read as one span, and the actions sit
 * beside the report button where the hand already is.
 */
export function SubtaskRow({
  subtask,
  projectId,
  canEditTask,
  canDeleteTask,
  canRegisterProgress,
  onEdit,
  onReportProgress,
  onDelete,
  onCancelToggle,
}: SubtaskRowProps) {
  const intl = useIntl()
  const formatDate = useFormatDate()
  const blockedNoForce = isTaskBlocked(subtask)

  return (
    <ListRow
      templateColumns={SUBTASK_GRID_COLUMNS}
      minH={TASK_ROW_MIN_H}
      // The same left tick /tasks rows carry: critical or blocked stays
      // findable at a glance, for 3px.
      borderLeftWidth="3px"
      {...getTaskGroupBorderColor({
        status: subtask.status,
        isCriticalPath: subtask.isCriticalPath,
        isBlocked: subtask.isBlocked,
      })}
      data-testid="subtask-row"
    >
      <Stack role="cell" gap={0.5} minW={0} mb={{ base: 1, lg: 0 }}>
        <Flex minW={0} align="center" gap={2} wrap="wrap">
          <Text size="sm" weight="medium" color="primary" maxW="full">
            {subtask.title}
          </Text>
          {subtask.isBlocked && (
            <BlockedBadge>
              <FormattedMessage {...taskDetailViewMessages.blockedBadge} />
            </BlockedBadge>
          )}
          {subtask.delayReason !== null && (
            <DelayBadge reason={subtask.delayReason} days={subtask.delayDays} />
          )}
          {subtask.isCriticalPath && (
            <CriticalPathBadge>
              <FormattedMessage {...taskDetailViewMessages.criticalBadge} />
            </CriticalPathBadge>
          )}
          {/* The at-risk mark outlives the block it overrode. */}
          <AtRiskBadge atRisk={subtask.atRisk} />
          {blockedNoForce && (
            <ForceStart target="subtask" id={subtask.id} name={subtask.title} />
          )}
        </Flex>

        {/* Name what a blocked subactivity waits on — or say the edge is
            broken, the case that has no name to give. */}
        <BlockedReason
          projectId={projectId}
          taskId={subtask.id}
          isBlocked={blockedNoForce}
        />
      </Stack>

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
        <RowFact label={<FormattedMessage {...headers.columnAssignee} />}>
          <AssigneeCell name={subtask.assigneeName} />
        </RowFact>
      </Box>

      {/* Start and due in one cell: a subactivity's dates are a span, and two
          columns spent half the row saying it twice. */}
      <Box role="cell" gridColumn={{ base: '1', lg: 'auto' }} minW={0}>
        <RowFact label={<FormattedMessage {...m.columnDates} />}>
          <Flex align="center" gap={1} minW={0} wrap="wrap">
            <Text as="span" size="xs" color="muted">
              {subtask.startDate ? formatDate(subtask.startDate) : '—'}
            </Text>
            <Text as="span" size="xs" color="muted" aria-hidden>
              –
            </Text>
            <DueDateCell date={subtask.dueDate} delayDays={subtask.delayDays} />
          </Flex>
        </RowFact>
      </Box>

      <Flex role="cell" justify="flex-end" align="center" gap={1}>
        {/* The one write an operator comes here to make — icon-only at every
            width, the aria-label carries the name. Blocked rows refuse the
            write, so the button says so before the form would. */}
        {canRegisterProgress && (
          <Button
            variant="outline"
            size="icon"
            disabled={blockedNoForce}
            aria-label={intl.formatMessage(m.subtaskReportProgressAction, {
              name: subtask.title,
            })}
            onClick={onReportProgress}
          >
            <Box as={TrendingUp} boxSize={4} />
          </Button>
        )}

        {(canEditTask || canDeleteTask) && (
          <DropdownMenu
            trigger={
              <Button
                variant="ghost"
                size="icon"
                aria-label={intl.formatMessage(m.subtaskActions, {
                  name: subtask.title,
                })}
              >
                <Box as={MoreHorizontal} boxSize={4} />
              </Button>
            }
            align="end"
            items={[
              ...(canEditTask
                ? [
                    {
                      icon: Pencil,
                      label: (
                        <FormattedMessage {...taskDetailViewMessages.edit} />
                      ),
                      onSelect: onEdit,
                    },
                    {
                      icon: subtask.status === 'cancelled' ? RotateCcw : Ban,
                      label: (
                        <FormattedMessage
                          {...(subtask.status === 'cancelled'
                            ? m.reopenSubtask
                            : m.cancelSubtask)}
                        />
                      ),
                      onSelect: onCancelToggle,
                    },
                  ]
                : []),
              ...(canDeleteTask
                ? [
                    { type: 'separator' as const },
                    {
                      icon: Trash2,
                      label: (
                        <FormattedMessage
                          {...taskDetailViewMessages.deleteAction}
                        />
                      ),
                      onSelect: onDelete,
                      itemProps: getDestructiveActionTextColor(),
                    },
                  ]
                : []),
            ]}
          />
        )}
      </Flex>
    </ListRow>
  )
}
