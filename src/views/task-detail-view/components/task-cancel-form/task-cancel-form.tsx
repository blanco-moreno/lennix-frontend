import { Stack } from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { FormattedMessage, useIntl } from 'react-intl'

import { Modal, FormField, ModalFormFooter, Select, Text } from '@/components'
import { useDelayReasonLabel } from '@/hooks'
import {
  DELAY_REASONS,
  taskStatusSchema,
  type TaskStatusFormValues,
} from '@/schemas'
import { useUpdateTaskStatusMutation } from '@/services/task'
import type { TaskStatus } from '@/types'

import { taskDetailViewMessages } from '../../task-detail-view-messages'

import { taskCancelModalMessages as m } from './task-cancel-form-messages'

interface TaskCancelFormProps {
  taskId: string
  taskTitle: string
  /** The obra this activity belongs to — names the drawer's context. */
  projectName: string | null
  currentStatus: TaskStatus
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Cancel — or reopen — an activity. Not a status picker: status is derived from
 * subtask progress, so only the stop/undo transition is offered. The reason is
 * a closed set — the backend types `delay_reason` as the `DelayReason` enum.
 */
export function TaskCancelForm({
  taskId,
  taskTitle,
  projectName,
  currentStatus,
  open,
  onOpenChange,
}: TaskCancelFormProps) {
  const intl = useIntl()
  const delayReasonLabel = useDelayReasonLabel()
  const [updateStatus, { isLoading }] = useUpdateTaskStatusMutation()

  const isCancelled = currentStatus === 'cancelled'

  const { control, handleSubmit, reset } = useForm<TaskStatusFormValues>({
    resolver: zodResolver(taskStatusSchema),
    defaultValues: { status: 'cancelled', delayReason: null },
    mode: 'onChange',
  })

  const onSubmit = async (data: TaskStatusFormValues) => {
    try {
      await updateStatus({
        id: taskId,
        body: isCancelled
          ? // Reopening needs no reason, and must not keep the one that
            // explained the cancellation. CANCELLED → TODO is the only reopen
            // edge the backend allows from here.
            { status: 'todo', delay_reason: null }
          : { status: 'cancelled', delay_reason: data.delayReason },
      }).unwrap()
      toast.success(
        intl.formatMessage(
          isCancelled
            ? taskDetailViewMessages.reopenSuccess
            : taskDetailViewMessages.cancelTaskSuccess,
        ),
        { id: taskDetailViewMessages.statusUpdateSuccess.id },
      )
      onOpenChange(false)
    } catch {
      toast.error(
        intl.formatMessage(taskDetailViewMessages.statusUpdateError),
        {
          id: taskDetailViewMessages.statusUpdateError.id,
        },
      )
    }
  }

  const handleOpenChange = (next: boolean) => {
    if (next) reset({ status: 'cancelled', delayReason: null })
    onOpenChange(next)
  }

  return (
    <Modal
      open={open}
      onOpenChange={handleOpenChange}
      title={intl.formatMessage(
        isCancelled
          ? taskDetailViewMessages.reopenModalTitle
          : taskDetailViewMessages.cancelModalTitle,
      )}
      description={intl.formatMessage(
        isCancelled ? m.reopenModalDescription : m.cancelModalDescription,
        { name: taskTitle, project: projectName ?? '—' },
      )}
      onSubmit={handleSubmit(onSubmit)}
      footer={
        <ModalFormFooter
          submitLabel={
            isCancelled
              ? taskDetailViewMessages.reopenConfirm
              : taskDetailViewMessages.cancelConfirm
          }
          isLoading={isLoading}
          onCancel={() => handleOpenChange(false)}
        />
      }
    >
      {isCancelled ? (
        <Text size="sm" color="muted">
          <FormattedMessage {...m.reopenExplanation} />
        </Text>
      ) : (
        <Stack gap="field">
          <Text size="sm" color="muted">
            <FormattedMessage {...m.cancelExplanation} />
          </Text>
          <FormField
            htmlFor="task-cancel-reason"
            label={<FormattedMessage {...m.cancelReasonLabel} />}
          >
            <Controller
              control={control}
              name="delayReason"
              render={({ field }) => (
                <Select
                  id="task-cancel-reason"
                  value={field.value ?? ''}
                  onChange={(v) => field.onChange(v === '' ? null : v)}
                  options={[
                    {
                      value: '',
                      label: intl.formatMessage(m.cancelReasonNone),
                    },
                    ...DELAY_REASONS.map((reason) => ({
                      value: reason,
                      label: delayReasonLabel(reason),
                    })),
                  ]}
                />
              )}
            />
          </FormField>
        </Stack>
      )}
    </Modal>
  )
}
