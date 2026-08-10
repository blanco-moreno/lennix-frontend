import { defineMessages } from 'react-intl'

export const draftsViewMessages = defineMessages({
  title: {
    id: 'draftsHome.title',
    defaultMessage: 'Drafts',
    description: 'Title of the Borradores home',
  },
  subtitle: {
    id: 'draftsHome.subtitle',
    defaultMessage: 'Imports waiting to become a live schedule',
    description: 'Subtitle of the Borradores home',
  },
  importSchedule: {
    id: 'draftsHome.importSchedule',
    defaultMessage: 'Import schedule',
    description: 'CTA in the drafts home that starts a new import',
  },
  selectAll: {
    id: 'draftsHome.selectAll',
    defaultMessage: 'Select all',
    description: 'Checkbox that selects every draft on the page',
  },
  selectedCount: {
    id: 'draftsHome.selectedCount',
    defaultMessage: '{count} selected',
    description: 'How many drafts are currently selected',
  },
  deleteSelected: {
    id: 'draftsHome.deleteSelected',
    defaultMessage: 'Delete selected',
    description: 'Button that discards the selected drafts',
  },
  deleteDialogTitle: {
    id: 'draftsHome.deleteDialogTitle',
    defaultMessage: 'Discard the selected drafts?',
    description: 'Title of the bulk draft delete confirmation',
  },
  deleteDialogBody: {
    id: 'draftsHome.deleteDialogBody',
    defaultMessage:
      '{count, plural, one {# draft and everything parsed into it will be discarded.} other {# drafts and everything parsed into them will be discarded.}}',
    description: 'Body of the bulk draft delete confirmation',
  },
  deleteConfirm: {
    id: 'draftsHome.deleteConfirm',
    defaultMessage: 'Discard',
    description: 'Confirm button of the bulk draft delete dialog',
  },
  deleteCancel: {
    id: 'draftsHome.deleteCancel',
    defaultMessage: 'Keep them',
    description: 'Cancel button of the bulk draft delete dialog',
  },
  deleteSuccess: {
    id: 'draftsHome.deleteSuccess',
    defaultMessage:
      '{count, plural, one {# draft discarded} other {# drafts discarded}}',
    description: 'Toast after discarding drafts',
  },
  deleteError: {
    id: 'draftsHome.deleteError',
    defaultMessage: 'Could not discard the selected drafts',
    description: 'Toast when the bulk draft delete fails',
  },
  emptyTitle: {
    id: 'draftsHome.emptyTitle',
    defaultMessage: 'No drafts waiting',
    description: 'Empty state of the drafts home',
  },
  emptyDescription: {
    id: 'draftsHome.emptyDescription',
    defaultMessage:
      'Import a schedule and it will land here until you activate it.',
    description: 'Empty-state body of the drafts home',
  },
  loadError: {
    id: 'draftsHome.loadError',
    defaultMessage: 'Could not load drafts',
    description: 'Error shown when the drafts query fails',
  },
})
