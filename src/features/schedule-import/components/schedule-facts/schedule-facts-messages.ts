import { defineMessages } from 'react-intl'

export const scheduleFactsMessages = defineMessages({
  phases: {
    id: 'scheduleFacts.phases',
    defaultMessage:
      '{count, plural, one {# main activity} other {# main activities}}',
    description: 'How many main activities the draft carries',
  },
  subtasks: {
    id: 'scheduleFacts.subtasks',
    defaultMessage:
      '{count, plural, one {# subactivity} other {# subactivities}}',
    description: 'How many subactivities the draft carries',
  },
  span: {
    id: 'scheduleFacts.span',
    defaultMessage: '{start} – {end}',
    description: 'The first and last date any row of the draft carries',
  },
  noDates: {
    id: 'scheduleFacts.noDates',
    defaultMessage: 'No dates',
    description: 'Shown instead of the span when no row carries a date',
  },
  dependencies: {
    id: 'scheduleFacts.dependencies',
    defaultMessage:
      '{count, plural, one {# dependency} other {# dependencies}}',
    description: 'How many dependencies the draft carries',
  },
})
