import { Box, Flex, HStack, SimpleGrid, Stack } from '@chakra-ui/react'
import { FileText, Paperclip, X } from 'lucide-react'
import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { FormattedMessage, useIntl } from 'react-intl'

import {
  Button,
  Combobox,
  FormField,
  Label,
  Modal,
  ModalFormFooter,
  Select,
  Text,
} from '@/components'
import { useZodResolverIntl } from '@/i18n'
import {
  expenseCreateSchema,
  expenseValidationMessages,
  type ExpenseCreateFormValues,
} from '@/schemas'
import {
  useCreateExpenseMutation,
  useUploadExpenseAttachmentMutation,
} from '@/services/expense'
import type { ExpenseDocumentTypeDTO } from '@/types/dto/expense-dto'
import { serializeMoneyForApi, expenseManagementMessages as m } from '@/utils'

import { ExpenseFields } from './components/expense-fields'

interface SubtaskOption {
  id: string
  title: string
}

interface ExpenseCreateFormProps {
  subtaskId?: string
  subtasks?: SubtaskOption[]
  taskId?: string
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
  const [createExpense, { isLoading: isCreating }] = useCreateExpenseMutation()
  const [uploadAttachment, { isLoading: isUploading }] =
    useUploadExpenseAttachmentMutation()
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null)

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<ExpenseCreateFormValues>({
    resolver: useZodResolverIntl(
      expenseCreateSchema,
      expenseValidationMessages,
    ),
    defaultValues: {
      imputationType: subtaskId ? 'subtask' : 'project',
      subtaskId: subtaskId ?? '',
      projectId,
      description: '',
      amount: '',
      category: '',
      expenseDate: '',
      documentType: '',
      documentNumber: '',
    },
    mode: 'onChange',
  })

  // react-hook-form's watch() is not React Compiler-compatible yet.
  // eslint-disable-next-line react-hooks/incompatible-library
  const imputationType = watch('imputationType')
  const resolvedSubtaskId = subtaskId ?? watch('subtaskId')

  const showSubtaskSelector =
    imputationType === 'subtask' &&
    !subtaskId &&
    subtasks &&
    subtasks.length > 0

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
        setAttachmentFile(accepted[0])
      }
    },
  })

  const emptyForm: ExpenseCreateFormValues = {
    imputationType: subtaskId ? 'subtask' : 'project',
    subtaskId: subtaskId ?? '',
    projectId,
    description: '',
    amount: '',
    category: '',
    expenseDate: '',
    documentType: '',
    documentNumber: '',
  }

  const onSubmit = async (data: ExpenseCreateFormValues) => {
    const isSubtaskImputation = data.imputationType === 'subtask'
    const finalSubtaskId = isSubtaskImputation
      ? (subtaskId ?? data.subtaskId)
      : null

    if (isSubtaskImputation && !finalSubtaskId) return

    try {
      const created = await createExpense({
        body: {
          project_id: isSubtaskImputation ? null : projectId,
          subtask_id: isSubtaskImputation ? finalSubtaskId : null,
          description: data.description.trim(),
          amount: serializeMoneyForApi(data.amount),
          category: data.category,
          expense_date: data.expenseDate,
          document_type: (data.documentType ||
            null) as ExpenseDocumentTypeDTO | null,
          document_number: data.documentNumber?.trim() || null,
        },
        taskId: isSubtaskImputation ? taskId : null,
        projectId,
      }).unwrap()

      if (attachmentFile) {
        try {
          await uploadAttachment({
            id: created.id,
            file: attachmentFile,
            subtaskId: created.subtaskId,
            taskId,
            projectId,
          }).unwrap()
        } catch {
          toast.error(intl.formatMessage(m.attachmentUploadError), {
            id: m.attachmentUploadError.id,
          })
        }
      }

      toast.success(intl.formatMessage(m.createSuccess), {
        id: m.createSuccess.id,
      })
      reset(emptyForm)
      setAttachmentFile(null)
      onOpenChange(false)
    } catch {
      toast.error(intl.formatMessage(m.createError), { id: m.createError.id })
    }
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      reset(emptyForm)
      setAttachmentFile(null)
    }
    onOpenChange(next)
  }

  const isFormValid =
    isValid &&
    (imputationType === 'project' ||
      (imputationType === 'subtask' && resolvedSubtaskId !== ''))

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
          isLoading={isCreating || isUploading}
          submitDisabled={!isFormValid}
          onCancel={() => handleOpenChange(false)}
        />
      }
    >
      <SimpleGrid columns={{ base: 1, sm: 2 }} gap={4}>
        {!subtaskId && (
          <FormField
            htmlFor="expense-imputation-type"
            label={<FormattedMessage {...m.imputationTypeLabel} />}
          >
            <Select
              id="expense-imputation-type"
              value={imputationType}
              onChange={(val) => {
                setValue('imputationType', val as 'subtask' | 'project', {
                  shouldValidate: true,
                })
              }}
              options={[
                {
                  value: 'project',
                  label: intl.formatMessage(m.imputationProject),
                },
                ...(subtasks && subtasks.length > 0
                  ? [
                      {
                        value: 'subtask',
                        label: intl.formatMessage(m.imputationSubtask),
                      },
                    ]
                  : []),
              ]}
            />
          </FormField>
        )}

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
                  value={field.value ?? ''}
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

        <Stack gap={2} gridColumn={{ sm: 'span 2' }}>
          <Label>
            <FormattedMessage {...m.attachmentLabel} />
          </Label>
          {attachmentFile ? (
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
                  {attachmentFile.name} (
                  {(attachmentFile.size / 1024).toFixed(0)} KB)
                </Text>
              </HStack>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => setAttachmentFile(null)}
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
      </SimpleGrid>
    </Modal>
  )
}
