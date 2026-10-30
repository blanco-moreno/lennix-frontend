import { defineMessages } from 'react-intl'

/** Catalog for the project edit modal — wording only it renders. */
export const projectEditModalMessages = defineMessages({
  editModalTitle: {
    id: 'projectDetail.editModalTitle',
    defaultMessage: 'Edit project',
    description: 'Title of the project edit modal',
  },
  editModalDescription: {
    id: 'projectDetail.editModalDescription',
    defaultMessage: 'Update the general information for {project}.',
    description: 'Subtitle of the project edit modal, naming the project',
  },
  editModalSubmit: {
    id: 'projectDetail.editModalSubmit',
    defaultMessage: 'Save changes',
    description: 'Submit button label in the project edit modal',
  },
  projectNameLabel: {
    id: 'projectDetail.projectNameLabel',
    defaultMessage: 'Project name',
    description: 'Label of the project name input',
  },
  projectNamePlaceholder: {
    id: 'projectDetail.projectNamePlaceholder',
    defaultMessage: 'E.g. North Residential Tower',
    description: 'Placeholder of the project name input',
  },
  projectDescriptionLabel: {
    id: 'projectDetail.projectDescriptionLabel',
    defaultMessage: 'Description',
    description: 'Label of the project description textarea',
  },
  projectDescriptionPlaceholder: {
    id: 'projectDetail.projectDescriptionPlaceholder',
    defaultMessage: 'Briefly describe the project scope…',
    description: 'Placeholder of the project description textarea',
  },
  projectLocationLabel: {
    id: 'projectDetail.projectLocationLabel',
    defaultMessage: 'Location',
    description: 'Label of the project location input',
  },
  projectLocationPlaceholder: {
    id: 'projectDetail.projectLocationPlaceholder',
    defaultMessage: 'Address or location description',
    description: 'Placeholder of the project location input',
  },
  priorityLabel: {
    id: 'projectDetail.priorityLabel',
    defaultMessage: 'Priority',
    description: 'Label of the priority select in the project edit drawer',
  },
  budgetFieldLabel: {
    id: 'projectDetail.budgetFieldLabel',
    defaultMessage: 'Budget ({currency})',
    description: 'Label of the budget input in the project edit drawer',
  },
  currencyFieldLabel: {
    id: 'projectDetail.currencyFieldLabel',
    defaultMessage: 'Currency',
    description: 'Label of the currency picker in the project edit drawer',
  },
  currencyFieldHint: {
    id: 'projectDetail.currencyFieldHint',
    defaultMessage:
      'Every amount of the project is in this currency. Changing it does not convert them.',
    description:
      'Helper under the currency picker; a relabel, never a conversion',
  },
  budgetRequestNotice: {
    id: 'projectDetail.budgetRequestNotice',
    defaultMessage:
      'You are requesting a budget change. It will apply once an approver accepts it.',
    description:
      'Notice shown when the role can only request budget changes, not apply them',
  },
  savedBudgetPending: {
    id: 'projectDetail.savedBudgetPending',
    defaultMessage:
      'Changes saved. The budget change was sent for approval and is still pending.',
    description:
      'Toast when the edit saved but the budget change went to the approval flow',
  },
  updatePartialError: {
    id: 'projectDetail.updatePartialError',
    defaultMessage: 'Some changes were saved, but others failed. Try again.',
    description: 'Toast when only part of the project edit could be saved',
  },
  updateSuccess: {
    id: 'projectDetail.updateSuccess',
    defaultMessage: 'Project updated',
    description: 'Toast after the project is updated from the edit modal',
  },
  updateError: {
    id: 'projectDetail.updateError',
    defaultMessage: 'Could not update the project',
    description: 'Toast when updating the project fails',
  },
})
