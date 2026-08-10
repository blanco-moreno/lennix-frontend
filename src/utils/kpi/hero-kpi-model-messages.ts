import { defineMessages } from 'react-intl'

export const heroKpiMessages = defineMessages({
  delayedProjects: {
    id: 'heroKpis.delayedProjects',
    defaultMessage: 'Delayed projects',
    description: 'Hero KPI counting live projects whose status is delayed',
  },
  criticalPathSlip: {
    id: 'heroKpis.criticalPathSlip',
    defaultMessage: 'Critical-path slip',
    description:
      'Hero KPI showing the worst delay sitting on a critical-path activity',
  },
  atRiskTasks: {
    id: 'heroKpis.atRiskTasks',
    defaultMessage: 'Activities at risk',
    description: 'Hero KPI counting activities that are delayed or blocked',
  },
  projectProgress: {
    id: 'heroKpis.projectProgress',
    defaultMessage: 'Overall progress',
    description: 'Hero KPI: the project-wide progress percentage',
  },
  budgetUsed: {
    id: 'heroKpis.budgetUsed',
    defaultMessage: 'Budget used',
    description: 'Hero KPI: spent as a percentage of the project budget',
  },
  activationWait: {
    id: 'heroKpis.activationWait',
    defaultMessage: 'Waiting to activate',
    description:
      'Hero KPI showing how long the oldest pending draft has been waiting',
  },
  valueDays: {
    id: 'heroKpis.valueDays',
    defaultMessage: '{days, plural, one {# day} other {# days}}',
    description: 'How a hero KPI renders a value measured in days',
  },
  valueNone: {
    id: 'heroKpis.valueNone',
    defaultMessage: 'Nothing pending',
    description:
      'Value of a hero KPI that has no datum to report (e.g. no drafts waiting)',
  },
  error: {
    id: 'heroKpis.error',
    defaultMessage: 'Could not load the indicators',
    description: 'Shown when the query behind the hero KPI grid fails',
  },
})
