import {
  Controller,
  type Control,
  type FieldErrors,
  type UseFormRegister,
} from 'react-hook-form'
import { FormattedMessage, useIntl } from 'react-intl'

import { FormField, Select } from '@/components'
import { CurrencyInput } from '@/components/ui/currency-input'
import { DateInput } from '@/components/ui/date-input'
import { Input } from '@/components/ui/input'
import { useProjectCurrency } from '@/hooks'
import { CATEGORY_OPTIONS, expenseManagementMessages as m } from '@/utils'

/** The fields both expense modals edit; the create form adds subtaskId on top. */
export interface ExpenseFieldValues {
  description: string
  amount: string
  category: string
  expenseDate: string
  documentType?: 'invoice' | 'receipt' | 'purchase_order' | '' | null
  documentNumber?: string | null
}

interface ExpenseFieldsProps<T extends ExpenseFieldValues> {
  control: Control<T>
  register: UseFormRegister<T>
  errors: FieldErrors<ExpenseFieldValues>
  /** Prefixes the field element ids, e.g. "expense-create". */
  idPrefix: string
  /** The create modal shows description/category placeholders; the edit modal does not. */
  withPlaceholders?: boolean
}

/**
 * The form fields (description / amount / category / date / document) shared by the
 * expense create and edit modals.
 */
export function ExpenseFields<T extends ExpenseFieldValues>({
  control,
  register,
  errors,
  idPrefix,
  withPlaceholders = false,
}: ExpenseFieldsProps<T>) {
  const intl = useIntl()
  const { currency } = useProjectCurrency()
  // The create form's values are a superset of ExpenseFieldValues; RHF's
  // generics are invariant, so the plumbing is narrowed once here.
  const fieldsControl = control as unknown as Control<ExpenseFieldValues>
  const fieldsRegister =
    register as unknown as UseFormRegister<ExpenseFieldValues>

  return (
    <>
      <FormField
        htmlFor={`${idPrefix}-description`}
        label={<FormattedMessage {...m.descriptionLabel} />}
        error={errors.description?.message}
      >
        <Input
          id={`${idPrefix}-description`}
          {...(withPlaceholders && {
            placeholder: intl.formatMessage(m.descriptionPlaceholderEs),
          })}
          aria-invalid={!!errors.description}
          {...fieldsRegister('description')}
        />
      </FormField>

      <FormField
        htmlFor={`${idPrefix}-amount`}
        label={<FormattedMessage {...m.amountLabel} />}
        error={errors.amount?.message}
      >
        <Controller
          control={fieldsControl}
          name="amount"
          render={({ field }) => (
            <CurrencyInput
              currency={currency}
              id={`${idPrefix}-amount`}
              value={field.value}
              onValueChange={(details) => field.onChange(details.value)}
              min={0.01}
              aria-invalid={!!errors.amount}
            />
          )}
        />
      </FormField>

      <FormField
        htmlFor={`${idPrefix}-category`}
        label={<FormattedMessage {...m.categoryLabel} />}
        error={errors.category?.message}
      >
        <Controller
          control={fieldsControl}
          name="category"
          render={({ field }) => (
            <Select
              id={`${idPrefix}-category`}
              value={field.value}
              onChange={field.onChange}
              invalid={!!errors.category}
              {...(withPlaceholders && {
                placeholder: intl.formatMessage(m.categoryPlaceholder),
              })}
              options={CATEGORY_OPTIONS.map((opt) => ({
                value: opt.value,
                label: intl.formatMessage(opt.label),
              }))}
            />
          )}
        />
      </FormField>

      <FormField
        label={<FormattedMessage {...m.dateLabel} />}
        error={errors.expenseDate?.message}
      >
        <Controller
          control={fieldsControl}
          name="expenseDate"
          render={({ field }) => (
            <DateInput
              value={field.value}
              onValueChange={field.onChange}
              invalid={!!errors.expenseDate}
            />
          )}
        />
      </FormField>

      <FormField
        htmlFor={`${idPrefix}-document-type`}
        label={<FormattedMessage {...m.documentTypeLabel} />}
        error={errors.documentType?.message}
      >
        <Controller
          control={fieldsControl}
          name="documentType"
          render={({ field }) => (
            <Select
              id={`${idPrefix}-document-type`}
              value={field.value ?? ''}
              onChange={field.onChange}
              placeholder={intl.formatMessage(m.documentTypePlaceholder)}
              options={[
                {
                  value: '',
                  label: intl.formatMessage(m.documentTypePlaceholder),
                },
                {
                  value: 'invoice',
                  label: intl.formatMessage(m.documentTypeInvoice),
                },
                {
                  value: 'receipt',
                  label: intl.formatMessage(m.documentTypeReceipt),
                },
                {
                  value: 'purchase_order',
                  label: intl.formatMessage(m.documentTypePurchaseOrder),
                },
              ]}
            />
          )}
        />
      </FormField>

      <FormField
        htmlFor={`${idPrefix}-document-number`}
        label={<FormattedMessage {...m.documentNumberLabel} />}
        error={errors.documentNumber?.message}
      >
        <Input
          id={`${idPrefix}-document-number`}
          placeholder={intl.formatMessage(m.documentNumberPlaceholder)}
          {...fieldsRegister('documentNumber')}
        />
      </FormField>
    </>
  )
}
