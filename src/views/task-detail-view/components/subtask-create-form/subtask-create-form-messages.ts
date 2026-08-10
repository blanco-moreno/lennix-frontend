import { defineMessages } from 'react-intl'

/** Catalog for the subtask create modal — wording only it renders. */
export const subtaskCreateModalMessages = defineMessages({
  titleLabel: {
    id: 'taskDetail.titleLabel',
    defaultMessage: 'Title',
    description: 'Generic label for the title field on task/subtask forms',
  },
  create: {
    id: 'taskDetail.create',
    defaultMessage: 'Create',
    description: 'Generic create submit label',
  },
  subtaskCreateTitle: {
    id: 'taskDetail.subtaskCreateTitle',
    defaultMessage: 'Create subactivity',
    description: 'Title of the create-subtask modal',
  },
  subtaskCreateDescription: {
    id: 'taskDetail.subtaskCreateDescription',
    defaultMessage: 'New subactivity under “{parent}”.',
    description:
      'Subtitle of the create-subtask drawer — names the parent activity',
  },
  subtaskCreateTitlePlaceholder: {
    id: 'taskDetail.subtaskCreateTitlePlaceholder',
    defaultMessage: 'Subactivity name',
    description: 'Placeholder of the subtask title input',
  },
  subtaskCreateDescriptionPlaceholder: {
    id: 'taskDetail.subtaskCreateDescriptionPlaceholder',
    defaultMessage: 'Optional description',
    description: 'Placeholder of the subtask description textarea',
  },
  subtaskCreateSuccess: {
    id: 'taskDetail.subtaskCreateSuccess',
    defaultMessage: 'Subactivity created',
    description: 'Toast after creating a subtask',
  },
  subtaskCreateError: {
    id: 'taskDetail.subtaskCreateError',
    defaultMessage: 'Could not create the subactivity',
    description: 'Toast when creating a subtask fails',
  },
})
