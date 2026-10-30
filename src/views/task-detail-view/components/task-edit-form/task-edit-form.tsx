import { Stack } from '@chakra-ui/react'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { FormattedMessage, useIntl } from 'react-intl'

import { FormDrawer, Label, ModalFormFooter, Text } from '@/components'
import { Combobox } from '@/components/ui/combobox/combobox'
import { CurrencyInput } from '@/components/ui/currency-input'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { UNASSIGNED } from '@/constants'
import { usePermission, useProjectCurrency } from '@/hooks'
import { useAssignableOptions } from '@/hooks/use-assignable-options/use-assignable-options'
import { useZodResolverIntl } from '@/i18n'
import {
  taskEditSchema,
  taskValidationMessages,
  type TaskEditFormValues,
} from '@/schemas'
import {
  useUpdateTaskBudgetMutation,
  useUpdateTaskMutation,
} from '@/services/task'
import type { Task } from '@/types'
import { serializeMoneyForApi } from '@/utils'

import { taskDetailViewMessages } from '../../task-detail-view-messages'

import { taskEditModalMessages as m } from './task-edit-form-messages'

interface TaskEditFormProps {
  task: Task
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TaskEditForm({ task, open, onOpenChange }: TaskEditFormProps) {
  const intl = useIntl()
  const { currency } = useProjectCurrency(task.projectId)
  const [updateTask, { isLoading }] = useUpdateTaskMutation()
  const [updateBudget, { isLoading: isSavingBudget }] =
    useUpdateTaskBudgetMutation()
  // The budget lives in this drawer only for who may set it outright; the
  // request flow (PM/PC) is its own action in the header menu.
  const canEditBudgetDirect = usePermission('budget.edit.direct')
  // `workAssignableOnly`: an assignee goes through the narrower gate than the
  // jefe de obra does, and the wide rows the endpoint also returns would 400.
  const { options: assignableOptions, renderOption } = useAssignableOptions(
    task.projectId,
    { skip: !open, workAssignableOnly: true },
  )

  const budgetValue = task.budget !== null ? String(task.budget) : ''

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskEditFormValues>({
    resolver: useZodResolverIntl(taskEditSchema, taskValidationMessages),
    defaultValues: {
      title: task.title,
      description: task.description,
      priority: task.priority,
      assigneeId: task.assigneeId ?? UNASSIGNED,
      budget: budgetValue,
    },
    mode: 'onChange',
  })

  useEffect(() => {
    if (open) {
      reset({
        title: task.title,
        description: task.description,
        priority: task.priority,
        assigneeId: task.assigneeId ?? UNASSIGNED,
        budget: budgetValue,
      })
    }
  }, [open, task, reset, budgetValue])

  const onSubmit = async (data: TaskEditFormValues) => {
    const assigneeId = data.assigneeId === UNASSIGNED ? null : data.assigneeId
    const nextBudget = serializeMoneyForApi(data.budget)
    const budgetChanged =
      canEditBudgetDirect &&
      data.budget !== '' &&
      nextBudget !== serializeMoneyForApi(budgetValue)
    try {
      await updateTask({
        id: task.id,
        body: {
          title: data.title,
          description: data.description,
          priority: data.priority,
          // Sent only when it moved, and `''` is how the contract spells
          // "nobody" — an omitted field means "leave it alone", so clearing a
          // responsible has to say so explicitly.
          assignee_id:
            assigneeId === (task.assigneeId ?? null)
              ? undefined
              : (assigneeId ?? ''),
        },
      }).unwrap()
      if (budgetChanged) {
        await updateBudget({
          id: task.id,
          body: { budget: nextBudget },
        }).unwrap()
      }
      toast.success(intl.formatMessage(m.taskUpdateSuccess), {
        id: m.taskUpdateSuccess.id,
      })
      onOpenChange(false)
    } catch {
      toast.error(intl.formatMessage(m.taskUpdateError), {
        id: m.taskUpdateError.id,
      })
    }
  }

  return (
    <FormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={intl.formatMessage(m.taskEditTitle)}
      description={intl.formatMessage(m.taskEditDescription, {
        project: task.projectName ?? '—',
      })}
      onSubmit={handleSubmit(onSubmit)}
      footer={
        <ModalFormFooter
          submitLabel={m.saveChanges}
          isLoading={isLoading || isSavingBudget}
          onCancel={() => onOpenChange(false)}
        />
      }
    >
      <Stack gap="field">
        <Stack gap={2}>
          <Label color="primary" htmlFor="task-edit-title">
            <FormattedMessage {...m.taskTitleLabel} /> *
          </Label>
          <Input
            id="task-edit-title"
            placeholder={intl.formatMessage(m.taskTitlePlaceholder)}
            aria-invalid={!!errors.title}
            {...register('title')}
          />
          {errors.title && (
            <Text size="sm" color="error">
              {errors.title.message}
            </Text>
          )}
        </Stack>

        <Stack gap={2}>
          <Label color="primary" htmlFor="task-edit-assignee">
            <FormattedMessage {...taskDetailViewMessages.assigneeLabel} />
          </Label>
          <Controller
            control={control}
            name="assigneeId"
            render={({ field }) => (
              <Combobox
                id="task-edit-assignee"
                value={field.value}
                onValueChange={field.onChange}
                placeholder={intl.formatMessage(
                  taskDetailViewMessages.unassigned,
                )}
                renderOption={renderOption}
                options={[
                  {
                    value: UNASSIGNED,
                    label: intl.formatMessage(
                      taskDetailViewMessages.unassigned,
                    ),
                    roleSlug: null,
                    isProjectMember: true,
                  },
                  ...assignableOptions,
                ]}
              />
            )}
          />
        </Stack>

        <Stack gap={2}>
          <Label color="primary" htmlFor="task-edit-description">
            <FormattedMessage {...taskDetailViewMessages.descriptionLabel} />
          </Label>
          <Textarea
            id="task-edit-description"
            placeholder={intl.formatMessage(m.taskDescriptionPlaceholder)}
            rows={4}
            {...register('description')}
          />
        </Stack>

        {canEditBudgetDirect && (
          <Stack gap={2}>
            <Label color="primary" htmlFor="task-edit-budget">
              <FormattedMessage {...m.budgetLabel} values={{ currency }} />
            </Label>
            <Controller
              control={control}
              name="budget"
              render={({ field }) => (
                <CurrencyInput
                  currency={currency}
                  id="task-edit-budget"
                  value={field.value}
                  onValueChange={(details) => field.onChange(details.value)}
                  aria-invalid={!!errors.budget}
                />
              )}
            />
            {errors.budget && (
              <Text size="sm" color="error">
                {errors.budget.message}
              </Text>
            )}
          </Stack>
        )}
      </Stack>
    </FormDrawer>
  )
}
