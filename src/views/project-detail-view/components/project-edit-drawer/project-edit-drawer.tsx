import { Box, Stack } from '@chakra-ui/react'
import { MapPin } from 'lucide-react'
import { useEffect } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import toast from 'react-hot-toast'
import { FormattedMessage, useIntl, type MessageDescriptor } from 'react-intl'

import {
  CurrencySelect,
  FormDrawer,
  FormField,
  Label,
  ModalFormFooter,
  Select,
  Text,
} from '@/components'
import { CurrencyInput } from '@/components/ui/currency-input'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { usePermission } from '@/hooks'
import { useZodResolverIntl } from '@/i18n'
import {
  budgetApprovalValidationMessages,
  projectEditSchema,
  projectValidationMessages,
  type ProjectEditFormValues,
} from '@/schemas'
import { useCreateBudgetApprovalMutation } from '@/services/budget-approval'
import {
  useUpdateProjectBudgetMutation,
  useUpdateProjectMutation,
  useUpdateProjectPriorityMutation,
} from '@/services/project'
import type { Project, ProjectPriority } from '@/types'
import type { ProjectUpdateRequestDTO } from '@/types/dto/project-dto'
import {
  budgetApprovalsMessages,
  priorityMessages,
  serializeMoneyForApi,
} from '@/utils'

import { ProjectManagerField } from '../project-manager-field'

import { projectEditModalMessages as m } from './project-edit-drawer-messages'

interface ProjectEditDrawerProps {
  project: Project
  open: boolean
  onOpenChange: (open: boolean) => void
}

const PRIORITY_OPTIONS: { value: ProjectPriority; label: MessageDescriptor }[] =
  [
    { value: 'low', label: priorityMessages.low },
    { value: 'medium', label: priorityMessages.medium },
    { value: 'high', label: priorityMessages.high },
  ]

