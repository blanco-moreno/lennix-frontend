import { defineMessages } from 'react-intl'

/**
 * Catalog for the budget approval flow — shared between the request
 * modal (PM/PC submit a change), the approver bandeja (admin/PE
 * review and decide), and the inline "you have a pending request"
 * banners that appear on project/task detail pages.
 */
export const budgetApprovalsMessages = defineMessages({
  // Request modal (the one a `user` sees instead of a direct edit)
  requestModalTitle: {
    id: 'budgetApprovals.requestModalTitle',
    defaultMessage: 'Request budget change',
    description: 'Title of the budget-change request modal',
  },
  requestModalDescription: {
    id: 'budgetApprovals.requestModalDescription',
    defaultMessage:
      'Submit the new amount and a justification. An approver reviews the request before it takes effect.',
    description: 'Subtitle of the request modal',
  },
  requestModalSubmit: {
    id: 'budgetApprovals.requestModalSubmit',
    defaultMessage: 'Send for approval',
    description: 'Submit button on the request modal',
  },
  requestAmountLabel: {
    id: 'budgetApprovals.requestAmountLabel',
    defaultMessage: 'New amount ({currency})',
    description: 'Label of the requested amount input',
  },
  requestReasonLabel: {
    id: 'budgetApprovals.requestReasonLabel',
    defaultMessage: 'Justification',
    description: 'Label of the reason textarea',
  },
  requestReasonPlaceholder: {
    id: 'budgetApprovals.requestReasonPlaceholder',
    defaultMessage:
      'Explain why this change is needed (e.g. price increase, scope change, errata)…',
    description: 'Placeholder of the reason textarea',
  },
  requestCreateSuccess: {
    id: 'budgetApprovals.requestCreateSuccess',
    defaultMessage: 'Request submitted. Awaiting approval.',
    description: 'Toast after creating a request',
  },
  requestCreateError: {
    id: 'budgetApprovals.requestCreateError',
    defaultMessage: 'Could not submit the request',
    description: 'Toast when request creation fails',
  },

  // Approver bandeja (list page)
  bandejaTitle: {
    id: 'budgetApprovals.bandejaTitle',
    defaultMessage: 'Budget approvals',
    description: 'Title of the approver bandeja page',
  },
  bandejaSubtitle: {
    id: 'budgetApprovals.bandejaSubtitle',
    defaultMessage:
      'Review pending budget-change requests submitted by project managers and controllers.',
    description: 'Subtitle of the approver bandeja page',
  },
  filterAllStates: {
    id: 'budgetApprovals.filterAllStates',
    defaultMessage: 'All states',
    description: 'Filter option that shows requests in any state',
  },
  filterStatePending: {
    id: 'budgetApprovals.filterStatePending',
    defaultMessage: 'Pending',
    description: 'State filter: pending requests',
  },
  filterStateApproved: {
    id: 'budgetApprovals.filterStateApproved',
    defaultMessage: 'Approved',
    description: 'State filter: approved requests',
  },
  filterStateRejected: {
    id: 'budgetApprovals.filterStateRejected',
    defaultMessage: 'Rejected',
    description: 'State filter: rejected requests',
  },
  emptyTitle: {
    id: 'budgetApprovals.emptyTitle',
    defaultMessage: 'No requests',
    description: 'Empty state title for the bandeja',
  },
  emptyBody: {
    id: 'budgetApprovals.emptyBody',
    defaultMessage:
      'No approval requests match the current filter. New requests appear here as project managers submit them.',
    description: 'Empty state body for the bandeja',
  },

  // Bandeja row labels
  columnRequest: {
    id: 'budgetApprovals.columnRequest',
    defaultMessage: 'Request',
    description: 'Column header over the request name and justification',
  },
  columnActions: {
    id: 'budgetApprovals.columnActions',
    defaultMessage: 'Actions',
    description: 'Visually hidden header of the approve/reject column',
  },
  rowTargetProject: {
    id: 'budgetApprovals.rowTargetProject',
    defaultMessage: 'Project',
    description: 'Row label: target is a project',
  },
  rowTargetTask: {
    id: 'budgetApprovals.rowTargetTask',
    defaultMessage: 'Activity',
    description: 'Row label: target is a task/activity',
  },
  rowPreviousAmount: {
    id: 'budgetApprovals.rowPreviousAmount',
    defaultMessage: 'Current',
    description: 'Row label for the previous (current) amount',
  },
  rowRequestedAmount: {
    id: 'budgetApprovals.rowRequestedAmount',
    defaultMessage: 'Requested',
    description: 'Row label for the requested new amount',
  },
  rowDelta: {
    id: 'budgetApprovals.rowDelta',
    defaultMessage: 'Δ',
    description: 'Row label for the delta between previous and requested',
  },
  rowReason: {
    id: 'budgetApprovals.rowReason',
    defaultMessage: 'Justification',
    description: 'Row label for the requestor reason',
  },
  rowRequestedAt: {
    id: 'budgetApprovals.rowRequestedAt',
    defaultMessage: 'Submitted',
    description: 'Row label for the request creation timestamp',
  },
  noPreviousAmount: {
    id: 'budgetApprovals.noPreviousAmount',
    defaultMessage: 'No previous amount',
    description:
      'Fallback when the target had no budget set before the request',
  },

  // Decision actions
  approveButton: {
    id: 'budgetApprovals.approveButton',
    defaultMessage: 'Approve',
    description: 'Approve action button',
  },
  rejectButton: {
    id: 'budgetApprovals.rejectButton',
    defaultMessage: 'Reject',
    description: 'Reject action button',
  },
  decisionCommentLabel: {
    id: 'budgetApprovals.decisionCommentLabel',
    defaultMessage: 'Comment (optional)',
    description: 'Label of the approver comment textarea',
  },
  decisionCommentPlaceholder: {
    id: 'budgetApprovals.decisionCommentPlaceholder',
    defaultMessage: 'Leave a note for the requestor…',
    description: 'Placeholder of the approver comment textarea',
  },
  approveSuccess: {
    id: 'budgetApprovals.approveSuccess',
    defaultMessage: 'Request approved. Budget updated.',
    description: 'Toast after a request is approved',
  },
  approveError: {
    id: 'budgetApprovals.approveError',
    defaultMessage: 'Could not approve the request',
    description: 'Toast when approve fails',
  },
  rejectSuccess: {
    id: 'budgetApprovals.rejectSuccess',
    defaultMessage: 'Request rejected',
    description: 'Toast after a request is rejected',
  },
  rejectError: {
    id: 'budgetApprovals.rejectError',
    defaultMessage: 'Could not reject the request',
    description: 'Toast when reject fails',
  },

  // Sidebar / nav link
  navLink: {
    id: 'budgetApprovals.navLink',
    defaultMessage: 'Approvals',
    description: 'Sidebar / top-nav link to the approver bandeja',
  },

  cancel: {
    id: 'budgetApprovals.cancel',
    defaultMessage: 'Cancel',
    description: 'Cancel button across budget approval dialogs',
  },
})
