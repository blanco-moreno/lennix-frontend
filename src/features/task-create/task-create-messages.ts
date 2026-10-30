import { defineMessages } from 'react-intl'

// Ids kept from the retired /tasks/new view so the lang bundles stay valid.
export const taskCreateMessages = defineMessages({
  title: {
    id: 'taskCreate.title',
    defaultMessage: 'Create new main activity',
    description: 'Title of the create-activity drawer',
  },
  subtitle: {
    id: 'taskCreate.subtitle',
    defaultMessage: 'New main activity for {project}',
    description:
      'Description under the create-activity drawer title, naming the project',
  },
  newActivity: {
    id: 'taskCreate.newActivity',
    defaultMessage: 'New activity',
    description: 'Button that opens the create-activity drawer in the schedule',
  },
  submit: {
    id: 'taskCreate.submit',
    defaultMessage: 'Create main activity',
    description: 'Primary submit button of the create-activity drawer',
  },
  nameLabel: {
    id: 'taskCreate.nameLabel',
    defaultMessage: 'Main activity name *',
    description: 'Label for the activity name field',
  },
  namePlaceholder: {
    id: 'taskCreate.namePlaceholder',
    defaultMessage: 'e.g. Electrical system installation',
    description: 'Placeholder for the activity name field',
  },
  descriptionLabel: {
    id: 'taskCreate.descriptionLabel',
    defaultMessage: 'Description',
    description: 'Label for the activity description field',
  },
  descriptionPlaceholder: {
    id: 'taskCreate.descriptionPlaceholder',
    defaultMessage:
      'Detailed description of the main activity, objectives and scope…',
    description: 'Placeholder for the activity description field',
  },
  priorityLabel: {
    id: 'taskCreate.priorityLabel',
    defaultMessage: 'Priority level',
    description: 'Label for the priority select',
  },
  budgetLabel: {
    id: 'taskCreate.budgetLabel',
    defaultMessage: 'Allocated budget ({currency})',
    description: 'Label for the budget field',
  },
  budgetHelp: {
    id: 'taskCreate.budgetHelp',
    defaultMessage: 'Enter the total budget allocated to this main activity',
    description: 'Help text under the budget field',
  },
  budgetSummary: {
    id: 'taskCreate.budgetSummary',
    defaultMessage: 'Budget: {amount}',
    description: 'Confirmation chip showing the formatted budget amount',
  },
  assigneeLabel: {
    id: 'taskCreate.assigneeLabel',
    defaultMessage: 'Responsible',
    description: 'Label for the responsible/assignee picker',
  },
  assigneeUnassigned: {
    id: 'taskCreate.assigneeUnassigned',
    defaultMessage: 'Unassigned',
    description: 'Placeholder/option for no responsible person',
  },
  locationLabel: {
    id: 'taskCreate.locationLabel',
    defaultMessage: 'Location',
    description: 'Label for the location field',
  },
  locationPlaceholder: {
    id: 'taskCreate.locationPlaceholder',
    defaultMessage: 'e.g. Tower B, level 3',
    description: 'Placeholder for the location field',
  },
  createSuccessToast: {
    id: 'taskCreate.createSuccessToast',
    defaultMessage: 'Main activity created successfully',
    description: 'Success toast after creating an activity',
  },
  createErrorToast: {
    id: 'taskCreate.createErrorToast',
    defaultMessage: 'Could not create the main activity',
    description: 'Fallback error toast when the create request fails',
  },
})
