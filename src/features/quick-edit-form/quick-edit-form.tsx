import { SimpleGrid, Stack } from '@chakra-ui/react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { FormattedMessage, useIntl, type MessageDescriptor } from 'react-intl'

import {
  commonMessages,
  Button,
  FormDrawer,
  Label,
  Select,
  Text,
} from '@/components'
import { Combobox } from '@/components/ui/combobox/combobox'
import { DateInput } from '@/components/ui/date-input'
import { Input } from '@/components/ui/input'
import { UNASSIGNED } from '@/constants'
import { useAssignableOptions } from '@/hooks/use-assignable-options/use-assignable-options'
import { useZodResolverIntl } from '@/i18n'
import {
  quickEditSchema,
  taskValidationMessages,
  type QuickEditFormValues,
} from '@/schemas'
import { priorityMessages } from '@/utils'

import { quickEditMessages as m } from './quick-edit-form-messages'

/**
 * The dirty fields of a quick edit; `assigneeId: null` clears the assignee.
 * Dates are only ever *set*, never cleared — the subtask contract keeps a
 * stored date when the field is omitted, and has no way to erase one.
 */
export interface QuickEditPatch {
  title?: string
  priority?: QuickEditFormValues['priority']
  assigneeId?: string | null
  startDate?: string
  dueDate?: string
}

export interface QuickEditFormProps {
  /** Current domain values; `assigneeId` may be null for unassigned. */
  values: {
    title: string
    assigneeId: string | null
    priority: QuickEditFormValues['priority']
    startDate?: string | null
    dueDate?: string | null
  }
  /**
   * Whether this surface edits dates. Only the subtask wrapper turns it on:
   * phase dates are derived from the subactivities and are not editable.
   */
  withDates?: boolean
  projectId: string
  /** DOM id prefix, e.g. "task-quick" — keeps both surfaces' ids distinct. */
  idPrefix: string
  titlePlaceholder: MessageDescriptor
  successMessage: MessageDescriptor
  errorMessage: MessageDescriptor
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (patch: QuickEditPatch) => Promise<unknown>
}

/** One quick-edit surface for tasks and subtasks — the wrappers own the mutations. */
export function QuickEditForm({
  values,
  withDates = false,
  projectId,
  idPrefix,
  titlePlaceholder,
  successMessage,
  errorMessage,
  open,
  onOpenChange,
  onSave,
}: QuickEditFormProps) {
  const intl = useIntl()
  // `workAssignableOnly`: an assignee goes through the narrower gate than the
  // jefe de obra does, and the wide rows the endpoint also returns would 400.
  const { options: assignableOptions, renderOption } = useAssignableOptions(
    projectId,
    { skip: !open, workAssignableOnly: true },
  )

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<QuickEditFormValues>({
    resolver: useZodResolverIntl(quickEditSchema, taskValidationMessages),
    values: {
      title: values.title,
      assigneeId: values.assigneeId ?? UNASSIGNED,
      priority: values.priority,
      startDate: values.startDate ?? '',
      dueDate: values.dueDate ?? '',
    },
    mode: 'onChange',
  })

  const onSubmit = async (data: QuickEditFormValues) => {
    const titleChanged = data.title !== values.title
    const priorityChanged = data.priority !== values.priority
    const nextAssignee = data.assigneeId === UNASSIGNED ? null : data.assigneeId
    const assigneeChanged = nextAssignee !== values.assigneeId
    // An emptied field is "keep", not "clear" — the contract cannot erase a date.
    const startChanged =
      withDates &&
      !!data.startDate &&
      data.startDate !== (values.startDate ?? '')
    const dueChanged =
      withDates && !!data.dueDate && data.dueDate !== (values.dueDate ?? '')

    try {
      if (
        titleChanged ||
        priorityChanged ||
        assigneeChanged ||
        startChanged ||
        dueChanged
      ) {
        await onSave({
          title: titleChanged ? data.title : undefined,
          priority: priorityChanged ? data.priority : undefined,
          ...(assigneeChanged ? { assigneeId: nextAssignee } : {}),
          ...(startChanged ? { startDate: data.startDate } : {}),
          ...(dueChanged ? { dueDate: data.dueDate } : {}),
        })
      }
      toast.success(intl.formatMessage(successMessage), {
        id: successMessage.id,
      })
      onOpenChange(false)
    } catch {
      toast.error(intl.formatMessage(errorMessage), { id: errorMessage.id })
    }
  }

  return (
    <FormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={intl.formatMessage(m.quickEditTitle)}
      description={intl.formatMessage(m.quickEditDescription, {
        name: values.title,
      })}
      onSubmit={handleSubmit(onSubmit)}
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            <FormattedMessage {...commonMessages.cancel} />
          </Button>
          <Button type="submit" disabled={isSubmitting || !isValid}>
            {isSubmitting ? (
              <FormattedMessage {...commonMessages.saving} />
            ) : (
              <FormattedMessage {...m.save} />
            )}
          </Button>
        </>
      }
    >
      <Stack gap="field">
        <Stack gap={2}>
          <Label htmlFor={`${idPrefix}-title`}>
            <FormattedMessage {...m.titleLabel} />
          </Label>
          <Input
            id={`${idPrefix}-title`}
            placeholder={intl.formatMessage(titlePlaceholder)}
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
          <Label htmlFor={`${idPrefix}-assignee`}>
            <FormattedMessage {...m.assigneeLabel} />
          </Label>
          <Controller
            control={control}
            name="assigneeId"
            render={({ field }) => (
              <Combobox
                id={`${idPrefix}-assignee`}
                value={field.value}
                onValueChange={field.onChange}
                placeholder={intl.formatMessage(m.unassigned)}
                renderOption={renderOption}
                options={[
                  {
                    value: UNASSIGNED,
                    label: intl.formatMessage(m.unassigned),
                    roleSlug: null,
                    isProjectMember: true,
                  },
                  ...assignableOptions,
                ]}
              />
            )}
          />
        </Stack>

        {withDates && (
          <SimpleGrid columns={{ base: 1, sm: 2 }} gap={4}>
            <Stack gap={2}>
              <Label htmlFor={`${idPrefix}-start-date`}>
                <FormattedMessage {...m.startDateLabel} />
              </Label>
              <Controller
                control={control}
                name="startDate"
                render={({ field }) => (
                  <DateInput
                    id={`${idPrefix}-start-date`}
                    value={field.value}
                    onValueChange={field.onChange}
                  />
                )}
              />
            </Stack>
            <Stack gap={2}>
              <Label htmlFor={`${idPrefix}-due-date`}>
                <FormattedMessage {...m.dueDateLabel} />
              </Label>
              <Controller
                control={control}
                name="dueDate"
                render={({ field }) => (
                  <DateInput
                    id={`${idPrefix}-due-date`}
                    value={field.value}
                    onValueChange={field.onChange}
                    invalid={!!errors.dueDate}
                  />
                )}
              />
              {errors.dueDate && (
                <Text size="sm" color="error">
                  {errors.dueDate.message}
                </Text>
              )}
            </Stack>
          </SimpleGrid>
        )}

        <Stack gap={2}>
          <Label htmlFor={`${idPrefix}-priority`}>
            <FormattedMessage {...m.priorityLabel} />
          </Label>
          <Controller
            control={control}
            name="priority"
            render={({ field }) => (
              <Select
                id={`${idPrefix}-priority`}
                value={field.value}
                onChange={(v) =>
                  field.onChange(v as QuickEditFormValues['priority'])
                }
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
        </Stack>
      </Stack>
    </FormDrawer>
  )
}
