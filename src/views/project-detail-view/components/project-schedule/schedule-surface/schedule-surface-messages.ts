import { defineMessages } from 'react-intl'

export const scheduleSurfaceMessages = defineMessages({
  heading: {
    id: 'scheduleSurface.heading',
    defaultMessage: 'Schedule',
    description: 'Title of the unified schedule surface',
  },
  filterAll: {
    id: 'scheduleSurface.filterAll',
    defaultMessage: 'Everything',
    description: 'Filter that shows the whole schedule',
  },
  filterCritical: {
    id: 'scheduleSurface.filterCritical',
    defaultMessage: 'Critical only',
    description: 'Filter that shows only critical-path rows',
  },
  filterDelayed: {
    id: 'scheduleSurface.filterDelayed',
    defaultMessage: 'Delayed',
    description: 'Filter that shows only rows carrying propagated delay',
  },
  filterAtRisk: {
    id: 'scheduleSurface.filterAtRisk',
    defaultMessage: 'At risk',
    description: 'Filter that shows only blocked rows',
  },
  openDependencies: {
    id: 'scheduleSurface.openDependencies',
    defaultMessage: 'Dependencies',
    description:
      'Opens the selected row’s dependency drawer without leaving the schedule',
  },
  openDependenciesCount: {
    id: 'scheduleSurface.openDependenciesCount',
    defaultMessage: 'Dependencies ({count})',
    description:
      'The selected row’s dependency button — it carries the link count so the panel says it once',
  },
  dependenciesDrawerTitle: {
    id: 'scheduleSurface.dependenciesDrawerTitle',
    defaultMessage: 'Dependencies',
    description: 'Title of the dependency drawer over the schedule',
  },
  hiddenEdges: {
    id: 'scheduleSurface.hiddenEdges',
    defaultMessage:
      '{count, plural, one {# link is not drawn in this view} other {# links are not drawn in this view}}',
    description:
      'Filtering or collapsing hid rows and with them their dependency arrows — this says so instead of letting them vanish silently',
  },
  kpiBroken: {
    id: 'scheduleSurface.kpiBroken',
    defaultMessage:
      '{count, plural, one {# broken link} other {# broken links}}',
    description: 'Headline count of broken dependencies',
  },
  badgeBlocked: {
    id: 'scheduleSurface.badgeBlocked',
    defaultMessage: 'Blocked',
    description:
      'Flag on the selected row — the same word the listings use for a blocked activity',
  },
  badgeCritical: {
    id: 'scheduleSurface.badgeCritical',
    defaultMessage: 'Critical path',
    description:
      'Flag on the selected row — the same words the listings use for a critical-path activity',
  },
  listDelay: {
    id: 'scheduleSurface.listDelay',
    defaultMessage: '{count, plural, one {+# day} other {+# days}}',
    description: 'Delay of a row in the list modes',
  },
  listPhase: {
    id: 'scheduleSurface.listPhase',
    defaultMessage: 'Main activity',
    description:
      'Level marker of a top-level row — in the list modes and in the selected-row panel',
  },
  listTask: {
    id: 'scheduleSurface.listTask',
    defaultMessage: 'Subactivity',
    description:
      'Level marker of an activity row — in the list modes and in the selected-row panel',
  },
  openRowTask: {
    id: 'scheduleSurface.openRowTask',
    defaultMessage: 'View Activity',
    description:
      'Action that opens the selected main activity in its detail page — it names the thing it opens, not the act of opening',
  },
  openRowSubtask: {
    id: 'scheduleSurface.openRowSubtask',
    defaultMessage: 'View Subactivity',
    description:
      'Action that opens the selected subactivity in its detail page — it names the thing it opens, not the act of opening',
  },
  brokenHeading: {
    id: 'scheduleSurface.brokenHeading',
    defaultMessage:
      '{count, plural, one {Broken link} other {Broken links}} ({count})',
    description:
      'Title of the broken-link list under the chart — the only dependencies the schedule still lists itself',
  },
  selectedNone: {
    id: 'scheduleSurface.selectedNone',
    defaultMessage: 'Pick a row to act on it, or open it to read its links.',
    description: 'Hint shown when no schedule row is selected',
  },
  clearSelection: {
    id: 'scheduleSurface.clearSelection',
    defaultMessage: 'Clear selection',
    description:
      'Action that drops the row selection. Named after what it does, not after what happens next',
  },
  badgeOverBudget: {
    id: 'scheduleSurface.badgeOverBudget',
    defaultMessage: 'Over budget',
    description:
      'Flag on the selected phase — its spend exceeds its budget, the same words the chart uses',
  },
  factProgress: {
    id: 'scheduleSurface.factProgress',
    defaultMessage: 'Progress',
    description: 'Label of the avance fact in the selected-row panel',
  },
  factStart: {
    id: 'scheduleSurface.factStart',
    defaultMessage: 'Start',
    description: 'Label of the start-date fact in the selected-row panel',
  },
  factDue: {
    id: 'scheduleSurface.factDue',
    defaultMessage: 'Due',
    description: 'Label of the due-date fact in the selected-row panel',
  },
  factAssignee: {
    id: 'scheduleSurface.factAssignee',
    defaultMessage: 'Owner',
    description: 'Label of the responsable fact in the selected-row panel',
  },
  factLocation: {
    id: 'scheduleSurface.factLocation',
    defaultMessage: 'Location',
    description:
      'Label of the work-location fact in the selected-row panel — subactivities only',
  },
  factDependencies: {
    id: 'scheduleSurface.factDependencies',
    defaultMessage: 'Dependencies',
    description:
      'Label of the link-count fact in the selected-row panel — the list itself is read in the row’s drawer',
  },
  factRef: {
    id: 'scheduleSurface.factRef',
    defaultMessage: 'Source row',
    description:
      'Label of the imported source-file row reference in the selected-row panel',
  },
})
