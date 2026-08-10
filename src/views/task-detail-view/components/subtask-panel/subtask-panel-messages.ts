import { defineMessages } from 'react-intl'

/** Catalog for the subtask panel — wording only it renders. */
export const subtaskPanelMessages = defineMessages({
  cancelSubtask: {
    id: 'taskDetail.cancelSubtask',
    defaultMessage: 'Cancel subactivity',
    description: 'Per-subactivity dropdown action to cancel it',
  },
  reopenSubtask: {
    id: 'taskDetail.reopenSubtask',
    defaultMessage: 'Reopen subactivity',
    description: 'Per-subactivity dropdown action to reopen it',
  },
  subtaskCancelDialogTitle: {
    id: 'taskDetail.subtaskCancelDialogTitle',
    defaultMessage: 'Cancel this subactivity?',
    description: 'Title of the cancel-subactivity drawer',
  },
  subtaskReopenDialogTitle: {
    id: 'taskDetail.subtaskReopenDialogTitle',
    defaultMessage: 'Reopen this subactivity?',
    description: 'Title of the reopen-subactivity drawer',
  },
  subtaskCancelDialogDescription: {
    id: 'taskDetail.subtaskCancelDialogDescription',
    defaultMessage:
      '{name} stops counting towards the schedule and its progress returns to 0%.',
    description: 'Confirmation body when cancelling a subactivity',
  },
  subtaskReopenDialogDescription: {
    id: 'taskDetail.subtaskReopenDialogDescription',
    defaultMessage: '{name} goes back to pending and counts again.',
    description: 'Confirmation body when reopening a subactivity',
  },
  subtasksHeading: {
    id: 'taskDetail.subtasksHeading',
    defaultMessage: 'Subactivities ({count})',
    description: 'Heading of the subtask panel with the row count',
  },
  addSubtaskButton: {
    id: 'taskDetail.addSubtaskButton',
    defaultMessage: 'Add subactivity',
    description: 'Button to open the create-subtask modal',
  },
  noSubtasksTitle: {
    id: 'taskDetail.noSubtasksTitle',
    defaultMessage: 'No subactivities',
    description: 'Empty state title in the subtask panel',
  },
  noSubtasksDescription: {
    id: 'taskDetail.noSubtasksDescription',
    defaultMessage:
      'No subactivities yet. Create the first one using the button above.',
    description: 'Empty state body in the subtask panel',
  },
  subtaskTableLabel: {
    id: 'taskDetail.subtaskTableLabel',
    defaultMessage: 'Subactivities',
    description: 'Accessible name of the subactivity listing table',
  },
  columnSubtask: {
    id: 'taskDetail.columnSubtask',
    defaultMessage: 'Subactivity',
    description: 'Column header: the subactivity name',
  },
  columnProgress: {
    id: 'taskDetail.columnProgress',
    defaultMessage: 'Progress',
    description: 'Column header: reported progress',
  },
  columnStatus: {
    id: 'taskDetail.columnStatus',
    defaultMessage: 'Status',
    description: 'Column header: subactivity status',
  },
  columnAssignee: {
    id: 'taskDetail.columnAssignee',
    defaultMessage: 'Assignee',
    description: 'Column header: who is responsible',
  },
  columnPriority: {
    id: 'taskDetail.columnPriority',
    defaultMessage: 'Priority',
    description: 'Column header: subactivity priority',
  },
  columnDates: {
    id: 'taskDetail.columnDates',
    defaultMessage: 'Dates',
    description: 'Column header: the subactivity start–due span, one cell',
  },
  columnActions: {
    id: 'taskDetail.columnActions',
    defaultMessage: 'Actions',
    description: 'Screen-reader name of the trailing actions column',
  },
  subtaskActions: {
    id: 'taskDetail.subtaskActions',
    defaultMessage: 'Actions for {name}',
    description: 'Accessible name of the per-row actions menu',
  },
  subtaskReportProgressAction: {
    id: 'taskDetail.subtaskReportProgressAction',
    defaultMessage: 'Report progress on {name}',
    description: 'Accessible name of the per-row report-progress button',
  },
  subtaskFilterSearchLabel: {
    id: 'taskDetail.subtaskFilterSearchLabel',
    defaultMessage: 'Search',
    description: 'Label of the subactivity search box',
  },
  subtaskFilterSearchPlaceholder: {
    id: 'taskDetail.subtaskFilterSearchPlaceholder',
    defaultMessage: 'Search by name or assignee…',
    description: 'Placeholder of the subactivity search box',
  },
  subtaskFilterStatusLabel: {
    id: 'taskDetail.subtaskFilterStatusLabel',
    defaultMessage: 'Status',
    description: 'Label of the subactivity status filter',
  },
  subtaskFilterStatusAll: {
    id: 'taskDetail.subtaskFilterStatusAll',
    defaultMessage: 'All statuses',
    description: 'Status filter option that shows every subactivity',
  },
  subtaskFilterResults: {
    id: 'taskDetail.subtaskFilterResults',
    defaultMessage:
      'Showing {filtered} of {total, plural, one {# subactivity} other {# subactivities}}',
    description: 'Result count under the subactivity filter bar',
  },
  subtaskNoMatchesTitle: {
    id: 'taskDetail.subtaskNoMatchesTitle',
    defaultMessage: 'No subactivities match',
    description: 'Empty state title when the filters match nothing',
  },
  subtaskNoMatchesDescription: {
    id: 'taskDetail.subtaskNoMatchesDescription',
    defaultMessage: 'Adjust or reset the filters to see the list again.',
    description: 'Empty state body when the filters match nothing',
  },
  subtaskDeleteDialogTitle: {
    id: 'taskDetail.subtaskDeleteDialogTitle',
    defaultMessage: 'Delete subactivity',
    description: 'Title of the delete-subtask confirmation dialog',
  },
  subtaskDeleteDialogDescription: {
    id: 'taskDetail.subtaskDeleteDialogDescription',
    defaultMessage:
      'Are you sure you want to delete "{name}"? This action cannot be undone.',
    description: 'Body of the delete-subtask confirmation dialog',
  },
  subtaskDeleteSuccess: {
    id: 'taskDetail.subtaskDeleteSuccess',
    defaultMessage: 'Subactivity deleted',
    description: 'Toast after a subtask is deleted',
  },
  subtaskDeleteError: {
    id: 'taskDetail.subtaskDeleteError',
    defaultMessage: 'Could not delete the subactivity',
    description: 'Toast when deleting a subtask fails',
  },
})
