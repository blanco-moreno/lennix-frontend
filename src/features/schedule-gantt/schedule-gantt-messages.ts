import { defineMessages } from 'react-intl'

export const scheduleGanttMessages = defineMessages({
  emptyTitle: {
    id: 'scheduleGantt.emptyTitle',
    defaultMessage: 'No dated work yet',
    description: 'Gantt empty state when no row in the project carries a date',
  },
  emptyDescription: {
    id: 'scheduleGantt.emptyDescription',
    defaultMessage:
      'Give a main activity or subactivity a start and a finish and the timeline draws itself.',
    description: 'Gantt empty-state guidance',
  },
  undated: {
    id: 'scheduleGantt.undated',
    defaultMessage: 'No dates',
    description: 'Marker on a row that has no dates to place on the timeline',
  },
  criticalBadge: {
    id: 'scheduleGantt.criticalBadge',
    defaultMessage: 'Critical',
    description: 'Badge on a row that sits on the critical path',
  },
  blockedBadge: {
    id: 'scheduleGantt.blockedBadge',
    defaultMessage: 'Blocked',
    description: 'Badge on a row whose dependencies are unmet',
  },
  delayBadge: {
    id: 'scheduleGantt.delayBadge',
    defaultMessage: '{count, plural, one {+# day} other {+# days}}',
    description: 'Badge showing the propagated delay of a row',
  },
  levelTask: {
    id: 'scheduleGantt.levelTask',
    defaultMessage: 'Main activity',
    description:
      'The upper level of the schedule. Names it in the legend and in a row’s accessible name — one pair of words for both, so the chart cannot call a row one thing and say another',
  },
  levelSubtask: {
    id: 'scheduleGantt.levelSubtask',
    defaultMessage: 'Subactivity',
    description: 'The lower level of the schedule. See scheduleGantt.levelTask',
  },
  rowAria: {
    id: 'scheduleGantt.rowAria',
    defaultMessage: '{level} · {title}. {dates}. {state}',
    description:
      'Accessible name of a schedule row button. Opens with the level, because which of the two levels a row is decides what it can be linked to and where it opens',
  },
  rowDates: {
    id: 'scheduleGantt.rowDates',
    defaultMessage: '{start} to {end}',
    description: 'Spoken date range of a schedule row',
  },
  stateOnTime: {
    id: 'scheduleGantt.stateOnTime',
    defaultMessage: 'On time',
    description: 'Spoken state of a row with no delay',
  },
  collapseTask: {
    id: 'scheduleGantt.collapseTask',
    defaultMessage: 'Collapse “{title}”',
    description: 'Hides a phase’s subactivities; the phase bar stays',
  },
  expandTask: {
    id: 'scheduleGantt.expandTask',
    defaultMessage: 'Expand “{title}”',
    description: 'Shows a collapsed phase’s subactivities again',
  },
  rowProgress: {
    id: 'scheduleGantt.rowProgress',
    defaultMessage: '{progress}% done',
    description:
      'Spoken work done on a row — the same fraction the bar draws as its centre line',
  },
  today: {
    id: 'scheduleGantt.today',
    defaultMessage: 'Today',
    description: 'Marker on the Gantt time axis for the current date',
  },
  rowAriaDraft: {
    id: 'scheduleGantt.rowAriaDraft',
    defaultMessage: '{level} · {title}. {dates}',
    description:
      'Accessible name of a draft row — no state clause, because the engine has not run and the chart claims nothing it did not compute',
  },
  rowRef: {
    id: 'scheduleGantt.rowRef',
    defaultMessage: 'Source row {ref}',
    description:
      'Provenance of an imported row — the reference it had in the uploaded file',
  },
  rowAssignee: {
    id: 'scheduleGantt.rowAssignee',
    defaultMessage: 'Assigned to {name}',
    description: 'Spoken assignee of a schedule row',
  },
  rowLocation: {
    id: 'scheduleGantt.rowLocation',
    defaultMessage: 'At {location}',
    description: 'Spoken work location of a subactivity',
  },
  atRiskBadge: {
    id: 'scheduleGantt.atRiskBadge',
    defaultMessage: 'At risk',
    description:
      'Mark on a row that was force-started — permanent provenance, from the API',
  },
  overBudgetBadge: {
    id: 'scheduleGantt.overBudgetBadge',
    defaultMessage: 'Over budget',
    description: 'Mark on a phase whose spend exceeds its budget',
  },
  progressLabel: {
    id: 'scheduleGantt.progressLabel',
    defaultMessage: '{progress}%',
    description: 'Percent figure drawn at the end of a bar with progress',
  },
  zoomWeek: {
    id: 'scheduleGantt.zoomWeek',
    defaultMessage: 'Week',
    description: 'Zoom step: the default reading scale',
  },
  zoomMonth: {
    id: 'scheduleGantt.zoomMonth',
    defaultMessage: 'Month',
    description: 'Zoom step: a multi-year build fits on one screen',
  },
  legendDependencies: {
    id: 'scheduleGantt.legendDependencies',
    defaultMessage: 'Links:',
    description:
      'Label introducing the dependency-type legend under the chart (FS/SS/FF/SF)',
  },
  legendDelay: {
    id: 'scheduleGantt.legendDelay',
    defaultMessage: 'Propagated delay',
    description: 'Legend entry for the delay extension of a bar',
  },
  legendCritical: {
    id: 'scheduleGantt.legendCritical',
    defaultMessage: 'Critical path',
    description: 'Legend entry for critical-path bars',
  },
  legendBroken: {
    id: 'scheduleGantt.legendBroken',
    defaultMessage: 'Broken link',
    description: 'Legend entry for a dependency whose predecessor is gone',
  },
})
