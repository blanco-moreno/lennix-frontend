import { Box } from '@chakra-ui/react'
import {
  Trash2,
  DollarSign,
  MoreVertical,
  Pencil,
  Ban,
  RefreshCw,
} from 'lucide-react'
import { FormattedMessage, useIntl } from 'react-intl'

import { Button, DropdownMenu } from '@/components'
import { Modal } from '@/components/ui/modal'
import { usePermission } from '@/hooks'
import type { Task } from '@/types'
import { getDestructiveActionTextColor } from '@/utils'

import { taskDetailViewMessages } from '../../task-detail-view-messages'
import { BudgetApprovalRequestForm } from '../budget-approval-request-form'
import { TaskCancelForm } from '../task-cancel-form'
import { TaskEditForm } from '../task-edit-form'

import { useTaskHeaderActions } from './hooks'
import { taskDetailHeaderMessages as m } from './task-detail-header-messages'

interface TaskActionsProps {
  task: Task
  /** Called once the activity stops existing, so the page can leave it. */
  onDeleted: () => void
}

/**
 * The activity's own actions — cancel/reopen, budget, edit, delete — with
 * the modals they open. Rendered in the detail header, beside the name:
 * they are things you do *to* what you are reading.
 */
export function TaskActions({ task, onDeleted }: TaskActionsProps) {
  const intl = useIntl()
  const canEditTask = usePermission('task.edit')
  const canEditBudgetDirect = usePermission('budget.edit.direct')
  const canEditBudgetRequest = usePermission('budget.edit.request')
  // Direct editors set the budget inside the edit drawer; only the
  // request-only role (`user`) still needs a distinct action for it.
  const canRequestBudget = canEditBudgetRequest && !canEditBudgetDirect
  const canDeleteTask = usePermission('task.delete')

  const {
    showDeleteDialog,
    setShowDeleteDialog,
    showBudgetForm,
    setShowBudgetForm,
    showStatusModal,
    setShowStatusModal,
    showEditModal,
    setShowEditModal,
    handleDelete,
  } = useTaskHeaderActions(task, onDeleted)

  const isCancelled = task.status === 'cancelled'

  // One menu holds every activity action; the header keeps only the trigger.
  const menuItems = [
    ...(canEditTask
      ? [
          {
            icon: Pencil,
            label: <FormattedMessage {...m.editTaskAction} />,
            onSelect: () => setShowEditModal(true),
          },
          {
            // Cancel/reopen, not a status picker — status is derived from the
            // subtasks; this is only the decision a percentage cannot express.
            icon: isCancelled ? RefreshCw : Ban,
            label: (
              <FormattedMessage
                {...(isCancelled
                  ? taskDetailViewMessages.reopenTask
                  : taskDetailViewMessages.cancelTask)}
              />
            ),
            onSelect: () => setShowStatusModal(true),
          },
        ]
      : []),
    ...(canRequestBudget
      ? [
          {
            icon: DollarSign,
            label: <FormattedMessage {...m.requestBudgetAction} />,
            onSelect: () => setShowBudgetForm(true),
          },
        ]
      : []),
    ...(canDeleteTask
      ? [
          { type: 'separator' as const },
          {
            icon: Trash2,
            label: <FormattedMessage {...m.deleteTaskAction} />,
            onSelect: () => setShowDeleteDialog(true),
            itemProps: getDestructiveActionTextColor(),
          },
        ]
      : []),
  ]

  return (
    <>
      {menuItems.length > 0 && (
        <DropdownMenu
          trigger={
            <Button
              variant="outline"
              size="sm"
              aria-label={intl.formatMessage(m.moreActions)}
            >
              <Box as={MoreVertical} boxSize={4} />
            </Button>
          }
          align="end"
          items={menuItems}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Modal
        variant="confirmation"
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title={<FormattedMessage {...m.taskDeleteDialogTitle} />}
        description={
          <FormattedMessage
            {...m.taskDeleteDialogDescription}
            values={{ name: task.title }}
          />
        }
        cancelLabel={<FormattedMessage {...taskDetailViewMessages.cancel} />}
        confirmLabel={
          <FormattedMessage {...taskDetailViewMessages.deleteAction} />
        }
        onConfirm={handleDelete}
      />

      {/* Budget request flow (`user`). Direct editors set the budget from the
          edit drawer instead, so this only mounts for the request-only role. */}
      {canRequestBudget && (
        <BudgetApprovalRequestForm
          targetType="task"
          targetId={task.id}
          currentBudget={task.budget}
          open={showBudgetForm}
          onOpenChange={setShowBudgetForm}
        />
      )}

      {/* Cancel/reopen, not a status picker — the status itself is derived
          from the subtasks. */}
      <TaskCancelForm
        taskId={task.id}
        taskTitle={task.title}
        projectName={task.projectName}
        currentStatus={task.status}
        open={showStatusModal}
        onOpenChange={setShowStatusModal}
      />

      {/* Edit Modal */}
      <TaskEditForm
        task={task}
        open={showEditModal}
        onOpenChange={setShowEditModal}
      />
    </>
  )
}
