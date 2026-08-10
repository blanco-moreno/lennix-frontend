import { Stack } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { FormattedMessage, useIntl, type MessageDescriptor } from 'react-intl'

import { Button, Label } from '@/components'
import { Modal } from '@/components/ui/modal'
import { Textarea } from '@/components/ui/textarea'

export type ApprovalDecisionMode = 'approve' | 'reject'

export interface ApprovalDecisionMessages {
  approveButton: MessageDescriptor
  rejectButton: MessageDescriptor
  cancel: MessageDescriptor
  decisionCommentLabel: MessageDescriptor
  decisionCommentPlaceholder: MessageDescriptor
}

interface ApprovalDecisionDialogProps {
  requestId: string | null
  mode: ApprovalDecisionMode | null
  onClose: () => void
  /**
   * Runs the mutation and toasts the result. Return `true` on success — the
   * dialog then clears the comment and closes; return `false` to keep it open.
   */
  onConfirm: (comment: string) => Promise<boolean>
  isLoading: boolean
  description: ReactNode
  messages: ApprovalDecisionMessages
}

/**
 * The approver's confirmation, shared by the budget-approvals and force-start
 * queues so both decisions feel like the same act: the same shape for approve
 * and reject, an optional comment, a destructive confirm on reject. Each queue
 * supplies its own wording, description and mutation — everything else (the
 * modal, the comment field, the button pair) lives here once.
 *
 * There is deliberately no self-approval check: an approver may decide their
 * own request, and the backend enforces the one gate that matters.
 */
export function ApprovalDecisionDialog({
  requestId,
  mode,
  onClose,
  onConfirm,
  isLoading,
  description,
  messages: m,
}: ApprovalDecisionDialogProps) {
  const intl = useIntl()
  const [comment, setComment] = useState('')
  const isOpen = mode !== null && requestId !== null
  const confirmLabel = mode === 'reject' ? m.rejectButton : m.approveButton

  const clearAndClose = () => {
    setComment('')
    onClose()
  }

  const handleConfirm = async () => {
    if (await onConfirm(comment)) clearAndClose()
  }

  return (
    <Modal
      variant="classic"
      open={isOpen}
      onOpenChange={(next) => {
        if (!next) clearAndClose()
      }}
      size="sm"
      title={<FormattedMessage {...confirmLabel} />}
      description={description}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            <FormattedMessage {...m.cancel} />
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            variant={mode === 'reject' ? 'destructive' : 'default'}
          >
            <FormattedMessage {...confirmLabel} />
          </Button>
        </>
      }
    >
      <Stack gap={2}>
        <Label>
          <FormattedMessage {...m.decisionCommentLabel} />
        </Label>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          placeholder={intl.formatMessage(m.decisionCommentPlaceholder)}
        />
      </Stack>
    </Modal>
  )
}
