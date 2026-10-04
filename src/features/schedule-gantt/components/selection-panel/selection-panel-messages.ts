import { defineMessages } from 'react-intl'

export const selectionPanelMessages = defineMessages({
  levelTask: {
    id: 'selectionPanel.levelTask',
    defaultMessage: 'Main activity',
    description: 'Level marker of a top-level row in the selected-row panel',
  },
  levelSubtask: {
    id: 'selectionPanel.levelSubtask',
    defaultMessage: 'Subactivity',
    description: 'Level marker of an activity row in the selected-row panel',
  },
  badgeBlocked: {
    id: 'selectionPanel.badgeBlocked',
    defaultMessage: 'Blocked',
    description:
      'Flag on the selected row — the same word the listings use for a blocked activity',
  },
  badgeCritical: {
    id: 'selectionPanel.badgeCritical',
    defaultMessage: 'Critical path',
    description:
      'Flag on the selected row — the same words the listings use for a critical-path activity',
  },
  badgeOverBudget: {
    id: 'selectionPanel.badgeOverBudget',
    defaultMessage: 'Over budget',
    description:
      'Flag on the selected phase — its spend exceeds its budget, the same words the chart uses',
  },
  openDependenciesCount: {
    id: 'selectionPanel.openDependenciesCount',
    defaultMessage: 'Dependencies ({count})',
    description:
      'The selected row’s dependency button — it carries the link count so the panel says it once',
  },
  openRowTask: {
    id: 'selectionPanel.openRowTask',
    defaultMessage: 'View Activity',
    description:
      'Action that opens the selected main activity in its detail page — it names the thing it opens, not the act of opening',
  },
  openRowSubtask: {
    id: 'selectionPanel.openRowSubtask',
    defaultMessage: 'View Subactivity',
    description:
      'Action that opens the selected subactivity in its detail page — it names the thing it opens, not the act of opening',
  },
  clearSelection: {
    id: 'selectionPanel.clearSelection',
    defaultMessage: 'Clear selection',
    description:
      'Action that drops the row selection. Named after what it does, not after what happens next',
  },
  factProgress: {
    id: 'selectionPanel.factProgress',
    defaultMessage: 'Progress',
    description: 'Label of the avance fact in the selected-row panel',
  },
  factStart: {
    id: 'selectionPanel.factStart',
    defaultMessage: 'Start',
    description: 'Label of the start-date fact in the selected-row panel',
  },
  factDue: {
    id: 'selectionPanel.factDue',
    defaultMessage: 'Due',
    description: 'Label of the due-date fact in the selected-row panel',
  },
  factAssignee: {
    id: 'selectionPanel.factAssignee',
    defaultMessage: 'Owner',
    description: 'Label of the responsable fact in the selected-row panel',
  },
  factLocation: {
    id: 'selectionPanel.factLocation',
    defaultMessage: 'Location',
    description:
      'Label of the work-location fact in the selected-row panel — subactivities only',
  },
  factDependencies: {
    id: 'selectionPanel.factDependencies',
    defaultMessage: 'Dependencies',
    description:
      'Label of the link-count fact in the selected-row panel — the list itself is read in the row’s drawer',
  },
  factRef: {
    id: 'selectionPanel.factRef',
    defaultMessage: 'Source ID',
    description:
      'Label of the activity’s own ID in the imported file, in the selected-row panel — not its row number',
  },
})
