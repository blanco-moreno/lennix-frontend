import { Stack } from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useIntl } from 'react-intl'

import { Modal, ModalFormFooter } from '@/components'
import { useZodResolverIntl } from '@/i18n'
import {
  expenseEditSchema,
  expenseValidationMessages,
  type ExpenseEditFormValues,
} from '@/schemas'
import { useUpdateExpenseMutation } from '@/services/expense'
import type { ExpenseItem } from '@/types'
import { serializeMoneyForApi, expenseManagementMessages as m } from '@/utils'

import { ExpenseFields } from '../expense-create-form'

interface ExpenseEditFormProps {
  expense: ExpenseItem | null
  taskId: string
  projectId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

function ExpenseEditFormInner({
  expense,
  taskId,
  projectId,
  open,
  onOpenChange,
}: ExpenseEditFormProps & { expense: ExpenseItem }) {
  const intl = useIntl()
  const [updateExpense, { isLoading }] = useUpdateExpenseMutation()

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ExpenseEditFormValues>({
    resolver: useZodResolverIntl(expenseEditSchema, expenseValidationMessages),
    defaultValues: {
      description: expense.description,
      amount: String(expense.amount),
      category: expense.category,
      expenseDate: expense.expenseDate,
    },
    mode: 'onChange',
  })

  const onSubmit = async (data: ExpenseEditFormValues) => {
    try {
      await updateExpense({
        id: expense.id,
        body: {
          description: data.description || null,
          amount: data.amount ? serializeMoneyForApi(data.amount) : null,
          category: data.category || null,
          expense_date: data.expenseDate || null,
        },
        subtaskId: expense.subtaskId,
        taskId,
        projectId,
      }).unwrap()
      toast.success(intl.formatMessage(m.updateSuccess), {
        id: m.updateSuccess.id,
      })
      onOpenChange(false)
    } catch {
      toast.error(intl.formatMessage(m.updateError), { id: m.updateError.id })
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={intl.formatMessage(m.editTitle)}
      onSubmit={handleSubmit(onSubmit)}
      footer={
        <ModalFormFooter
          submitLabel={m.editSubmit}
          isLoading={isLoading}
          onCancel={() => onOpenChange(false)}
        />
      }
    >
      <Stack gap="field">
        <ExpenseFields
          control={control}
          register={register}
          errors={errors}
          idPrefix="expense-edit"
        />
      </Stack>
    </Modal>
  )
}

export function ExpenseEditForm({
  expense,
  taskId,
  projectId,
  open,
  onOpenChange,
}: ExpenseEditFormProps) {
  if (!expense) return null

  return (
    <ExpenseEditFormInner
      key={expense.id}
      expense={expense}
      taskId={taskId}
      projectId={projectId}
      open={open}
      onOpenChange={onOpenChange}
    />
  )
}