export function ProjectEditDrawer({
  project,
  open,
  onOpenChange,
}: ProjectEditDrawerProps) {
  const intl = useIntl()
  const canEditProject = usePermission('project.edit')
  const canChangePriority = usePermission('project.changePriority')
  const canBudgetDirect = usePermission('budget.edit.direct')
  const canBudgetRequest = usePermission('budget.edit.request')
  const canEditBudget = canBudgetDirect || canBudgetRequest

  const [updateProject] = useUpdateProjectMutation()
  const [updatePriority] = useUpdateProjectPriorityMutation()
  const [updateBudget] = useUpdateProjectBudgetMutation()
  const [createBudgetRequest] = useCreateBudgetApprovalMutation()

  const defaults = (): ProjectEditFormValues => ({
    name: project.name,
    description: project.description,
    location: project.location,
    managerId: project.managerId ?? '',
    priority: project.priority,
    budget: project.budget !== null ? String(project.budget) : '',
    currency: project.currency,
    budgetReason: '',
  })

  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProjectEditFormValues>({
    resolver: useZodResolverIntl(projectEditSchema, projectValidationMessages),
    defaultValues: defaults(),
    mode: 'onChange',
  })
  const currency = useWatch({ control, name: 'currency' })

  useEffect(() => {
    if (open) reset(defaults())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, project, reset])

  const onSubmit = async (data: ProjectEditFormValues) => {
    const budgetChanged =
      canEditBudget &&
      data.budget.trim() !== '' &&
      serializeMoneyForApi(data.budget) !==
        (project.budget !== null
          ? serializeMoneyForApi(String(project.budget))
          : null)

    if (budgetChanged && !canBudgetDirect && data.budgetReason.trim() === '') {
      setError('budgetReason', {
        message: intl.formatMessage(
          budgetApprovalValidationMessages.reasonRequired,
        ),
      })
      return
    }

    // Runs one mutation per touched surface, in sequence, so a failure can
    // say exactly whether anything was already applied.
    let savedSomething = false
    try {
      if (canEditProject) {
        const body: ProjectUpdateRequestDTO = {
          name: data.name,
          description: data.description,
          location: data.location,
        }
        // Only send a handover the user actually made. The API applies
        // `manager_id` whenever it arrives non-null and has no way to clear
        // one, so re-sending the current manager is noise and an empty value
        // is not a request to unassign.
        if (data.managerId && data.managerId !== project.managerId) {
          body.manager_id = data.managerId
        }
        // Relabelling the currency is a budget decision (`BUD-10`): only the
        // roles that edit the budget directly see the picker.
        if (canBudgetDirect && data.currency !== project.currency) {
          body.currency = data.currency
        }
        await updateProject({ id: project.id, body }).unwrap()
        savedSomething = true
      }
      if (canChangePriority && data.priority !== project.priority) {
        await updatePriority({
          id: project.id,
          body: { priority: data.priority },
        }).unwrap()
        savedSomething = true
      }
    } catch {
      toast.error(
        intl.formatMessage(
          savedSomething ? m.updatePartialError : m.updateError,
        ),
        { id: m.updateError.id },
      )
      return
    }

    let budgetRequested = false
    if (budgetChanged) {
      try {
        if (canBudgetDirect) {
          await updateBudget({
            id: project.id,
            body: { budget: serializeMoneyForApi(data.budget) },
          }).unwrap()
          savedSomething = true
        } else {
          await createBudgetRequest({
            targetType: 'project',
            targetId: project.id,
            requestedAmount: serializeMoneyForApi(data.budget),
            reason: data.budgetReason.trim(),
          }).unwrap()
          budgetRequested = true
        }
      } catch {
        toast.error(
          intl.formatMessage(
            savedSomething
              ? m.updatePartialError
              : canBudgetDirect
                ? m.updateError
                : budgetApprovalsMessages.requestCreateError,
          ),
          { id: m.updateError.id },
        )
        return
      }
    }

    if (budgetRequested) {
      // The other fields applied but the budget did NOT change yet — say so.
      toast.success(
        intl.formatMessage(
          savedSomething
            ? m.savedBudgetPending
            : budgetApprovalsMessages.requestCreateSuccess,
        ),
        { id: m.updateSuccess.id },
      )
    } else {
      toast.success(intl.formatMessage(m.updateSuccess), {
        id: m.updateSuccess.id,
      })
    }
    onOpenChange(false)
  }

  return (
    <FormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={intl.formatMessage(m.editModalTitle)}
      description={intl.formatMessage(m.editModalDescription, {
        project: project.name,
      })}
      onSubmit={handleSubmit(onSubmit)}
      footer={
        <ModalFormFooter
          submitLabel={m.editModalSubmit}
          isLoading={isSubmitting}
          onCancel={() => onOpenChange(false)}
        />
      }
    >
      <Stack gap="field">
        {canEditProject && (
          <>
            <Stack gap={2}>
              <Label
                color="primary"
                fontSize="sm"
                fontWeight="medium"
                htmlFor="project-name"
              >
                <FormattedMessage {...m.projectNameLabel} />{' '}
                <Text as="span" color="error">
                  *
                </Text>
              </Label>
              <Input
                id="project-name"
                placeholder={intl.formatMessage(m.projectNamePlaceholder)}
                aria-invalid={!!errors.name}
                {...register('name')}
              />
              {errors.name && (
                <Text size="sm" color="error">
                  {errors.name.message}
                </Text>
              )}
            </Stack>

            <Stack gap={2}>
              <Label
                color="primary"
                fontSize="sm"
                fontWeight="medium"
                htmlFor="project-description"
              >
                <FormattedMessage {...m.projectDescriptionLabel} />
              </Label>
              <Textarea
                id="project-description"
                minH="90px"
                resize="none"
                placeholder={intl.formatMessage(
                  m.projectDescriptionPlaceholder,
                )}
                {...register('description')}
              />
            </Stack>

            <Stack gap={2}>
              <Label
                color="primary"
                gap={1.5}
                fontSize="sm"
                fontWeight="medium"
                htmlFor="project-location"
              >
                <Box as={MapPin} boxSize={3.5} />
                <FormattedMessage {...m.projectLocationLabel} />
              </Label>
              <Input
                id="project-location"
                placeholder={intl.formatMessage(m.projectLocationPlaceholder)}
                {...register('location')}
              />
            </Stack>

            {/* Who runs the obra is a project attribute, not a membership row —
                that is why it lives here and not on the Team tab. */}
            <Controller
              control={control}
              name="managerId"
              render={({ field }) => (
                <ProjectManagerField
                  projectId={project.id}
                  value={field.value}
                  onChange={field.onChange}
                  currentManagerId={project.managerId}
                  currentManagerName={project.managerName}
                />
              )}
            />
          </>
        )}

        {canChangePriority && (
          <FormField
            htmlFor="project-priority"
            label={intl.formatMessage(m.priorityLabel)}
          >
            <Controller
              control={control}
              name="priority"
              render={({ field }) => (
                <Select
                  id="project-priority"
                  value={field.value}
                  onChange={(v) => field.onChange(v as ProjectPriority)}
                  options={PRIORITY_OPTIONS.map((opt) => ({
                    value: opt.value,
                    label: intl.formatMessage(opt.label),
                  }))}
                />
              )}
            />
          </FormField>
        )}

        {canEditBudget && (
          <>
            {canBudgetDirect && (
              <FormField
                htmlFor="project-currency"
                label={<FormattedMessage {...m.currencyFieldLabel} />}
              >
                <Controller
                  control={control}
                  name="currency"
                  render={({ field }) => (
                    <CurrencySelect
                      id="project-currency"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                <Text size="xs" color="muted">
                  <FormattedMessage {...m.currencyFieldHint} />
                </Text>
              </FormField>
            )}
            <FormField
              htmlFor="project-budget"
              label={
                <FormattedMessage
                  {...m.budgetFieldLabel}
                  values={{ currency }}
                />
              }
              error={errors.budget?.message}
            >
              <Controller
                control={control}
                name="budget"
                render={({ field }) => (
                  <CurrencyInput
                    id="project-budget"
                    currency={currency}
                    value={field.value}
                    onValueChange={(details) => field.onChange(details.value)}
                    aria-invalid={!!errors.budget}
                  />
                )}
              />
            </FormField>
            {!canBudgetDirect && (
              <>
                <Text size="sm" color="muted">
                  <FormattedMessage {...m.budgetRequestNotice} />
                </Text>
                <FormField
                  htmlFor="project-budget-reason"
                  label={
                    <FormattedMessage
                      {...budgetApprovalsMessages.requestReasonLabel}
                    />
                  }
                  error={errors.budgetReason?.message}
                >
                  <Textarea
                    id="project-budget-reason"
                    rows={3}
                    placeholder={intl.formatMessage(
                      budgetApprovalsMessages.requestReasonPlaceholder,
                    )}
                    aria-invalid={!!errors.budgetReason}
                    {...register('budgetReason')}
                  />
                </FormField>
              </>
            )}
          </>
        )}
      </Stack>
    </FormDrawer>
  )
}
