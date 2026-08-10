import { SimpleGrid, Stack } from '@chakra-ui/react'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { FormattedMessage, useIntl } from 'react-intl'

import { Select, FormDrawer, FormField, ModalFormFooter } from '@/components'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useIntlToast, useZodResolverIntl } from '@/i18n'
import {
  riskFormSchema,
  riskValidationMessages,
  type RiskFormValues,
} from '@/schemas'
import { useCreateRiskMutation, useUpdateRiskMutation } from '@/services/risk'
import type { Risk, RiskLevel, RiskResponseStrategy, RiskStatus } from '@/types'

import { riskRegisterMessages as m } from '../../risk-register-messages'

interface RiskFormDrawerProps {
  projectId: string
  /** Named in the subtitle so it is clear which project the risk belongs to. */
  projectName: string
  /** The risk being edited, or `null` when creating. */
  risk: Risk | null
  /** Pre-filled title when the form opens from a suggestion. */
  initialTitle?: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

const EMPTY: RiskFormValues = {
  title: '',
  description: '',
  category: '',
  probability: 'medium',
  impact: 'medium',
  responseStrategy: '',
  mitigation: '',
  status: 'open',
}

function toFormValues(
  risk: Risk | null,
  initialTitle?: string,
): RiskFormValues {
  if (!risk) return { ...EMPTY, title: initialTitle ?? '' }
  return {
    title: risk.title,
    description: risk.description ?? '',
    category: risk.category ?? '',
    probability: risk.probability,
    impact: risk.impact,
    responseStrategy: risk.responseStrategy ?? '',
    mitigation: risk.mitigation ?? '',
    status: risk.status,
  }
}

/**
 * Create/edit form for one risk.
 *
 * `score` is never asked for or sent: the backend derives it from probability ×
 * impact, and a second place computing it is a second place to get it wrong.
 */
export function RiskFormDrawer({
  projectId,
  projectName,
  risk,
  initialTitle,
  open,
  onOpenChange,
}: RiskFormDrawerProps) {
  const intl = useIntl()
  const toast = useIntlToast()
  const [createRisk, { isLoading: isCreating }] = useCreateRiskMutation()
  const [updateRisk, { isLoading: isUpdating }] = useUpdateRiskMutation()
  const isLoading = isCreating || isUpdating

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RiskFormValues>({
    resolver: useZodResolverIntl(riskFormSchema, riskValidationMessages),
    defaultValues: toFormValues(risk, initialTitle),
  })

  // The modal instance is reused across rows, so the fields have to follow
  // whichever risk it was opened for.
  useEffect(() => {
    if (open) reset(toFormValues(risk, initialTitle))
  }, [open, risk, initialTitle, reset])

  const levelOptions = [
    { value: 'low', label: intl.formatMessage(m.levelLow) },
    { value: 'medium', label: intl.formatMessage(m.levelMedium) },
    { value: 'high', label: intl.formatMessage(m.levelHigh) },
  ]

  const onSubmit = async (values: RiskFormValues) => {
    const input = {
      title: values.title.trim(),
      description: values.description.trim() || null,
      category: values.category.trim() || null,
      probability: values.probability as RiskLevel,
      impact: values.impact as RiskLevel,
      responseStrategy:
        values.responseStrategy === ''
          ? null
          : (values.responseStrategy as RiskResponseStrategy),
      mitigation: values.mitigation.trim() || null,
      status: values.status as RiskStatus,
    }
    try {
      if (risk) {
        await updateRisk({ projectId, riskId: risk.id, input }).unwrap()
        toast.success(m.updateSuccess)
      } else {
        await createRisk({ projectId, input }).unwrap()
        toast.success(m.createSuccess)
      }
      onOpenChange(false)
    } catch {
      toast.error(m.saveError)
    }
  }

  return (
    <FormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={intl.formatMessage(risk ? m.formEditTitle : m.formCreateTitle)}
      description={intl.formatMessage(m.formDescription, {
        project: projectName,
      })}
      onSubmit={handleSubmit(onSubmit)}
      footer={
        <ModalFormFooter
          submitLabel={m.formSubmit}
          isLoading={isLoading}
          onCancel={() => onOpenChange(false)}
        />
      }
    >
      <Stack gap="field">
        <FormField
          htmlFor="risk-title"
          label={<FormattedMessage {...m.fieldTitle} />}
          error={
            errors.title?.message ? String(errors.title.message) : undefined
          }
        >
          <Input
            id="risk-title"
            placeholder={intl.formatMessage(m.fieldTitlePlaceholder)}
            aria-invalid={!!errors.title}
            {...register('title')}
          />
        </FormField>

        <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
          <FormField
            htmlFor="risk-probability"
            label={<FormattedMessage {...m.fieldProbability} />}
          >
            <Controller
              control={control}
              name="probability"
              render={({ field }) => (
                <Select
                  id="risk-probability"
                  value={field.value}
                  onChange={field.onChange}
                  options={levelOptions}
                />
              )}
            />
          </FormField>

          <FormField
            htmlFor="risk-impact"
            label={<FormattedMessage {...m.fieldImpact} />}
          >
            <Controller
              control={control}
              name="impact"
              render={({ field }) => (
                <Select
                  id="risk-impact"
                  value={field.value}
                  onChange={field.onChange}
                  options={levelOptions}
                />
              )}
            />
          </FormField>
        </SimpleGrid>

        <FormField
          htmlFor="risk-description"
          label={<FormattedMessage {...m.fieldDescription} />}
        >
          <Textarea
            id="risk-description"
            rows={3}
            {...register('description')}
          />
        </FormField>

        <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
          <FormField
            htmlFor="risk-category"
            label={<FormattedMessage {...m.fieldCategory} />}
          >
            <Input id="risk-category" {...register('category')} />
          </FormField>

          <FormField
            htmlFor="risk-status"
            label={<FormattedMessage {...m.fieldStatus} />}
          >
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select
                  id="risk-status"
                  value={field.value}
                  onChange={field.onChange}
                  options={[
                    { value: 'open', label: intl.formatMessage(m.statusOpen) },
                    {
                      value: 'mitigating',
                      label: intl.formatMessage(m.statusMitigating),
                    },
                    {
                      value: 'closed',
                      label: intl.formatMessage(m.statusClosed),
                    },
                  ]}
                />
              )}
            />
          </FormField>
        </SimpleGrid>

        <FormField
          htmlFor="risk-strategy"
          label={<FormattedMessage {...m.fieldStrategy} />}
        >
          <Controller
            control={control}
            name="responseStrategy"
            render={({ field }) => (
              <Select
                id="risk-strategy"
                value={field.value}
                onChange={field.onChange}
                options={[
                  { value: '', label: intl.formatMessage(m.strategyNone) },
                  {
                    value: 'avoid',
                    label: intl.formatMessage(m.strategyAvoid),
                  },
                  {
                    value: 'mitigate',
                    label: intl.formatMessage(m.strategyMitigate),
                  },
                  {
                    value: 'transfer',
                    label: intl.formatMessage(m.strategyTransfer),
                  },
                  {
                    value: 'accept',
                    label: intl.formatMessage(m.strategyAccept),
                  },
                ]}
              />
            )}
          />
        </FormField>

        <FormField
          htmlFor="risk-mitigation"
          label={<FormattedMessage {...m.fieldMitigation} />}
        >
          <Textarea id="risk-mitigation" rows={3} {...register('mitigation')} />
        </FormField>
      </Stack>
    </FormDrawer>
  )
}
