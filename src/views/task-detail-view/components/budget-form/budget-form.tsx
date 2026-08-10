import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { FormattedMessage, useIntl, type MessageDescriptor } from 'react-intl'
import type { ZodType } from 'zod'

import {
  FormDrawer,
  FormField,
  InlineForm,
  ModalFormFooter,
} from '@/components'
import { CurrencyInput } from '@/components/ui/currency-input'
import { useZodResolverIntl } from '@/i18n'
import type { ApiError } from '@/services'
import { serializeMoneyForApi } from '@/utils'

interface BudgetFormValues {
  budget: string
}

export interface BudgetFormMessages {
  title: MessageDescriptor
  description: MessageDescriptor
  fieldLabel: MessageDescriptor
  submit: MessageDescriptor
  updateSuccess: MessageDescriptor
  updateError: MessageDescriptor
}

export interface BudgetFormProps {
  /** Id for the amount input, so each surface keeps its own stable id. */
  inputId: string
  currentBudget: number | null
  open: boolean
  onOpenChange: (open: boolean) => void
  /** The owning mutation's loading flag. */
  isLoading: boolean
  /** The owning entity's budget schema + validation catalog. */
  schema: ZodType<BudgetFormValues>
  validationMessages: Record<string, MessageDescriptor>
  messages: BudgetFormMessages
  /**
   * Where the form renders. Pages open a side drawer; the activity drawer
   * edits in place, because a drawer over a drawer buries the record behind it.
   */
  surface?: 'drawer' | 'inline'
  /** Persist the serialized amount; reject with `ApiError` on failure. */
  onSubmit: (budget: string) => Promise<unknown>
}

/**
 * The one budget-edit modal, shared by the task and project surfaces: a single
 * currency field over whichever surface fits, submitting the serialized amount to
 * whichever mutation the wrapper owns.
 */
export function BudgetForm({
  inputId,
  currentBudget,
  surface = 'drawer',
  open,
  onOpenChange,
  isLoading,
  schema,
  validationMessages,
  messages,
  onSubmit: submitBudget,
}: BudgetFormProps) {
  const intl = useIntl()

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<BudgetFormValues>({
    resolver: useZodResolverIntl(schema, validationMessages),
    defaultValues: {
      budget: currentBudget !== null ? String(currentBudget) : '',
    },
    mode: 'onChange',
  })

  const onSubmit = async (data: BudgetFormValues) => {
    try {
      await submitBudget(serializeMoneyForApi(data.budget))
      toast.success(intl.formatMessage(messages.updateSuccess), {
        id: messages.updateSuccess.id,
      })
      onOpenChange(false)
    } catch (error) {
      toast.error(
        (error as ApiError).message ?? intl.formatMessage(messages.updateError),
        { id: messages.updateError.id },
      )
    }
  }

  const Surface = surface === 'inline' ? InlineForm : FormDrawer

  return (
    <Surface
      open={open}
      onOpenChange={onOpenChange}
      title={intl.formatMessage(messages.title)}
      description={intl.formatMessage(messages.description)}
      onSubmit={handleSubmit(onSubmit)}
      footer={
        <ModalFormFooter
          submitLabel={messages.submit}
          isLoading={isLoading}
          submitDisabled={!isValid}
          onCancel={() => onOpenChange(false)}
        />
      }
    >
      <FormField
        htmlFor={inputId}
        label={<FormattedMessage {...messages.fieldLabel} />}
        error={errors.budget?.message}
      >
        <Controller
          control={control}
          name="budget"
          render={({ field }) => (
            <CurrencyInput
              id={inputId}
              value={field.value}
              onValueChange={(details) => field.onChange(details.value)}
              aria-invalid={!!errors.budget}
            />
          )}
        />
      </FormField>
    </Surface>
  )
}
