import { defineMessages } from 'react-intl'

export const trashMessages = defineMessages({
  pageTitle: {
    id: 'trash.pageTitle',
    defaultMessage: 'Trash',
    description: 'Title of the papelera page',
  },
  pageSubtitle: {
    id: 'trash.pageSubtitle',
    defaultMessage:
      'Soft-deleted projects, activities and expenses kept for audit. Restore brings them back; purge removes them permanently (admin only).',
    description: 'Subtitle of the papelera page',
  },

  tabProjects: {
    id: 'trash.tabProjects',
    defaultMessage: 'Projects',
    description: 'Tab in the papelera for trashed projects',
  },
  tabTasks: {
    id: 'trash.tabTasks',
    defaultMessage: 'Main activities and subactivities',
    description:
      'Tab in the papelera for trashed tasks — it holds both levels, so it names both',
  },
  // The two levels, in the vocabulary the rest of the product settled on.
  levelTask: {
    id: 'trash.levelTask',
    defaultMessage: 'Main activity',
    description: 'Level marker of a trashed top-level task',
  },
  levelSubtask: {
    id: 'trash.levelSubtask',
    defaultMessage: 'Subactivity',
    description: 'Level marker of a trashed subtask',
  },
  selectedCount: {
    id: 'trash.selectedCount',
    defaultMessage: '{count, plural, one {# selected} other {# selected}}',
    description: 'How many rows are ticked in the papelera',
  },
  selectRow: {
    id: 'trash.selectRow',
    defaultMessage: 'Select {name}',
    description: 'Accessible name of a row checkbox in the papelera',
  },
  tabExpenses: {
    id: 'trash.tabExpenses',
    defaultMessage: 'Expenses',
    description: 'Tab in the papelera for trashed expenses',
  },

  emptyTitle: {
    id: 'trash.emptyTitle',
    defaultMessage: 'Trash is empty',
    description: 'Empty state title in the papelera',
  },
  emptyBody: {
    id: 'trash.emptyBody',
    defaultMessage:
      'Nothing has been deleted yet. Items removed from the active surfaces appear here for restore or permanent deletion.',
    description: 'Empty state body',
  },

  columnName: {
    id: 'trash.columnName',
    defaultMessage: 'Name',
    description: 'Trash row label: name/title',
  },
  columnAmount: {
    id: 'trash.columnAmount',
    defaultMessage: 'Amount',
    description: 'Trash row label: expense amount',
  },
  columnDeletedAt: {
    id: 'trash.columnDeletedAt',
    defaultMessage: 'Deleted at',
    description: 'Trash row label: when the row was soft-deleted',
  },
  columnActions: {
    id: 'trash.columnActions',
    defaultMessage: 'Actions',
    description: 'Visually hidden header of the restore/purge column',
  },

  restoreButton: {
    id: 'trash.restoreButton',
    defaultMessage: 'Restore',
    description: 'Per-row restore action',
  },
  purgeButton: {
    id: 'trash.purgeButton',
    defaultMessage: 'Delete forever',
    description: 'Per-row physical-delete action (admin only)',
  },

  restoreSuccess: {
    id: 'trash.restoreSuccess',
    defaultMessage: 'Item restored',
    description: 'Toast after restore',
  },
  restoreError: {
    id: 'trash.restoreError',
    defaultMessage: 'Could not restore the item',
    description: 'Toast when restore fails',
  },
  purgeSuccess: {
    id: 'trash.purgeSuccess',
    defaultMessage: 'Item permanently deleted',
    description: 'Toast after purge',
  },
  purgeError: {
    id: 'trash.purgeError',
    defaultMessage: 'Could not delete the item',
    description: 'Toast when purge fails',
  },

  purgeConfirmTitle: {
    id: 'trash.purgeConfirmTitle',
    defaultMessage: 'Delete forever?',
    description: 'Title of the purge confirmation dialog',
  },
  purgeConfirmBody: {
    id: 'trash.purgeConfirmBody',
    defaultMessage:
      'This will remove the item and its children from the database permanently. The action cannot be undone.',
    description: 'Body of the purge confirmation dialog',
  },
  cancel: {
    id: 'trash.cancel',
    defaultMessage: 'Cancel',
    description: 'Cancel button in the purge dialog',
  },

  navLink: {
    id: 'trash.navLink',
    defaultMessage: 'Trash',
    description: 'Sidebar link to the papelera',
  },

  selectAll: {
    id: 'trash.selectAll',
    defaultMessage: 'Select All',
    description: 'Checkbox helper button to select all items',
  },
  deselectAll: {
    id: 'trash.deselectAll',
    defaultMessage: 'Deselect All',
    description: 'Checkbox helper button to deselect all items',
  },
  deleteSelected: {
    id: 'trash.deleteSelected',
    defaultMessage: 'Delete Selected',
    description: 'Header button to bulk purge selected items',
  },
  bulkPurgeConfirmTitle: {
    id: 'trash.bulkPurgeConfirmTitle',
    defaultMessage: 'Delete selected forever?',
    description: 'Title of the bulk purge confirmation dialog',
  },
  bulkPurgeConfirmBody: {
    id: 'trash.bulkPurgeConfirmBody',
    defaultMessage:
      'This will remove all selected items and their child records from the database permanently. The action cannot be undone.',
    description: 'Body of the bulk purge confirmation dialog',
  },
  bulkPurgeSuccess: {
    id: 'trash.bulkPurgeSuccess',
    defaultMessage: 'Selected items permanently deleted',
    description: 'Toast after successful bulk purge',
  },
  bulkPurgeError: {
    id: 'trash.bulkPurgeError',
    defaultMessage: 'Could not delete selected items',
    description: 'Toast when bulk purge fails',
  },
})
