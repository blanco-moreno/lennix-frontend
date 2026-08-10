import { defineMessages } from 'react-intl'

export const confirmSummaryMessages = defineMessages({
  title: {
    id: 'confirmSummary.title',
    defaultMessage: 'What goes live',
    description: 'Heading of the confirm step’s summary of the whole draft',
  },
  explainer: {
    id: 'confirmSummary.explainer',
    defaultMessage:
      'Activating puts this schedule live: from here Lennix computes over its dependencies, tracks delay and fixes the baseline. Everything stays editable afterwards.',
    description: 'What go-live means — a network confirmation, not just a save',
  },
  budgetSection: {
    id: 'confirmSummary.budgetSection',
    defaultMessage: 'Budget',
    description: 'Section heading of the money on confirm',
  },
  mainTasks: {
    id: 'confirmSummary.mainTasks',
    defaultMessage: 'Main activities',
    description: 'Label of the main-activity count on the confirm summary',
  },
  subtasks: {
    id: 'confirmSummary.subtasks',
    defaultMessage: 'Subactivities',
    description: 'Label of the subactivity count on the confirm summary',
  },
  startDate: {
    id: 'confirmSummary.startDate',
    defaultMessage: 'Starts',
    description: 'Label of the schedule’s first day on the confirm summary',
  },
  endDate: {
    id: 'confirmSummary.endDate',
    defaultMessage: 'Ends',
    description: 'Label of the schedule’s last day on the confirm summary',
  },
  noDates: {
    id: 'confirmSummary.noDates',
    defaultMessage: 'No dates',
    description: 'Shown when the file carried no usable dates at all',
  },
  projectBudget: {
    id: 'confirmSummary.projectBudget',
    defaultMessage: 'Project budget',
    description: 'Label of the whole-project budget on the confirm summary',
  },
  allocated: {
    id: 'confirmSummary.allocated',
    defaultMessage: 'Allocated',
    description: 'Label of what the per-activity split adds up to',
  },
  unallocated: {
    id: 'confirmSummary.unallocated',
    defaultMessage: 'Unallocated',
    description: 'Label of what the project budget still has left',
  },
  overrun: {
    id: 'confirmSummary.overrun',
    defaultMessage: 'Over budget',
    description: 'Label replacing “unallocated” when the split exceeds it',
  },
  noBudget: {
    id: 'confirmSummary.noBudget',
    defaultMessage: 'Not set',
    description: 'Shown when the draft carries no project budget',
  },
  activateFailed: {
    id: 'confirmSummary.activateFailed',
    defaultMessage: 'The schedule could not be activated. Nothing was lost.',
    description: 'Generic go-live failure, shown when it is not a plan limit',
  },
})
