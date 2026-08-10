import { FormattedMessage } from 'react-intl'

import { useIntlToast } from '@/i18n'
import {
  useApproveForceStartRequestMutation,
  useRejectForceStartRequestMutation,
} from '@/services/force-start'

import { approvalsMessages as m } from '../../approvals-view-messages'
import { ApprovalDecisionDialog } from '../approval-decision-dialog'

interface ForceStartDecideDialogProps {
  requestId: string | null
  mode: 'approve' | 'reject' | null
  onClose: () => void
}

/** The approver's confirmation for a force-start request. */
export function ForceStartDecideDialog({
  requestId,
  mode,
  onClose,
}: ForceStartDecideDialogProps) {
  const toast = useIntlToast()
  const [approve, { isLoading: isApproving }] =
    useApproveForceStartRequestMutation()
  const [reject, { isLoading: isRejecting }] =
    useRejectForceStartRequestMutation()

  const handleConfirm = async (comment: string) => {
    if (!requestId || !mode) return false
    const args = { id: requestId, decisionComment: comment.trim() || null }
    try {
      if (mode === 'approve') {
        await approve(args).unwrap()
        toast.success(m.approveSuccess)
      } else {
        await reject(args).unwrap()
        toast.success(m.rejectSuccess)
      }
      return true
    } catch {
      toast.error(mode === 'approve' ? m.approveError : m.rejectError)
      return false
    }
  }

  return (
    <ApprovalDecisionDialog
      requestId={requestId}
      mode={mode}
      onClose={onClose}
      onConfirm={handleConfirm}
      isLoading={isApproving || isRejecting}
      description={
        <FormattedMessage
          {...(mode === 'reject'
            ? m.rejectDialogDescription
            : m.approveDialogDescription)}
        />
      }
      messages={{
        approveButton: m.approveButton,
        rejectButton: m.rejectButton,
        cancel: m.cancel,
        decisionCommentLabel: m.decisionCommentLabel,
        decisionCommentPlaceholder: m.decisionCommentPlaceholder,
      }}
    />
  )
}
