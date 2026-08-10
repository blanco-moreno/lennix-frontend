import { defineMessages } from 'react-intl'

/**
 * Validation message catalog for the task/subtask schemas. The Zod schemas
 * store the catalog **key** (e.g. `taskNameRequired`) as the message;
 * `useZodResolverIntl` looks it up here and translates it at submit time.
 */
export const taskValidationMessages = defineMessages({
  taskNameRequired: {
    id: 'taskValidation.taskNameRequired',
    defaultMessage: 'The main activity name is required',
    description: 'Task create validation: name field is empty',
  },
  projectRequired: {
    id: 'taskValidation.projectRequired',
    defaultMessage: 'You must select a project',
    description: 'Task create validation: no project selected',
  },
  budgetNegative: {
    id: 'taskValidation.budgetNegative',
    defaultMessage: 'The budget cannot be negative',
    description: 'Task create validation: budget below zero',
  },
  titleRequired: {
    id: 'taskValidation.titleRequired',
    defaultMessage: 'The title is required',
    description: 'Task/subtask validation: title field is empty',
  },
  dueBeforeStart: {
    id: 'taskValidation.dueBeforeStart',
    defaultMessage: 'The end date cannot be before the start date',
    description: 'Subtask date validation: due date earlier than start date',
  },
  budgetRequired: {
    id: 'taskValidation.budgetRequired',
    defaultMessage: 'The budget is required',
    description: 'Task budget validation: budget field is empty',
  },
  progressBelowMin: {
    id: 'taskValidation.progressBelowMin',
    defaultMessage:
      'Progress cannot be less than the last reported value ({minProgress}%).',
    description: 'Subtask progress validation: below the previous progress',
  },
})
