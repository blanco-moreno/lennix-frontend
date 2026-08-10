import { taskBudgetSchema, taskValidationMessages } from '@/schemas'
import { useUpdateTaskBudgetMutation } from '@/services/task'

import { taskDetailViewMessages } from '../../task-detail-view-messages'
import { BudgetForm } from '../budget-form'

import { taskBudgetFormMessages as m } from './task-budget-form-messages'

interface TaskBudgetFormProps {
  taskId: string
  currentBudget: number | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TaskBudgetForm({
  taskId,
  currentBudget,
  open,
  onOpenChange,
}: TaskBudgetFormProps) {
  const [updateBudget, { isLoading }] = useUpdateTaskBudgetMutation()

  return (
    <BudgetForm
      inputId="task-budget-input"
      surface="inline"
      currentBudget={currentBudget}
      open={open}
      onOpenChange={onOpenChange}
      isLoading={isLoading}
      schema={taskBudgetSchema}
      validationMessages={taskValidationMessages}
      messages={{
        title: m.budgetModalTitle,
        description: m.budgetModalDescription,
        fieldLabel: m.budgetFieldLabel,
        submit: taskDetailViewMessages.update,
        updateSuccess: m.taskBudgetUpdateSuccess,
        updateError: m.taskBudgetUpdateError,
      }}
      onSubmit={async (budget) =>
        updateBudget({ id: taskId, body: { budget } }).unwrap()
      }
    />
  )
}
