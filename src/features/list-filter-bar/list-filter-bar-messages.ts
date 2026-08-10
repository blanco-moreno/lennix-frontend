import { defineMessages } from 'react-intl'

/**
 * The vocabulary of every filtered listing. One catalog, because the bar is one
 * component: `/projects` and `/tasks` must not be able to call the same control
 * two different things.
 */
export const listFilterBarMessages = defineMessages({
  // ── Field labels ────────────────────────────────────────────────
  fieldSearch: {
    id: 'listFilterBar.fieldSearch',
    defaultMessage: 'Search',
    description: 'Label of the free-text search box on a filtered list',
  },
  fieldStatus: {
    id: 'listFilterBar.fieldStatus',
    defaultMessage: 'Status',
    description: 'Label of the status filter on a filtered list',
  },
  fieldProject: {
    id: 'listFilterBar.fieldProject',
    defaultMessage: 'Project',
    description: 'Label of the project filter on the activity list',
  },
  fieldPriority: {
    id: 'listFilterBar.fieldPriority',
    defaultMessage: 'Priority',
    description: 'Label of the priority filter on a filtered list',
  },
  fieldManager: {
    id: 'listFilterBar.fieldManager',
    defaultMessage: 'Project manager',
    description:
      'Label of the person filter on the project list — the obra’s manager',
  },
  fieldAssignee: {
    id: 'listFilterBar.fieldAssignee',
    defaultMessage: 'Assignee',
    description:
      'Label of the person filter on the activity list — who the activity belongs to',
  },
  fieldRisk: {
    id: 'listFilterBar.fieldRisk',
    defaultMessage: 'Risk',
    description:
      'Label of the at-risk filter (delayed or blocked) on the activity list',
  },
  fieldBlocked: {
    id: 'listFilterBar.fieldBlocked',
    defaultMessage: 'Blocked',
    description: 'Label of the blocked filter on the activity list',
  },
  fieldOverBudget: {
    id: 'listFilterBar.fieldOverBudget',
    defaultMessage: 'Over budget',
    description: 'Label of the over-budget filter on a filtered list',
  },
  fieldCritical: {
    id: 'listFilterBar.fieldCritical',
    defaultMessage: 'On the critical path',
    description: 'Label of the critical-path filter on the activity list',
  },
  fieldDueAfter: {
    id: 'listFilterBar.fieldDueAfter',
    defaultMessage: 'Due from',
    description: 'Label of the lower bound of the due-date range filter',
  },
  fieldDueBefore: {
    id: 'listFilterBar.fieldDueBefore',
    defaultMessage: 'Due until',
    description: 'Label of the upper bound of the due-date range filter',
  },
  fieldSort: {
    id: 'listFilterBar.fieldSort',
    defaultMessage: 'Sort by',
    description: 'Label of the sort control on a filtered list',
  },

  // ── Shared option values ────────────────────────────────────────
  optionAll: {
    id: 'listFilterBar.optionAll',
    defaultMessage: 'All',
    description: 'Option of a filter select that stops narrowing by that field',
  },
  optionYes: {
    id: 'listFilterBar.optionYes',
    defaultMessage: 'Yes',
    description: 'Option of a yes/no filter that keeps only the rows that are',
  },
  optionNo: {
    id: 'listFilterBar.optionNo',
    defaultMessage: 'No',
    description:
      'Option of a yes/no filter that keeps only the rows that are not',
  },
  optionAtRisk: {
    id: 'listFilterBar.optionAtRisk',
    defaultMessage: 'Delayed or blocked',
    description:
      'The at-risk filter value — the exact population the at-risk KPI counts',
  },

  // ── Sort options ────────────────────────────────────────────────
  // Every listing sorts on the server: ordering the page in the browser
  // reorders 5 of 500 rows and calls it a ranking.
  sortDefault: {
    id: 'listFilterBar.sortDefault',
    defaultMessage: 'Default order',
    description: 'Sort option that leaves the order to the server’s default',
  },
  sortCreatedAtDesc: {
    id: 'listFilterBar.sortCreatedAtDesc',
    defaultMessage: 'Newest first',
    description: 'Sort option: most recently created first',
  },
  sortCreatedAtAsc: {
    id: 'listFilterBar.sortCreatedAtAsc',
    defaultMessage: 'Oldest first',
    description: 'Sort option: least recently created first',
  },
  sortNameAsc: {
    id: 'listFilterBar.sortNameAsc',
    defaultMessage: 'Name A–Z',
    description: 'Sort option: project name ascending',
  },
  sortNameDesc: {
    id: 'listFilterBar.sortNameDesc',
    defaultMessage: 'Name Z–A',
    description: 'Sort option: project name descending',
  },
  sortTitleAsc: {
    id: 'listFilterBar.sortTitleAsc',
    defaultMessage: 'Title A–Z',
    description: 'Sort option: activity title ascending',
  },
  sortTitleDesc: {
    id: 'listFilterBar.sortTitleDesc',
    defaultMessage: 'Title Z–A',
    description: 'Sort option: activity title descending',
  },
  sortDueDateAsc: {
    id: 'listFilterBar.sortDueDateAsc',
    defaultMessage: 'Due date, soonest first',
    description: 'Sort option: earliest due date first',
  },
  sortDueDateDesc: {
    id: 'listFilterBar.sortDueDateDesc',
    defaultMessage: 'Due date, latest first',
    description: 'Sort option: latest due date first',
  },
  sortPriorityDesc: {
    id: 'listFilterBar.sortPriorityDesc',
    defaultMessage: 'Priority, highest first',
    description:
      'Sort option: by real severity (high, medium, low), not alphabetically',
  },
  sortPriorityAsc: {
    id: 'listFilterBar.sortPriorityAsc',
    defaultMessage: 'Priority, lowest first',
    description: 'Sort option: by real severity, lowest first',
  },
  sortProgressDesc: {
    id: 'listFilterBar.sortProgressDesc',
    defaultMessage: 'Progress, highest first',
    description: 'Sort option: by the server-computed progress, descending',
  },
  sortProgressAsc: {
    id: 'listFilterBar.sortProgressAsc',
    defaultMessage: 'Progress, lowest first',
    description: 'Sort option: by the server-computed progress, ascending',
  },
  sortDelayDaysDesc: {
    id: 'listFilterBar.sortDelayDaysDesc',
    defaultMessage: 'Most delayed first',
    description: 'Sort option: by accumulated delay days, descending',
  },
  sortDelayDaysAsc: {
    id: 'listFilterBar.sortDelayDaysAsc',
    defaultMessage: 'Least delayed first',
    description: 'Sort option: by accumulated delay days, ascending',
  },

  // ── The bar itself ──────────────────────────────────────────────
  moreFilters: {
    id: 'listFilterBar.moreFilters',
    defaultMessage: 'More filters',
    description:
      'Button that reveals the secondary filters kept off the bar by default',
  },
  filtersCount: {
    id: 'listFilterBar.filtersCount',
    defaultMessage: 'Filters{count, plural, =0 {} other { ({count})}}',
    description:
      'Phone-width button that opens every filter control, with how many are active',
  },
  fewerFilters: {
    id: 'listFilterBar.fewerFilters',
    defaultMessage: 'Fewer filters',
    description: 'Button that hides the secondary filters again',
  },
  advancedFilters: {
    id: 'listFilterBar.advancedFilters',
    defaultMessage: 'Additional filters',
    description: 'Accessible name of the panel holding the secondary filters',
  },
  chipValue: {
    id: 'listFilterBar.chipValue',
    defaultMessage: '{field}: {value}',
    description:
      'An active-filter chip — the field it narrows and the value it narrows to',
  },
})
