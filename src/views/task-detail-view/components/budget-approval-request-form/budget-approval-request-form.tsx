import { Stack } from '@chakra-ui/react'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { FormattedMessage, useIntl } from 'react-intl'

import { FormField, ModalFormFooter } from '@/components'
import { CurrencyInput } from '@/components/ui/currency-input'
import { Modal } from '@/components/ui/modal'
import { Textarea } from '@/components/ui/textarea'
import { useProjectCurrency } from '@/hooks'
import { useZodResolverIntl } from '@/i18n'
import {
  budgetApprovalRequestSchema,
  budgetApprovalValidationMessages,
  type BudgetApprovalRequestFormValues,
} from '@/schemas'
import { useCreateBudgetApprovalMutation } from '@/services/budget-approval'
import type { BudgetApprovalTarget } from '@/types'
import { serializeMoneyForApi, budgetApprovalsMessages as m } from '@/utils'

interface BudgetApprovalRequestFormProps {
  targetType: BudgetApprovalTarget
  targetId: string
  /** Used to prefill the input — Decimal serialised as a string on
   *  the wire; `null` when the target has no budget yet. */
  currentBudget: string | number | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Request modal shown to a `user` in
 * place of the direct-edit modal. Creates a pending
 * `BudgetApprovalRequest`; the actual budget change happens only
 * when an approver (owner, admin or manager) approves it (see
 * `BudgetApprovalsView`).
 */
export function BudgetApprovalRequestForm({
  targetType,
  targetId,
  currentBudget,
  open,
  onOpenChange,
}: BudgetApprovalRequestFormProps) {
  const intl = useIntl()
  const { currency } = useProjectCurrency()
  const [createRequest, { isLoading }] = useCreateBudgetApprovalMutation()

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<BudgetApprovalRequestFormValues>({
    resolver: useZodResolverIntl(
      budgetApprovalRequestSchema,
      budgetApprovalValidationMessages,
    ),
    defaultValues: {
      amount: currentBudget !== null ? String(currentBudget) : '',
      reason: '',
    },
    mode: 'onChange',
  })

  // Reset the form whenever the modal flips closed→open, so the
  // inputs reflect the freshest `currentBudget` from the parent and
  // don't leak the previous submission.
  useEffect(() => {
    if (open) {
      reset({
        amount: currentBudget !== null ? String(currentBudget) : '',
        reason: '',
      })
    }
  }, [open, currentBudget, reset])

  const onSubmit = async (data: BudgetApprovalRequestFormValues) => {
    try {
      await createRequest({
        targetType,
        targetId,
        requestedAmount: serializeMoneyForApi(data.amount),
        reason: data.reason.trim(),
      }).unwrap()
      toast.success(intl.formatMessage(m.requestCreateSuccess), {
        id: m.requestCreateSuccess.id,
      })
      onOpenChange(false)
    } catch {
      toast.error(intl.formatMessage(m.requestCreateError), {
        id: m.requestCreateError.id,
      })
    }
  }

  return (
    <Modal
      size="sm"
      open={open}
      onOpenChange={onOpenChange}
      title={intl.formatMessage(m.requestModalTitle)}
      description={intl.formatMessage(m.requestModalDescription)}
      onSubmit={handleSubmit(onSubmit)}
      footer={
        <ModalFormFooter
          submitLabel={m.requestModalSubmit}
          isLoading={isLoading}
          submitDisabled={!isValid}
          onCancel={() => onOpenChange(false)}
        />
      }
    >
      <Stack gap="field">
        <FormField
          htmlFor="approval-amount"
          label={
            <FormattedMessage {...m.requestAmountLabel} values={{ currency }} />
          }
          error={errors.amount?.message}
        >
          <Controller
            control={control}
            name="amount"
            render={({ field }) => (
              <CurrencyInput
                currency={currency}
                id="approval-amount"
                value={field.value}
                onValueChange={(details) => field.onChange(details.value)}
                aria-invalid={!!errors.amount}
              />
            )}
          />
        </FormField>
        <FormField
          htmlFor="approval-reason"
          label={<FormattedMessage {...m.requestReasonLabel} />}
          error={errors.reason?.message}
        >
          <Textarea
            id="approval-reason"
            rows={3}
            placeholder={intl.formatMessage(m.requestReasonPlaceholder)}
            aria-invalid={!!errors.reason}
            {...register('reason')}
          />
        </FormField>
      </Stack>
    </Modal>
  )
}
