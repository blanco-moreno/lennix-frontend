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
import { useUpdateSubtaskStatusMutation } from '@/services/task'
import type { Subtask, SubtaskStatus } from '@/types'

import { taskDetailViewMessages } from '../../task-detail-view-messages'
import { subtaskPanelMessages as m } from '../subtask-panel/subtask-panel-messages'
import { taskCancelModalMessages as cancel } from '../task-cancel-form/task-cancel-form-messages'

interface SubtaskCancelFormProps {
  subtask: Subtask
  projectId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Cancel — or reopen — a subactivity, as a drawer at its own level. The reason
 * is the same closed `DelayReason` set the phase uses; the subtask status
 * endpoint accepts `delay_reason` too.
 */
export function SubtaskCancelForm({
  subtask,
  projectId,
  open,
  onOpenChange,
}: SubtaskCancelFormProps) {
  const intl = useIntl()
  const delayReasonLabel = useDelayReasonLabel()
  const [updateStatus, { isLoading }] = useUpdateSubtaskStatusMutation()

  const isCancelled = subtask.status === 'cancelled'

  const { control, handleSubmit, reset } = useForm<TaskStatusFormValues>({
    resolver: zodResolver(taskStatusSchema),
    defaultValues: { status: 'cancelled', delayReason: null },
    mode: 'onChange',
  })

  const onSubmit = async (data: TaskStatusFormValues) => {
    try {
      await updateStatus({
        id: subtask.id,
        projectId,
        body: isCancelled
          ? { status: 'todo' as SubtaskStatus, delay_reason: null }
          : {
              status: 'cancelled' as SubtaskStatus,
              delay_reason: data.delayReason,
            },
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
        isCancelled ? m.subtaskReopenDialogTitle : m.subtaskCancelDialogTitle,
      )}
      description={intl.formatMessage(
        isCancelled
          ? m.subtaskReopenDialogDescription
          : m.subtaskCancelDialogDescription,
        { name: subtask.title },
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
          <FormattedMessage {...cancel.reopenExplanation} />
        </Text>
      ) : (
        <Stack gap="field">
          <Text size="sm" color="muted">
            <FormattedMessage {...cancel.cancelExplanation} />
          </Text>
          <FormField
            htmlFor="subtask-cancel-reason"
            label={<FormattedMessage {...cancel.cancelReasonLabel} />}
          >
            <Controller
              control={control}
              name="delayReason"
              render={({ field }) => (
                <Select
                  id="subtask-cancel-reason"
                  value={field.value ?? ''}
                  onChange={(v) => field.onChange(v === '' ? null : v)}
                  options={[
                    {
                      value: '',
                      label: intl.formatMessage(cancel.cancelReasonNone),
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
