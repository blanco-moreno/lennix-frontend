import { defineMessages } from 'react-intl'

/** Catalog for the project summary strip — wording only it renders. */
export const projectSummaryStripMessages = defineMessages({
  noDueDate: {
    id: 'projectDetail.noDueDate',
    defaultMessage: 'No date',
    description: 'Fallback when the project has no due date',
  },
  startDateLabel: {
    id: 'projectDetail.startDateLabel',
    defaultMessage: 'Start date',
    description: 'Label for the project start date',
  },
  noStartDate: {
    id: 'projectDetail.noStartDate',
    defaultMessage: 'No date',
    description: 'Fallback when the project has no start date',
  },
  estimatedDateLabel: {
    id: 'projectDetail.estimatedDateLabel',
    defaultMessage: 'Estimated date',
    description: 'Label for the project estimated end date',
  },
  overallProgressHeading: {
    id: 'projectDetail.overallProgressHeading',
    defaultMessage: 'Overall progress',
    description: 'Heading of the overall progress card in the overview',
  },
})
