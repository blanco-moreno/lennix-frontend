import { Flex, Icon, SimpleGrid, Stack } from '@chakra-ui/react'
import { CheckCircle2 } from 'lucide-react'
import { useEffect } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import toast from 'react-hot-toast'
import { FormattedMessage, useIntl } from 'react-intl'

import {
  FormDrawer,
  FormField,
  ModalFormFooter,
  Select,
  Text,
} from '@/components'
import { Combobox } from '@/components/ui/combobox/combobox'
import { CurrencyInput } from '@/components/ui/currency-input'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { UNASSIGNED } from '@/constants'
import { usePriorityLabel } from '@/hooks'
import { useAssignableOptions } from '@/hooks/use-assignable-options/use-assignable-options'
import { useZodResolverIntl } from '@/i18n'
import {
  taskCreateSchema,
  taskValidationMessages,
  type TaskCreateFormValues,
} from '@/schemas'
import type { ApiError } from '@/services'
import { useCreateTaskMutation } from '@/services/task'
import type { SubtaskInputDTO } from '@/types/dto/subtask-dto'
import { formatMoney, parseMoney, serializeMoneyForApi } from '@/utils'

import { taskCreateMessages as m } from './task-create-messages'

interface TaskCreateDrawerProps {
  /** The activity is always created inside a known project's schedule. */
  projectId: string
  /** Named in the drawer subtitle so it is clear which project this adds to. */
  projectName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

// The project is fixed by the surface, so it is not a form field.
const DEFAULTS: Omit<TaskCreateFormValues, 'projectId'> = {
  name: '',
  description: '',
  priority: 'medium',
  budget: '',
  assigneeId: UNASSIGNED,
  location: '',
}

/**
 * Create a main activity from a project's schedule surface. Replaces the old
 * `/tasks/new` page — same POST, side surface instead of a full route.
 *
 * A phase owns name/description/priority/budget. Its dates are never asked here:
 * they roll up from the subactivities. Responsible and location have no home on
 * the phase either, so when given we send a first real subactivity carrying
 * them — otherwise the backend seeds an empty placeholder.
 */
export function TaskCreateDrawer({
  projectId,
  projectName,
  open,
  onOpenChange,
}: TaskCreateDrawerProps) {
  const intl = useIntl()
  const priorityLabel = usePriorityLabel()
  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation()
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
    reset,
    formState: { errors },
  } = useForm<TaskCreateFormValues>({
    resolver: useZodResolverIntl(taskCreateSchema, taskValidationMessages),
    defaultValues: { ...DEFAULTS, projectId },
    mode: 'onChange',
  })

  useEffect(() => {
    if (open) reset({ ...DEFAULTS, projectId })
  }, [open, projectId, reset])

  const budget = parseMoney(useWatch({ control, name: 'budget' }))

  const onSubmit = async (data: TaskCreateFormValues) => {
    const assigneeId =
      data.assigneeId && data.assigneeId !== UNASSIGNED ? data.assigneeId : null
    const description = data.description?.trim() || null
    const location = data.location?.trim() || null

    // Only carry a first subactivity when the user named a responsible or a
    // location; otherwise let the backend seed its own placeholder.
    const hasFirstSubactivity = Boolean(assigneeId || location)
    const subtasks: SubtaskInputDTO[] | undefined = hasFirstSubactivity
      ? [
          {
            title: data.name,
            description,
            priority: data.priority,
            location,
            assignee_id: assigneeId,
          },
        ]
      : undefined

    try {
      await createTask({
        projectId,
        body: {
          title: data.name,
          description,
          priority: data.priority,
          budget:
            parseMoney(data.budget) > 0
              ? serializeMoneyForApi(data.budget)
              : null,
          is_draft: false,
          subtasks,
        },
      }).unwrap()
      toast.success(intl.formatMessage(m.createSuccessToast), {
        id: m.createSuccessToast.id,
      })
      onOpenChange(false)
    } catch (error) {
      toast.error(
        (error as ApiError).message ?? intl.formatMessage(m.createErrorToast),
        { id: m.createErrorToast.id },
      )
    }
  }

  return (
    <FormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={intl.formatMessage(m.title)}
      description={intl.formatMessage(m.subtitle, { project: projectName })}
      onSubmit={handleSubmit(onSubmit)}
      footer={
        <ModalFormFooter
          submitLabel={m.submit}
          isLoading={isCreating}
          onCancel={() => onOpenChange(false)}
        />
      }
    >
      <Stack gap="field">
        <FormField
          htmlFor="task-name"
          label={<FormattedMessage {...m.nameLabel} />}
          error={errors.name?.message}
        >
          <Input
            id="task-name"
            placeholder={intl.formatMessage(m.namePlaceholder)}
            aria-invalid={!!errors.name}
            {...register('name')}
          />
        </FormField>

        <FormField
          htmlFor="task-description"
          label={<FormattedMessage {...m.descriptionLabel} />}
          error={errors.description?.message}
        >
          <Textarea
            id="task-description"
            rows={3}
            resize="none"
            placeholder={intl.formatMessage(m.descriptionPlaceholder)}
            aria-invalid={!!errors.description}
            {...register('description')}
          />
        </FormField>

        <SimpleGrid columns={{ base: 1, sm: 2 }} gap={4}>
          <FormField
            htmlFor="task-priority"
            label={<FormattedMessage {...m.priorityLabel} />}
            error={errors.priority?.message}
          >
            <Controller
              control={control}
              name="priority"
              render={({ field }) => (
                <Select
                  id="task-priority"
                  value={field.value}
                  onChange={field.onChange}
                  invalid={!!errors.priority}
                  options={[
                    { value: 'low', label: priorityLabel('low') },
                    { value: 'medium', label: priorityLabel('medium') },
                    { value: 'high', label: priorityLabel('high') },
                  ]}
                />
              )}
            />
          </FormField>

          <FormField
            htmlFor="task-budget"
            label={<FormattedMessage {...m.budgetLabel} />}
            error={errors.budget?.message}
          >
            <Controller
              control={control}
              name="budget"
              render={({ field }) => (
                <CurrencyInput
                  id="task-budget"
                  value={field.value}
                  onValueChange={(details) => field.onChange(details.value)}
                  aria-invalid={!!errors.budget}
                />
              )}
            />
          </FormField>
        </SimpleGrid>

        {budget > 0 && (
          <Flex color="success" alignItems="center" gap={2} fontSize="sm">
            <Icon as={CheckCircle2} boxSize={4} />
            <Text as="span" weight="medium">
              <FormattedMessage
                {...m.budgetSummary}
                values={{ amount: formatMoney(budget) }}
              />
            </Text>
          </Flex>
        )}

        <FormField
          htmlFor="task-assignee"
          label={<FormattedMessage {...m.assigneeLabel} />}
        >
          <Controller
            control={control}
            name="assigneeId"
            render={({ field }) => (
              <Combobox
                id="task-assignee"
                value={field.value}
                onValueChange={field.onChange}
                placeholder={intl.formatMessage(m.assigneeUnassigned)}
                renderOption={renderOption}
                options={[
                  {
                    value: UNASSIGNED,
                    label: intl.formatMessage(m.assigneeUnassigned),
                    roleSlug: null,
                    isProjectMember: true,
                  },
                  ...assignableOptions,
                ]}
              />
            )}
          />
        </FormField>

        <FormField
          htmlFor="task-location"
          label={<FormattedMessage {...m.locationLabel} />}
        >
          <Input
            id="task-location"
            placeholder={intl.formatMessage(m.locationPlaceholder)}
            {...register('location')}
          />
        </FormField>
      </Stack>
    </FormDrawer>
  )
}
