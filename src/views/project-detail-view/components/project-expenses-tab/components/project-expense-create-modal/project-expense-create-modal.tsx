import { Box, Flex, HStack, SimpleGrid, Stack } from '@chakra-ui/react'
import { FileText, Paperclip, X } from 'lucide-react'
import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { FormattedMessage, useIntl } from 'react-intl'

import {
  Button,
  FormField,
  Label,
  Modal,
  ModalFormFooter,
  Select,
  Text,
} from '@/components'
import { CurrencyInput } from '@/components/ui/currency-input'
import { DateInput } from '@/components/ui/date-input'
import { Input } from '@/components/ui/input'
import { useProjectCurrency } from '@/hooks'
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
import {
  CATEGORY_OPTIONS,
  serializeMoneyForApi,
  expenseManagementMessages as em,
} from '@/utils'

export interface ProjectExpenseCreateModalProps {
  projectId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProjectExpenseCreateModal({
  projectId,
  open,
  onOpenChange,
}: ProjectExpenseCreateModalProps) {
  const intl = useIntl()
  const { currency } = useProjectCurrency(projectId)
  const [createExpense, { isLoading: isCreating }] = useCreateExpenseMutation()
  const [uploadAttachment, { isLoading: isUploading }] =
    useUploadExpenseAttachmentMutation()
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null)

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<ExpenseCreateFormValues>({
    resolver: useZodResolverIntl(
      expenseCreateSchema,
      expenseValidationMessages,
    ),
    defaultValues: {
      imputationType: 'project',
      subtaskId: '',
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
    imputationType: 'project',
    subtaskId: '',
    projectId,
    description: '',
    amount: '',
    category: '',
    expenseDate: '',
    documentType: '',
    documentNumber: '',
  }

  const onSubmit = async (data: ExpenseCreateFormValues) => {
    try {
      const created = await createExpense({
        body: {
          project_id: projectId,
          subtask_id: null,
          description: data.description.trim(),
          amount: serializeMoneyForApi(data.amount),
          category: data.category,
          expense_date: data.expenseDate,
          document_type: (data.documentType ||
            null) as ExpenseDocumentTypeDTO | null,
          document_number: data.documentNumber?.trim() || null,
        },
        projectId,
      }).unwrap()

      if (attachmentFile) {
        try {
          await uploadAttachment({
            id: created.id,
            file: attachmentFile,
            projectId,
          }).unwrap()
        } catch {
          toast.error(intl.formatMessage(em.attachmentUploadError), {
            id: em.attachmentUploadError.id,
          })
        }
      }

      toast.success(intl.formatMessage(em.createSuccess), {
        id: em.createSuccess.id,
      })
      reset(emptyForm)
      setAttachmentFile(null)
      onOpenChange(false)
    } catch {
      toast.error(intl.formatMessage(em.createError), { id: em.createError.id })
    }
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      reset(emptyForm)
      setAttachmentFile(null)
    }
    onOpenChange(next)
  }

  return (
    <Modal
      open={open}
      onOpenChange={handleOpenChange}
      title={intl.formatMessage(em.createTitle)}
      description={intl.formatMessage(em.layerProjectDirect)}
      onSubmit={handleSubmit(onSubmit)}
      footer={
        <ModalFormFooter
          submitLabel={em.createSubmit}
          isLoading={isCreating || isUploading}
          submitDisabled={!isValid}
          onCancel={() => handleOpenChange(false)}
        />
      }
    >
      <SimpleGrid columns={{ base: 1, sm: 2 }} gap={4}>
        <FormField
          htmlFor="project-expense-description"
          label={<FormattedMessage {...em.descriptionLabel} />}
          error={errors.description?.message}
        >
          <Input
            id="project-expense-description"
            placeholder={intl.formatMessage(em.descriptionPlaceholderEs)}
            aria-invalid={!!errors.description}
            {...register('description')}
          />
        </FormField>

        <FormField
          htmlFor="project-expense-amount"
          label={<FormattedMessage {...em.amountLabel} />}
          error={errors.amount?.message}
        >
          <Controller
            control={control}
            name="amount"
            render={({ field }) => (
              <CurrencyInput
                currency={currency}
                id="project-expense-amount"
                value={field.value}
                onValueChange={(details: { value: string }) =>
                  field.onChange(details.value)
                }
                min={0.01}
                aria-invalid={!!errors.amount}
              />
            )}
          />
        </FormField>

        <FormField
          htmlFor="project-expense-category"
          label={<FormattedMessage {...em.categoryLabel} />}
          error={errors.category?.message}
        >
          <Controller
            control={control}
            name="category"
            render={({ field }) => (
              <Select
                id="project-expense-category"
                value={field.value}
                onChange={field.onChange}
                invalid={!!errors.category}
                placeholder={intl.formatMessage(em.categoryPlaceholder)}
                options={CATEGORY_OPTIONS.map((opt) => ({
                  value: opt.value,
                  label: intl.formatMessage(opt.label),
                }))}
              />
            )}
          />
        </FormField>

        <FormField
          label={<FormattedMessage {...em.dateLabel} />}
          error={errors.expenseDate?.message}
        >
          <Controller
            control={control}
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
          htmlFor="project-expense-document-type"
          label={<FormattedMessage {...em.documentTypeLabel} />}
          error={errors.documentType?.message}
        >
          <Controller
            control={control}
            name="documentType"
            render={({ field }) => (
              <Select
                id="project-expense-document-type"
                value={field.value ?? ''}
                onChange={field.onChange}
                placeholder={intl.formatMessage(em.documentTypePlaceholder)}
                options={[
                  {
                    value: '',
                    label: intl.formatMessage(em.documentTypePlaceholder),
                  },
                  {
                    value: 'invoice',
                    label: intl.formatMessage(em.documentTypeInvoice),
                  },
                  {
                    value: 'receipt',
                    label: intl.formatMessage(em.documentTypeReceipt),
                  },
                  {
                    value: 'purchase_order',
                    label: intl.formatMessage(em.documentTypePurchaseOrder),
                  },
                ]}
              />
            )}
          />
        </FormField>

        <FormField
          htmlFor="project-expense-document-number"
          label={<FormattedMessage {...em.documentNumberLabel} />}
          error={errors.documentNumber?.message}
        >
          <Input
            id="project-expense-document-number"
            placeholder={intl.formatMessage(em.documentNumberPlaceholder)}
            {...register('documentNumber')}
          />
        </FormField>

        <Stack gap={2} gridColumn={{ sm: 'span 2' }}>
          <Label>
            <FormattedMessage {...em.attachmentLabel} />
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
                aria-label={intl.formatMessage(em.attachmentDelete)}
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
                  {intl.formatMessage(em.attachmentDropzonePrompt)}
                </Text>
              </Flex>
            </Box>
          )}
        </Stack>
      </SimpleGrid>
    </Modal>
  )
}
