import { defineMessages } from 'react-intl'

export const scheduleCanvasMessages = defineMessages({
  emptyTitle: {
    id: 'scheduleCanvas.emptyTitle',
    defaultMessage: 'This draft has no rows yet',
    description: 'Empty state when a draft carries no imported tasks',
  },
  emptyDescription: {
    id: 'scheduleCanvas.emptyDescription',
    defaultMessage:
      'Nothing from the file landed on the timeline. Import another file to start over.',
    description: 'Empty-state body for a draft with no tasks',
  },
  undated: {
    id: 'scheduleCanvas.undated',
    defaultMessage: 'No dates',
    description: 'Shown on a row the file gave no start or finish date',
  },
  dateRange: {
    id: 'scheduleCanvas.dateRange',
    defaultMessage: '{start} → {end}',
    description: 'Start and finish of one schedule row',
  },
  durationDays: {
    id: 'scheduleCanvas.durationDays',
    defaultMessage: '{count, plural, one {# day} other {# days}}',
    description: 'Calendar span of one schedule row',
  },
  editedBadge: {
    id: 'scheduleCanvas.editedBadge',
    defaultMessage: 'Edited',
    description: 'Badge on a row the user changed after the import',
  },
  sourceRow: {
    id: 'scheduleCanvas.sourceRow',
    defaultMessage: 'Row {row}',
    description: 'Where this row came from in the source file',
  },
  columnTask: {
    id: 'scheduleCanvas.columnTask',
    defaultMessage: 'Activity',
    description: 'Column header of the draft schedule listing',
  },
  columnDates: {
    id: 'scheduleCanvas.columnDates',
    defaultMessage: 'Dates',
    description: 'Column header holding each row’s start and finish',
  },
  columnDuration: {
    id: 'scheduleCanvas.columnDuration',
    defaultMessage: 'Duration',
    description: 'Column header holding each row’s calendar span',
  },
  expand: {
    id: 'scheduleCanvas.expand',
    defaultMessage:
      'Show {count, plural, one {# subactivity} other {# subactivities}}',
    description: 'Accessible name of the control opening a phase’s rows',
  },
  collapse: {
    id: 'scheduleCanvas.collapse',
    defaultMessage:
      'Hide {count, plural, one {# subactivity} other {# subactivities}}',
    description: 'Accessible name of the control closing a phase’s rows',
  },
  editRow: {
    id: 'scheduleCanvas.editRow',
    defaultMessage: 'Edit {title}',
    description: 'Accessible name of a row’s edit control in the listing',
  },
  phaseCount: {
    id: 'scheduleCanvas.phaseCount',
    defaultMessage:
      '{phases, plural, one {# main activity} other {# main activities}} · {activities, plural, one {# subactivity} other {# subactivities}}',
    description: 'What the draft schedule listing holds, above its header',
  },
  title: {
    id: 'scheduleCanvas.title',
    defaultMessage: 'The schedule Lennix read',
    description: 'Heading above the draft schedule listing',
  },
  mirrorNote: {
    id: 'scheduleCanvas.mirrorNote',
    defaultMessage: 'Lennix adds one subactivity here when you activate.',
    description:
      'A childless main activity: ms-bk creates the mirror subactivity itself',
  },
})
