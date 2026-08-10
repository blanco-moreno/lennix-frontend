import { SimpleGrid, Stack } from '@chakra-ui/react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { FormattedMessage, useIntl } from 'react-intl'

import { FormDrawer, FormField, ModalFormFooter, Select } from '@/components'
import { DateInput } from '@/components/ui/date-input'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useZodResolverIntl } from '@/i18n'
import {
  subtaskCreateSchema,
  taskValidationMessages,
  type SubtaskCreateFormValues,
} from '@/schemas'
import { useCreateSubtaskMutation } from '@/services/task'
import { priorityMessages } from '@/utils'

import { taskDetailViewMessages } from '../../task-detail-view-messages'
import { taskOverviewTabMessages } from '../task-overview-tab/task-overview-tab-messages'

import { subtaskCreateModalMessages as m } from './subtask-create-form-messages'

interface SubtaskCreateFormProps {
  taskId: string
  /** The main activity this subactivity hangs off — names the drawer context. */
  parentTitle: string
  projectId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SubtaskCreateForm({
  taskId,
  parentTitle,
  projectId,
  open,
  onOpenChange,
}: SubtaskCreateFormProps) {
  const intl = useIntl()
  const [createSubtask, { isLoading }] = useCreateSubtaskMutation()

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<SubtaskCreateFormValues>({
    resolver: useZodResolverIntl(subtaskCreateSchema, taskValidationMessages),
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
      startDate: '',
      dueDate: '',
    },
    mode: 'onChange',
  })

  const onSubmit = async (data: SubtaskCreateFormValues) => {
    try {
      await createSubtask({
        taskId,
        projectId,
        body: {
          title: data.title.trim(),
          description: data.description.trim() || null,
          priority: data.priority,
          start_date: data.startDate || null,
          due_date: data.dueDate || null,
        },
      }).unwrap()
      toast.success(intl.formatMessage(m.subtaskCreateSuccess), {
        id: m.subtaskCreateSuccess.id,
      })
      reset()
      onOpenChange(false)
    } catch {
      toast.error(intl.formatMessage(m.subtaskCreateError), {
        id: m.subtaskCreateError.id,
      })
    }
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) reset()
    onOpenChange(next)
  }

  return (
    <FormDrawer
      open={open}
      onOpenChange={handleOpenChange}
      title={intl.formatMessage(m.subtaskCreateTitle)}
      description={intl.formatMessage(m.subtaskCreateDescription, {
        parent: parentTitle,
      })}
      onSubmit={handleSubmit(onSubmit)}
      footer={
        <ModalFormFooter
          submitLabel={m.create}
          isLoading={isLoading}
          submitDisabled={!isValid}
          onCancel={() => handleOpenChange(false)}
        />
      }
    >
      <Stack gap="field">
        <FormField
          htmlFor="subtask-title"
          label={<FormattedMessage {...m.titleLabel} />}
          error={errors.title?.message}
        >
          <Input
            id="subtask-title"
            placeholder={intl.formatMessage(m.subtaskCreateTitlePlaceholder)}
            aria-invalid={!!errors.title}
            {...register('title')}
          />
        </FormField>

        <FormField
          htmlFor="subtask-description"
          label={
            <FormattedMessage {...taskDetailViewMessages.descriptionLabel} />
          }
        >
          <Textarea
            id="subtask-description"
            placeholder={intl.formatMessage(
              m.subtaskCreateDescriptionPlaceholder,
            )}
            rows={2}
            {...register('description')}
          />
        </FormField>

        <SimpleGrid columns={{ base: 1, sm: 2 }} gap={4}>
          <FormField
            htmlFor="subtask-start-date"
            label={
              <FormattedMessage {...taskOverviewTabMessages.startDateLabel} />
            }
          >
            <Controller
              control={control}
              name="startDate"
              render={({ field }) => (
                <DateInput
                  id="subtask-start-date"
                  value={field.value}
                  onValueChange={field.onChange}
                />
              )}
            />
          </FormField>
          <FormField
            htmlFor="subtask-due-date"
            label={
              <FormattedMessage {...taskOverviewTabMessages.dueDateLabel} />
            }
            error={errors.dueDate?.message}
          >
            <Controller
              control={control}
              name="dueDate"
              render={({ field }) => (
                <DateInput
                  id="subtask-due-date"
                  value={field.value}
                  onValueChange={field.onChange}
                  invalid={!!errors.dueDate}
                />
              )}
            />
          </FormField>
        </SimpleGrid>

        <FormField
          htmlFor="subtask-priority"
          label={<FormattedMessage {...taskDetailViewMessages.priorityLabel} />}
        >
          <Controller
            control={control}
            name="priority"
            render={({ field }) => (
              <Select
                id="subtask-priority"
                value={field.value}
                onChange={field.onChange}
                options={[
                  {
                    value: 'low',
                    label: intl.formatMessage(priorityMessages.low),
                  },
                  {
                    value: 'medium',
                    label: intl.formatMessage(priorityMessages.medium),
                  },
                  {
                    value: 'high',
                    label: intl.formatMessage(priorityMessages.high),
                  },
                ]}
              />
            )}
          />
        </FormField>
      </Stack>
    </FormDrawer>
  )
}
