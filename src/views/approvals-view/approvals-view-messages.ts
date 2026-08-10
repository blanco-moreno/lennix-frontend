import { defineMessages } from 'react-intl'

/**
 * Catalog for the one approvals home — the shell and the force-start
 * section. The budget section keeps its own catalog (`budgetApprovalsMessages`).
 */
export const approvalsMessages = defineMessages({
  title: {
    id: 'approvals.title',
    defaultMessage: 'Approvals',
    description: 'Title of the single approvals home',
  },
  subtitle: {
    id: 'approvals.subtitle',
    defaultMessage: 'Decisions someone is waiting on.',
    description: 'Subtitle of the approvals home',
  },
  // A `user` does not decide; they ask. Same home, read-only, and the heading
  // has to say whose requests these are — the backend only returns their own.
  titleMine: {
    id: 'approvals.titleMine',
    defaultMessage: 'My requests',
    description: 'Title of the approvals home for a requester',
  },
  subtitleMine: {
    id: 'approvals.subtitleMine',
    defaultMessage: 'What you asked for, and where each request stands.',
    description: 'Subtitle of the approvals home for a requester',
  },
  tabBudget: {
    id: 'approvals.tabBudget',
    defaultMessage: 'Budget',
    description: 'Budget section of the approvals home',
  },
  tabForceStart: {
    id: 'approvals.tabForceStart',
    defaultMessage: 'Force start',
    description: 'Force-start section of the approvals home',
  },

  // --- Force-start section ---
  forceStartEmptyTitle: {
    id: 'approvals.forceStartEmptyTitle',
    defaultMessage: 'No force-start requests',
    description: 'Empty state of the force-start section',
  },
  forceStartEmptyBody: {
    id: 'approvals.forceStartEmptyBody',
    defaultMessage:
      'Nobody has asked to start a blocked activity ahead of its dependencies.',
    description: 'Empty state body of the force-start section',
  },
  forceStartLoadError: {
    id: 'approvals.forceStartLoadError',
    defaultMessage: 'Force-start requests could not be loaded',
    description: 'Error state of the force-start section',
  },
  columnRequest: {
    id: 'approvals.columnRequest',
    defaultMessage: 'Request',
    description: 'Column header over the request name and justification',
  },
  columnActions: {
    id: 'approvals.columnActions',
    defaultMessage: 'Actions',
    description: 'Visually hidden header of the approve/reject column',
  },
  rowTask: {
    id: 'approvals.rowTask',
    defaultMessage: 'Activity',
    description: 'Badge on a force-start row',
  },
  rowReason: {
    id: 'approvals.rowReason',
    defaultMessage: 'Justification',
    description: 'Reason label on a force-start row',
  },
  rowRequestedAt: {
    id: 'approvals.rowRequestedAt',
    defaultMessage: 'Requested',
    description: 'Requested-at label on a force-start row',
  },
  rowWasBlocked: {
    id: 'approvals.rowWasBlocked',
    defaultMessage: 'Blocked when requested',
    description: 'Snapshot detail on a force-start row',
  },
  decisionCommentLabel: {
    id: 'approvals.decisionCommentLabel',
    defaultMessage: 'Comment',
    description: 'Decision comment label',
  },
  decisionCommentPlaceholder: {
    id: 'approvals.decisionCommentPlaceholder',
    defaultMessage: 'Optional — why you decided this way…',
    description: 'Decision comment placeholder',
  },
  approveButton: {
    id: 'approvals.approveButton',
    defaultMessage: 'Approve',
    description: 'Approve a force-start request',
  },
  rejectButton: {
    id: 'approvals.rejectButton',
    defaultMessage: 'Reject',
    description: 'Reject a force-start request',
  },
  cancel: {
    id: 'approvals.cancel',
    defaultMessage: 'Cancel',
    description: 'Cancel the decision dialog',
  },
  approveDialogDescription: {
    id: 'approvals.approveDialogDescription',
    defaultMessage:
      'Approving starts the activity now and marks it at risk permanently.',
    description: 'Body of the force-start approve dialog',
  },
  rejectDialogDescription: {
    id: 'approvals.rejectDialogDescription',
    defaultMessage: 'Rejecting leaves the activity blocked. Nothing changes.',
    description: 'Body of the force-start reject dialog',
  },
  approveSuccess: {
    id: 'approvals.approveSuccess',
    defaultMessage: 'Force start approved — the activity is marked at risk',
    description: 'Toast after approving a force-start request',
  },
  rejectSuccess: {
    id: 'approvals.rejectSuccess',
    defaultMessage: 'Force-start request rejected',
    description: 'Toast after rejecting a force-start request',
  },
  approveError: {
    id: 'approvals.approveError',
    defaultMessage: 'The request could not be approved',
    description: 'Toast when approving fails',
  },
  rejectError: {
    id: 'approvals.rejectError',
    defaultMessage: 'The request could not be rejected',
    description: 'Toast when rejecting fails',
  },
  filterAllStates: {
    id: 'approvals.filterAllStates',
    defaultMessage: 'All',
    description: 'State filter option',
  },
  filterStatePending: {
    id: 'approvals.filterStatePending',
    defaultMessage: 'Pending',
    description: 'State filter option',
  },
  filterStateApproved: {
    id: 'approvals.filterStateApproved',
    defaultMessage: 'Approved',
    description: 'State filter option',
  },
  filterStateRejected: {
    id: 'approvals.filterStateRejected',
    defaultMessage: 'Rejected',
    description: 'State filter option',
  },
})
