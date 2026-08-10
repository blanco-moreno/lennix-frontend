import { defineMessages } from 'react-intl'

/**
 * Project-detail catalog. Covers the project page shell plus the wording
 * shared by more than one of its tabs/panels; ids a single tab/modal
 * renders live in that owner's colocated `*-messages.ts`. Expense
 * categories come from `expenseManagementMessages`, priority labels from
 * `priorityMessages`, and status labels from `useStatusLabel` — those
 * are deliberately not duplicated here.
 */
export const projectDetailViewMessages = defineMessages({
  // Shell + tabs
  loadError: {
    id: 'projectDetail.loadError',
    defaultMessage: 'Could not load the project',
    description: 'Error fallback when the project detail query fails',
  },
  tabSchedule: {
    id: 'projectDetail.tabSchedule',
    defaultMessage: 'Schedule',
    description:
      'Project detail tab: the schedule spine that absorbed activities, dependencies and critical path',
  },
  tabBudget: {
    id: 'projectDetail.tabBudget',
    defaultMessage: 'Budget',
    description: 'Project detail tab: budget',
  },
  tabTeam: {
    id: 'projectDetail.tabTeam',
    defaultMessage: 'Team',
    description: 'Project detail tab: team',
  },
  tabRisks: {
    id: 'projectDetail.tabRisks',
    defaultMessage: 'Risks and delays',
    description: 'Project detail tab: risks and delays',
  },
  tabHistory: {
    id: 'projectDetail.tabHistory',
    defaultMessage: 'History',
    description:
      'Project detail tab: the project history timeline (never "Activity" — in AEC an activity is a task)',
  },
  cancel: {
    id: 'projectDetail.cancel',
    defaultMessage: 'Cancel',
    description: 'Cancel button in confirmation dialogs across project detail',
  },
})
