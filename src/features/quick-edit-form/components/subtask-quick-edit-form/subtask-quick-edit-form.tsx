import type { QuickEditFormValues } from '@/schemas'
import { useUpdateSubtaskMutation } from '@/services/task'
import type { Subtask } from '@/types'

import { QuickEditForm } from '../../quick-edit-form'
import { quickEditMessages as m } from '../../quick-edit-form-messages'

interface SubtaskQuickEditFormProps {
  subtask: Subtask
  projectId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SubtaskQuickEditForm({
  subtask,
  projectId,
  open,
  onOpenChange,
}: SubtaskQuickEditFormProps) {
  const [updateSubtask] = useUpdateSubtaskMutation()

  return (
    <QuickEditForm
      values={{
        title: subtask.title,
        assigneeId: subtask.assigneeId ?? null,
        priority: subtask.priority as QuickEditFormValues['priority'],
        startDate: subtask.startDate,
        dueDate: subtask.dueDate,
      }}
      withDates
      projectId={projectId}
      idPrefix="subtask-quick"
      titlePlaceholder={m.quickEditSubtaskTitlePlaceholder}
      successMessage={m.subtaskUpdateSuccess}
      errorMessage={m.subtaskUpdateError}
      open={open}
      onOpenChange={onOpenChange}
      onSave={async (patch) =>
        updateSubtask({
          id: subtask.id,
          projectId,
          body: {
            title: patch.title,
            priority: patch.priority,
            // The subtask contract clears an assignee with null.
            assignee_id: 'assigneeId' in patch ? patch.assigneeId : undefined,
            start_date: patch.startDate,
            due_date: patch.dueDate,
          },
        }).unwrap()
      }
    />
  )
}
