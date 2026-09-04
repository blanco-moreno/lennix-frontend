import { defineMessages } from 'react-intl'

export const expenseManagementMessages = defineMessages({
  // Form (inline + modals share these labels)
  descriptionLabel: {
    id: 'expenseManagement.descriptionLabel',
    defaultMessage: 'Description',
    description: 'Label for the expense description field',
  },
  descriptionPlaceholder: {
    id: 'expenseManagement.descriptionPlaceholder',
    defaultMessage: 'Enter description',
    description: 'Placeholder for the expense description field',
  },
  descriptionPlaceholderEs: {
    id: 'expenseManagement.descriptionPlaceholderEs',
    defaultMessage: 'Expense description',
    description: 'Placeholder for the expense description field in the modal',
  },
  amountLabel: {
    id: 'expenseManagement.amountLabel',
    defaultMessage: 'Amount',
    description: 'Label for the expense amount field',
  },
  categoryLabel: {
    id: 'expenseManagement.categoryLabel',
    defaultMessage: 'Category',
    description: 'Label for the expense category field',
  },
  categoryPlaceholder: {
    id: 'expenseManagement.categoryPlaceholder',
    defaultMessage: 'Select category',
    description: 'Placeholder for the expense category select',
  },
  dateLabel: {
    id: 'expenseManagement.dateLabel',
    defaultMessage: 'Date',
    description: 'Label for the expense date field',
  },

  // Categories
  categoryLabor: {
    id: 'expenseManagement.categoryLabor',
    defaultMessage: 'Labor',
    description: 'Expense category: labor',
  },
  categoryMaterials: {
    id: 'expenseManagement.categoryMaterials',
    defaultMessage: 'Materials',
    description: 'Expense category: materials',
  },
  categoryEquipment: {
    id: 'expenseManagement.categoryEquipment',
    defaultMessage: 'Equipment',
    description: 'Expense category: equipment',
  },
  categorySubcontractor: {
    id: 'expenseManagement.categorySubcontractor',
    defaultMessage: 'Subcontractor',
    description: 'Expense category: subcontractor',
  },
  categoryOther: {
    id: 'expenseManagement.categoryOther',
    defaultMessage: 'Other',
    description: 'Expense category: other',
  },

  // Buttons / actions
  addExpense: {
    id: 'expenseManagement.addExpense',
    defaultMessage: 'Add expense',
    description: 'Submit button on the inline expense form',
  },
  creating: {
    id: 'expenseManagement.creating',
    defaultMessage: 'Creating…',
    description:
      'Submit button label while the create-expense request is in flight',
  },
  edit: {
    id: 'expenseManagement.edit',
    defaultMessage: 'Edit',
    description: 'Per-row edit button in the expense list',
  },
  deleteButton: {
    id: 'expenseManagement.deleteButton',
    defaultMessage: 'Delete',
    description: 'Per-row delete button in the expense list',
  },
  deleting: {
    id: 'expenseManagement.deleting',
    defaultMessage: 'Deleting…',
    description: 'Per-row delete button label while the request is in flight',
  },
  cancel: {
    id: 'expenseManagement.cancel',
    defaultMessage: 'Cancel',
    description: 'Cancel button in confirm dialogs',
  },

  // Create modal
  createTitle: {
    id: 'expenseManagement.createTitle',
    defaultMessage: 'Register expense',
    description: 'Title of the expense create modal',
  },
  createSubtitle: {
    id: 'expenseManagement.createSubtitle',
    defaultMessage: 'Add a new expense to a subactivity.',
    description: 'Subtitle of the expense create modal',
  },
  subtaskLabel: {
    id: 'expenseManagement.subtaskLabel',
    defaultMessage: 'Subactivity',
    description: 'Label of the subtask select in the expense create modal',
  },
  subtaskPlaceholder: {
    id: 'expenseManagement.subtaskPlaceholder',
    defaultMessage: 'Select subactivity',
    description:
      'Placeholder for the subtask select in the expense create modal',
  },
  createSubmit: {
    id: 'expenseManagement.createSubmit',
    defaultMessage: 'Create expense',
    description: 'Submit button label in the expense create modal',
  },

  // Edit modal
  editTitle: {
    id: 'expenseManagement.editTitle',
    defaultMessage: 'Edit expense',
    description: 'Title of the expense edit modal',
  },
  editSubmit: {
    id: 'expenseManagement.editSubmit',
    defaultMessage: 'Save changes',
    description: 'Submit button label in the expense edit modal',
  },

  // Delete dialog
  deleteTitle: {
    id: 'expenseManagement.deleteTitle',
    defaultMessage: 'Delete expense',
    description: 'Title of the delete-expense confirmation dialog',
  },
  deleteDescription: {
    id: 'expenseManagement.deleteDescription',
    defaultMessage:
      'Are you sure you want to delete "{name}"? This action cannot be undone.',
    description: 'Body of the delete-expense confirmation dialog',
  },

  // List columns + states (shared by the project and task expense tables)
  columnSubtask: {
    id: 'expenseManagement.columnSubtask',
    defaultMessage: 'Subactivity',
    description: 'Expense list column header for the subactivity',
  },
  columnDescription: {
    id: 'expenseManagement.columnDescription',
    defaultMessage: 'Description',
    description: 'Expense list column header for the description',
  },
  columnAmount: {
    id: 'expenseManagement.columnAmount',
    defaultMessage: 'Amount',
    description: 'Expense list column header for the amount',
  },
  columnCategory: {
    id: 'expenseManagement.columnCategory',
    defaultMessage: 'Category',
    description: 'Expense list column header for the category',
  },
  columnDate: {
    id: 'expenseManagement.columnDate',
    defaultMessage: 'Date',
    description: 'Expense list column header for the date',
  },
  columnActions: {
    id: 'expenseManagement.columnActions',
    defaultMessage: 'Actions',
    description: 'Expense list column header for the action buttons',
  },
  listError: {
    id: 'expenseManagement.listError',
    defaultMessage: 'Could not load expenses.',
    description: 'Error message in the expense list when the query fails',
  },
  listEmptyTitle: {
    id: 'expenseManagement.listEmptyTitle',
    defaultMessage: 'No expenses',
    description: 'Empty state title in the expense list',
  },
  listEmptyDescription: {
    id: 'expenseManagement.listEmptyDescription',
    defaultMessage: 'No expenses are recorded for this subactivity.',
    description: 'Empty state body in the expense list',
  },
  listTableEmpty: {
    id: 'expenseManagement.listTableEmpty',
    defaultMessage: 'No expenses recorded.',
    description: 'DataTable empty placeholder in the expense list',
  },

  // Toasts
  createSuccess: {
    id: 'expenseManagement.createSuccess',
    defaultMessage: 'Expense created successfully',
    description: 'Success toast after creating an expense',
  },
  createError: {
    id: 'expenseManagement.createError',
    defaultMessage: 'Could not create the expense',
    description: 'Error toast when create-expense fails',
  },
  updateSuccess: {
    id: 'expenseManagement.updateSuccess',
    defaultMessage: 'Expense updated successfully',
    description: 'Success toast after updating an expense',
  },
  updateError: {
    id: 'expenseManagement.updateError',
    defaultMessage: 'Could not update the expense',
    description: 'Error toast when update-expense fails',
  },
  deleteSuccess: {
    id: 'expenseManagement.deleteSuccess',
    defaultMessage: 'Expense deleted successfully',
    description: 'Success toast after deleting an expense',
  },
  deleteError: {
    id: 'expenseManagement.deleteError',
    defaultMessage: 'Could not delete the expense',
    description: 'Error toast when delete-expense fails',
  },

  // Cost report
  costLoading: {
    id: 'expenseManagement.costLoading',
    defaultMessage: 'Loading cost report…',
    description: 'Loading state of the cost report tab',
  },
  costError: {
    id: 'expenseManagement.costError',
    defaultMessage: 'Could not load the cost report.',
    description: 'Error message when the cost report query fails',
  },
  categoryBreakdown: {
    id: 'expenseManagement.categoryBreakdown',
    defaultMessage: 'Category breakdown',
    description: 'Heading of the category breakdown section in the cost report',
  },
  categoryBreakdownEmpty: {
    id: 'expenseManagement.categoryBreakdownEmpty',
    defaultMessage: 'No expenses recorded yet.',
    description:
      'Empty state in the category breakdown section when there are no expenses',
  },
  taskVariances: {
    id: 'expenseManagement.taskVariances',
    defaultMessage: 'Variances by main activity',
    description: 'Heading of the task variances table in the cost report',
  },
  taskVariancesEmpty: {
    id: 'expenseManagement.taskVariancesEmpty',
    defaultMessage: 'No variance data available.',
    description: 'Empty state in the task variances section',
  },
  columnTask: {
    id: 'expenseManagement.columnTask',
    defaultMessage: 'Main activity',
    description: 'Cost report task variances column: activity name',
  },
  columnBudget: {
    id: 'expenseManagement.columnBudget',
    defaultMessage: 'Budget',
    description: 'Cost report task variances column: budget amount',
  },
  columnSpent: {
    id: 'expenseManagement.columnSpent',
    defaultMessage: 'Spent',
    description: 'Cost report task variances column: spent amount',
  },
  columnRemaining: {
    id: 'expenseManagement.columnRemaining',
    defaultMessage: 'Remaining',
    description: 'Cost report task variances column: remaining amount',
  },
  columnVariance: {
    id: 'expenseManagement.columnVariance',
    defaultMessage: 'Variance',
    description: 'Cost report task variances column: variance percentage',
  },
  columnStatus: {
    id: 'expenseManagement.columnStatus',
    defaultMessage: 'Status',
    description: 'Cost report task variances column: status badge',
  },
  statusOverBudget: {
    id: 'expenseManagement.statusOverBudget',
    defaultMessage: 'Over budget',
    description: 'Variance status badge when the entity exceeds its budget',
  },
  statusInRange: {
    id: 'expenseManagement.statusInRange',
    defaultMessage: 'In range',
    description: 'Variance status badge when the entity is within budget',
  },
  budgetNa: {
    id: 'expenseManagement.budgetNa',
    defaultMessage: 'N/A',
    description: 'Cost report cell shown when the entity has no budget set',
  },

  // Imputation & Layers
  imputationTypeLabel: {
    id: 'expenseManagement.imputationTypeLabel',
    defaultMessage: 'Charge to',
    description: 'Label for expense imputation target (subtask vs project)',
  },
  imputationSubtask: {
    id: 'expenseManagement.imputationSubtask',
    defaultMessage: 'Subtask',
    description: 'Option to charge expense to a subtask',
  },
  imputationProject: {
    id: 'expenseManagement.imputationProject',
    defaultMessage: 'Project direct',
    description: 'Option to charge expense directly to the project',
  },
  layerProjectDirect: {
    id: 'expenseManagement.layerProjectDirect',
    defaultMessage: 'Project direct',
    description:
      'Table badge/cell text when an expense is charged directly to the project',
  },
  filterLayerLabel: {
    id: 'expenseManagement.filterLayerLabel',
    defaultMessage: 'Layer',
    description: 'Filter dropdown label for expense layer',
  },
  filterAllLayers: {
    id: 'expenseManagement.filterAllLayers',
    defaultMessage: 'All levels',
    description: 'Filter option for all expense levels',
  },
  filterProjectLayer: {
    id: 'expenseManagement.filterProjectLayer',
    defaultMessage: 'Project direct',
    description: 'Filter option for project-level expenses only',
  },
  filterSubtaskLayer: {
    id: 'expenseManagement.filterSubtaskLayer',
    defaultMessage: 'Subtasks',
    description: 'Filter option for subtask expenses only',
  },
  addProjectExpense: {
    id: 'expenseManagement.addProjectExpense',
    defaultMessage: 'Add expense',
    description: 'Button label to add an expense from the project expenses tab',
  },
  columnDocument: {
    id: 'expenseManagement.columnDocument',
    defaultMessage: 'Document',
    description: 'Table column header for tax document type and number',
  },

  // Tax Document
  documentTypeLabel: {
    id: 'expenseManagement.documentTypeLabel',
    defaultMessage: 'Document type',
    description: 'Label for document type field',
  },
  documentTypePlaceholder: {
    id: 'expenseManagement.documentTypePlaceholder',
    defaultMessage: 'Select document type (optional)',
    description: 'Placeholder for document type select',
  },
  documentTypeInvoice: {
    id: 'expenseManagement.documentTypeInvoice',
    defaultMessage: 'Invoice',
    description: 'Document type option: invoice',
  },
  documentTypeReceipt: {
    id: 'expenseManagement.documentTypeReceipt',
    defaultMessage: 'Receipt',
    description: 'Document type option: receipt',
  },
  documentTypePurchaseOrder: {
    id: 'expenseManagement.documentTypePurchaseOrder',
    defaultMessage: 'Purchase order',
    description: 'Document type option: purchase order',
  },
  documentNumberLabel: {
    id: 'expenseManagement.documentNumberLabel',
    defaultMessage: 'Document number',
    description: 'Label for document number field',
  },
  documentNumberPlaceholder: {
    id: 'expenseManagement.documentNumberPlaceholder',
    defaultMessage: 'e.g. INV-2026-001',
    description: 'Placeholder for document number field',
  },

  // Attachments
  attachmentLabel: {
    id: 'expenseManagement.attachmentLabel',
    defaultMessage: 'Attachment',
    description: 'Label for expense file attachment',
  },
  attachmentDropzonePrompt: {
    id: 'expenseManagement.attachmentDropzonePrompt',
    defaultMessage: 'Click or drop document (PDF, PNG, JPG up to 20MB)',
    description: 'Prompt text inside file attachment dropzone',
  },
  attachmentDownload: {
    id: 'expenseManagement.attachmentDownload',
    defaultMessage: 'Download attachment',
    description: 'Action to download the attached file',
  },
  attachmentDelete: {
    id: 'expenseManagement.attachmentDelete',
    defaultMessage: 'Remove attachment',
    description: 'Action to remove the attached file',
  },
  attachmentUploadSuccess: {
    id: 'expenseManagement.attachmentUploadSuccess',
    defaultMessage: 'Attachment uploaded successfully',
    description: 'Toast when attachment is uploaded',
  },
  attachmentUploadError: {
    id: 'expenseManagement.attachmentUploadError',
    defaultMessage: 'Could not upload attachment',
    description: 'Toast when attachment upload fails',
  },
  attachmentDeleteSuccess: {
    id: 'expenseManagement.attachmentDeleteSuccess',
    defaultMessage: 'Attachment removed successfully',
    description: 'Toast when attachment is removed',
  },
  attachmentDeleteError: {
    id: 'expenseManagement.attachmentDeleteError',
    defaultMessage: 'Could not remove attachment',
    description: 'Toast when attachment removal fails',
  },
})

export const DOCUMENT_TYPE_OPTIONS = [
  { value: 'invoice', label: expenseManagementMessages.documentTypeInvoice },
  { value: 'receipt', label: expenseManagementMessages.documentTypeReceipt },
  {
    value: 'purchase_order',
    label: expenseManagementMessages.documentTypePurchaseOrder,
  },
] as const
