import toast from 'react-hot-toast'
import { FormattedMessage, useIntl } from 'react-intl'

import {
  useApproveBudgetApprovalMutation,
  useRejectBudgetApprovalMutation,
} from '@/services/budget-approval'
import { budgetApprovalsMessages as m } from '@/utils'

import { ApprovalDecisionDialog } from '../../../approval-decision-dialog'

interface BudgetApprovalDecideDialogProps {
  requestId: string | null
  mode: 'approve' | 'reject' | null
  onClose: () => void
}

/** The approver's confirmation for a budget-change request. */
export function BudgetApprovalDecideDialog({
  requestId,
  mode,
  onClose,
}: BudgetApprovalDecideDialogProps) {
  const intl = useIntl()
  const [approve, { isLoading: isApproving }] =
    useApproveBudgetApprovalMutation()
  const [reject, { isLoading: isRejecting }] = useRejectBudgetApprovalMutation()

  const handleConfirm = async (comment: string) => {
    if (!requestId || !mode) return false
    const args = { id: requestId, decisionComment: comment.trim() || null }
    try {
      if (mode === 'approve') {
        await approve(args).unwrap()
        toast.success(intl.formatMessage(m.approveSuccess), {
          id: m.approveSuccess.id,
        })
      } else {
        await reject(args).unwrap()
        toast.success(intl.formatMessage(m.rejectSuccess), {
          id: m.rejectSuccess.id,
        })
      }
      return true
    } catch {
      toast.error(
        intl.formatMessage(mode === 'approve' ? m.approveError : m.rejectError),
        { id: 'budget-approval-decide-error' },
      )
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
      description={<FormattedMessage {...m.requestModalDescription} />}
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
