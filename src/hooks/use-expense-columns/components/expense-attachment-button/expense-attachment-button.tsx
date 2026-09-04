import { chakra } from '@chakra-ui/react'
import { Paperclip } from 'lucide-react'
import * as React from 'react'
import toast from 'react-hot-toast'
import { useIntl } from 'react-intl'

import { Button } from '@/components'
import { useDownloadExpenseAttachmentMutation } from '@/services/expense'
import type { ProjectExpense } from '@/types'
import { downloadBlob, expenseManagementMessages as m } from '@/utils'

export interface ExpenseAttachmentButtonProps {
  expense: ProjectExpense
}

export function ExpenseAttachmentButton({
  expense,
}: ExpenseAttachmentButtonProps) {
  const intl = useIntl()
  const [download, { isLoading }] = useDownloadExpenseAttachmentMutation()

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const { blob, filename } = await download({
        id: expense.id,
        fallbackFilename: expense.attachmentFilename || 'document',
      }).unwrap()
      downloadBlob(blob, filename)
    } catch {
      toast.error(intl.formatMessage(m.attachmentUploadError))
    }
  }

  return (
    <Button
      variant="ghost"
      size="xs"
      disabled={isLoading}
      onClick={handleDownload}
      aria-label={intl.formatMessage(m.attachmentDownload)}
      title={
        expense.attachmentFilename || intl.formatMessage(m.attachmentDownload)
      }
    >
      <chakra.span display="inline-flex" alignItems="center" gap={1}>
        <Paperclip size={14} />
      </chakra.span>
    </Button>
  )
}
