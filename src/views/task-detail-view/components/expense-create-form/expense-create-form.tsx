import { SimpleGrid, Stack } from '@chakra-ui/react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { FormattedMessage, useIntl } from 'react-intl'

import { Modal, Label, ModalFormFooter, Text } from '@/components'
import { Combobox } from '@/components/ui/combobox/combobox'
import { useZodResolverIntl } from '@/i18n'
import {
  expenseCreateSchema,
  expenseValidationMessages,
  type ExpenseCreateFormValues,
} from '@/schemas'
import { useCreateExpenseMutation } from '@/services/expense'
import { serializeMoneyForApi, expenseManagementMessages as m } from '@/utils'

import { ExpenseFields } from './components/expense-fields'

interface SubtaskOption {
  id: string
  title: string
}

interface ExpenseCreateFormProps {
  subtaskId?: string
  subtasks?: SubtaskOption[]
  taskId: string
  projectId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ExpenseCreateForm({
  subtaskId,
  subtasks,
  taskId,
  projectId,
  open,
  onOpenChange,
}: ExpenseCreateFormProps) {
  const intl = useIntl()
  const [createExpense, { isLoading }] = useCreateExpenseMutation()

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid },
  } = useForm<ExpenseCreateFormValues>({
    resolver: useZodResolverIntl(
      expenseCreateSchema,
      expenseValidationMessages,
    ),
    defaultValues: {
      subtaskId: subtaskId ?? '',
      description: '',
      amount: '',
      category: '',
      expenseDate: '',
    },
    mode: 'onChange',
  })

  const showSubtaskSelector = !subtaskId && subtasks && subtasks.length > 0
  // react-hook-form's watch() is not React Compiler-compatible yet.
  // eslint-disable-next-line react-hooks/incompatible-library
  const resolvedSubtaskId = subtaskId ?? watch('subtaskId')

  const emptyForm = {
    subtaskId: subtaskId ?? '',
    description: '',
    amount: '',
    category: '',
    expenseDate: '',
  }

  const onSubmit = async (data: ExpenseCreateFormValues) => {
    const finalSubtaskId = subtaskId ?? data.subtaskId
    if (!finalSubtaskId) return

    try {
      await createExpense({
        body: {
          subtask_id: finalSubtaskId,
          description: data.description.trim(),
          amount: serializeMoneyForApi(data.amount),
          category: data.category,
          expense_date: data.expenseDate,
        },
        taskId,
        projectId,
      }).unwrap()
      toast.success(intl.formatMessage(m.createSuccess), {
        id: m.createSuccess.id,
      })
      reset(emptyForm)
      onOpenChange(false)
    } catch {
      toast.error(intl.formatMessage(m.createError), { id: m.createError.id })
    }
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) reset(emptyForm)
    onOpenChange(next)
  }

  return (
    <Modal
      open={open}
      onOpenChange={handleOpenChange}
      title={intl.formatMessage(m.createTitle)}
      description={intl.formatMessage(m.createSubtitle)}
      onSubmit={handleSubmit(onSubmit)}
      footer={
        <ModalFormFooter
          submitLabel={m.createSubmit}
          isLoading={isLoading}
          submitDisabled={!isValid || resolvedSubtaskId === ''}
          onCancel={() => handleOpenChange(false)}
        />
      }
    >
      <SimpleGrid columns={{ base: 1, sm: 2 }} gap={4}>
        {showSubtaskSelector && (
          <Stack gap={2} gridColumn={{ sm: 'span 2' }}>
            <Label htmlFor="expense-subtask">
              <FormattedMessage {...m.subtaskLabel} />
            </Label>
            <Controller
              control={control}
              name="subtaskId"
              render={({ field }) => (
                <Combobox
                  id="expense-subtask"
                  value={field.value}
                  onValueChange={field.onChange}
                  invalid={!!errors.subtaskId}
                  placeholder={intl.formatMessage(m.subtaskPlaceholder)}
                  options={subtasks!.map((sub) => ({
                    value: sub.id,
                    label: sub.title,
                  }))}
                />
              )}
            />
            {errors.subtaskId && (
              <Text size="sm" color="error">
                {errors.subtaskId.message}
              </Text>
            )}
          </Stack>
        )}

        <ExpenseFields
          control={control}
          register={register}
          errors={errors}
          idPrefix="expense-create"
          withPlaceholders
        />
      </SimpleGrid>
    </Modal>
  )
}
