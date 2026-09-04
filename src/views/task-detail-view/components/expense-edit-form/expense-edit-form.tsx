import { Box, Flex, HStack, Stack } from '@chakra-ui/react'
import { FileText, Paperclip, X } from 'lucide-react'
import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { FormattedMessage, useIntl } from 'react-intl'

import { Button, Label, Modal, ModalFormFooter, Text } from '@/components'
import { useZodResolverIntl } from '@/i18n'
import {
  expenseEditSchema,
  expenseValidationMessages,
  type ExpenseEditFormValues,
} from '@/schemas'
import {
  useDeleteExpenseAttachmentMutation,
  useUpdateExpenseMutation,
  useUploadExpenseAttachmentMutation,
} from '@/services/expense'
import type { ExpenseItem } from '@/types'
import type { ExpenseDocumentTypeDTO } from '@/types/dto/expense-dto'
import { serializeMoneyForApi, expenseManagementMessages as m } from '@/utils'

import { ExpenseFields } from '../expense-create-form'

interface ExpenseEditFormProps {
  expense: ExpenseItem | null
  taskId?: string | null
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
  const [updateExpense, { isLoading: isUpdating }] = useUpdateExpenseMutation()
  const [uploadAttachment, { isLoading: isUploading }] =
    useUploadExpenseAttachmentMutation()
  const [deleteAttachment, { isLoading: isDeletingAttachment }] =
    useDeleteExpenseAttachmentMutation()
  const [newFile, setNewFile] = useState<File | null>(null)

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
      documentType: expense.documentType ?? '',
      documentNumber: expense.documentNumber ?? '',
    },
    mode: 'onChange',
  })

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    maxFiles: 1,
    maxSize: 20 * 1024 * 1024,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    onDrop: (accepted) => {
      if (accepted[0]) {
        setNewFile(accepted[0])
      }
    },
  })

  const handleDeleteCurrentAttachment = async () => {
    try {
      await deleteAttachment({
        id: expense.id,
        subtaskId: expense.subtaskId,
        taskId,
        projectId,
      }).unwrap()
      toast.success(intl.formatMessage(m.attachmentDeleteSuccess), {
        id: m.attachmentDeleteSuccess.id,
      })
    } catch {
      toast.error(intl.formatMessage(m.attachmentDeleteError), {
        id: m.attachmentDeleteError.id,
      })
    }
  }

  const onSubmit = async (data: ExpenseEditFormValues) => {
    try {
      await updateExpense({
        id: expense.id,
        body: {
          description: data.description || null,
          amount: data.amount ? serializeMoneyForApi(data.amount) : null,
          category: data.category || null,
          expense_date: data.expenseDate || null,
          document_type: (data.documentType ||
            null) as ExpenseDocumentTypeDTO | null,
          document_number: data.documentNumber?.trim() || null,
        },
        subtaskId: expense.subtaskId,
        taskId,
        projectId,
      }).unwrap()

      if (newFile) {
        try {
          await uploadAttachment({
            id: expense.id,
            file: newFile,
            subtaskId: expense.subtaskId,
            taskId,
            projectId,
          }).unwrap()
        } catch {
          toast.error(intl.formatMessage(m.attachmentUploadError), {
            id: m.attachmentUploadError.id,
          })
        }
      }

      toast.success(intl.formatMessage(m.updateSuccess), {
        id: m.updateSuccess.id,
      })
      onOpenChange(false)
    } catch {
      toast.error(intl.formatMessage(m.updateError), { id: m.updateError.id })
    }
  }

  const isLoading = isUpdating || isUploading || isDeletingAttachment

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

        <Stack gap={2}>
          <Label>
            <FormattedMessage {...m.attachmentLabel} />
          </Label>
          {expense.hasAttachment && !newFile ? (
            <Flex
              p={3}
              borderWidth="1px"
              rounded="md"
              align="center"
              justify="space-between"
              bg="bg.subtle"
            >
              <HStack gap={2} overflow="hidden">
                <FileText size={18} />
                <Text size="sm" weight="medium" truncate>
                  {expense.attachmentFilename || 'document'}
                </Text>
              </HStack>
              <Button
                variant="ghost"
                size="xs"
                onClick={handleDeleteCurrentAttachment}
                disabled={isDeletingAttachment}
                aria-label={intl.formatMessage(m.attachmentDelete)}
              >
                <X size={14} />
              </Button>
            </Flex>
          ) : newFile ? (
            <Flex
              p={3}
              borderWidth="1px"
              rounded="md"
              align="center"
              justify="space-between"
              bg="bg.subtle"
            >
              <HStack gap={2} overflow="hidden">
                <FileText size={18} />
                <Text size="sm" weight="medium" truncate>
                  {newFile.name} ({(newFile.size / 1024).toFixed(0)} KB)
                </Text>
              </HStack>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => setNewFile(null)}
                aria-label={intl.formatMessage(m.attachmentDelete)}
              >
                <X size={14} />
              </Button>
            </Flex>
          ) : (
            <Box
              {...getRootProps()}
              p={4}
              borderWidth="2px"
              borderStyle="dashed"
              borderColor={isDragActive ? 'complementary' : 'border'}
              bg={isDragActive ? 'complementary/5' : 'bg.subtle'}
              rounded="md"
              textAlign="center"
              cursor="pointer"
              _hover={{ borderColor: 'complementary' }}
            >
              <input {...getInputProps()} />
              <Flex direction="column" align="center" gap={1}>
                <Paperclip size={18} />
                <Text size="xs" color="fg.muted">
                  {intl.formatMessage(m.attachmentDropzonePrompt)}
                </Text>
              </Flex>
            </Box>
          )}
        </Stack>
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
