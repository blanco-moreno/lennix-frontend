import { defineMessages } from 'react-intl'

/**
 * Activity-card catalog. Covers the card shell plus the wording shared by
 * more than one of its sections/modals; ids a single section or modal
 * renders live in that owner's colocated `*-messages.ts`. Status and priority values
 * keep going through `useStatusLabel` / `usePriorityLabel`, and expense
 * categories come from `expenseManagementMessages` — those are
 * deliberately not duplicated here.
 */
export const taskDetailViewMessages = defineMessages({
  // Card shell
  errorTitle: {
    id: 'taskDetail.errorTitle',
    defaultMessage: 'Could not load the main activity',
    description: 'Heading shown when the task detail query fails',
  },
  errorBody: {
    id: 'taskDetail.errorBody',
    defaultMessage: 'The requested main activity could not be found.',
    description: 'Body shown when the task detail query fails',
  },
  // The sections of the activity page. "General" is gone: dates and
  // durations read from the header now, always visible.
  tabDependencies: {
    id: 'taskDetail.tabDependencies',
    defaultMessage: 'Dependencies',
    description: 'Activity card section: what it waits for and what it blocks',
  },
  tabSubtasks: {
    id: 'taskDetail.tabSubtasks',
    defaultMessage: 'Subactivities',
    description: 'Activity card section: subactivities',
  },
  tabBudget: {
    id: 'taskDetail.tabBudget',
    defaultMessage: 'Budget',
    description: 'Activity card section: budget',
  },
  sectionNav: {
    id: 'taskDetail.sectionNav',
    defaultMessage: 'Sections of this activity',
    description: 'Accessible name of the jump-links above the activity card',
  },
  // Shared labels
  statusLabel: {
    id: 'taskDetail.statusLabel',
    defaultMessage: 'Status',
    description: 'Generic label for the task status field',
  },
  priorityLabel: {
    id: 'taskDetail.priorityLabel',
    defaultMessage: 'Priority',
    description: 'Generic label for the task priority field',
  },
  assigneeLabel: {
    id: 'taskDetail.assigneeLabel',
    defaultMessage: 'Assignee',
    description: 'Generic label for the task assignee field',
  },
  unassigned: {
    id: 'taskDetail.unassigned',
    defaultMessage: 'Unassigned',
    description: 'Fallback value when no user is assigned',
  },
  descriptionLabel: {
    id: 'taskDetail.descriptionLabel',
    defaultMessage: 'Description',
    description:
      'Generic label for the description field on task/subtask forms',
  },
  cancel: {
    id: 'taskDetail.cancel',
    defaultMessage: 'Cancel',
    description: 'Cancel button used across task-detail-view dialogs',
  },
  update: {
    id: 'taskDetail.update',
    defaultMessage: 'Update',
    description: 'Generic update submit label',
  },
  edit: {
    id: 'taskDetail.edit',
    defaultMessage: 'Edit',
    description: 'Generic edit action',
  },
  deleteAction: {
    id: 'taskDetail.deleteAction',
    defaultMessage: 'Delete',
    description: 'Generic delete action',
  },
  delayMessage: {
    id: 'taskDetail.delayMessage',
    defaultMessage:
      '{days, plural, one {Main activity delayed by # day} other {Main activity delayed by # days}}',
    description: 'Banner telling the user the task is delayed by N days',
  },
  // What is holding a row now lives with the component that says it —
  // `blockedReasonMessages` in `features/blocked-reason`, shared by every
  // listing that shows a blocked badge.
  // --- cancel / reopen, and the reason ------------------------------------
  // An activity's state is derived from the progress reported on its subtasks,
  // so the only transition to ask for is the one no percentage can express.
  cancelTask: {
    id: 'taskDetail.cancelTask',
    defaultMessage: 'Cancel main activity',
    description: 'Action that stops an activity — replaces the status picker',
  },
  reopenTask: {
    id: 'taskDetail.reopenTask',
    defaultMessage: 'Reopen main activity',
    description:
      'Action that undoes a cancellation, sending it back to pending',
  },
  cancelModalTitle: {
    id: 'taskDetail.cancelModalTitle',
    defaultMessage: 'Cancel this main activity?',
    description: 'Title of the cancel-activity modal',
  },
  cancelConfirm: {
    id: 'taskDetail.cancelConfirm',
    defaultMessage: 'Cancel it',
    description:
      'Confirm button of the cancel-activity modal — distinct from the dismiss button',
  },
  reopenModalTitle: {
    id: 'taskDetail.reopenModalTitle',
    defaultMessage: 'Reopen this main activity?',
    description: 'Title of the reopen modal',
  },
  reopenConfirm: {
    id: 'taskDetail.reopenConfirm',
    defaultMessage: 'Reopen',
    description: 'Confirm button of the reopen modal',
  },
  cancelTaskSuccess: {
    id: 'taskDetail.cancelTaskSuccess',
    defaultMessage: 'Main activity cancelled',
    description: 'Toast after cancelling an activity',
  },
  reopenSuccess: {
    id: 'taskDetail.reopenSuccess',
    defaultMessage: 'Main activity reopened',
    description: 'Toast after reopening an activity',
  },
  statusUpdateSuccess: {
    id: 'taskDetail.statusUpdateSuccess',
    defaultMessage: 'Status updated',
    description: 'Toast after updating the task status',
  },
  statusUpdateError: {
    id: 'taskDetail.statusUpdateError',
    defaultMessage: 'Could not update the status',
    description: 'Toast when updating the task status fails',
  },
  blockedBadge: {
    id: 'taskDetail.blockedBadge',
    defaultMessage: 'Blocked',
    description: 'Badge on a subtask that is blocked by dependencies',
  },
  headerDetailToggle: {
    id: 'taskDetail.headerDetailToggle',
    defaultMessage: 'View detail',
    description: 'Toggle that folds the header dates and delay note on a phone',
  },
  criticalBadge: {
    id: 'taskDetail.criticalBadge',
    defaultMessage: 'Critical',
    description: 'Badge on a subtask that is on the critical path',
  },
})
