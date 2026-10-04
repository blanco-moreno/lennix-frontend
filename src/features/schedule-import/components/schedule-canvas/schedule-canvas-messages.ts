import { defineMessages } from 'react-intl'

export const scheduleCanvasMessages = defineMessages({
  emptyTitle: {
    id: 'scheduleCanvas.emptyTitle',
    defaultMessage: 'This draft has no activities',
    description: 'Empty state when a draft carries no imported tasks',
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
  mirrorNote: {
    id: 'scheduleCanvas.mirrorNote',
    defaultMessage:
      'No subactivities. Activating creates one with the same name.',
    description:
      'A childless main activity: ms-bk creates the mirror subactivity itself',
  },
  selectHint: {
    id: 'scheduleCanvas.selectHint',
    defaultMessage:
      'Select an activity to edit it, add subactivities or see what it waits on.',
    description: 'Shown above the chart while no row is selected',
  },
  phaseProgressNote: {
    id: 'scheduleCanvas.phaseProgressNote',
    defaultMessage:
      'Its progress is the file’s until activation, when it is recalculated from its subactivities.',
    description:
      'A draft main activity keeps the imported figure; go-live derives it (TSK-4, IMP-10)',
  },
  answerQuestion: {
    id: 'scheduleCanvas.answerQuestion',
    defaultMessage: 'Resolve open question',
    description:
      'Opens the drawer on the selected row’s unresolved predecessor reference',
  },
  addPhase: {
    id: 'scheduleCanvas.addPhase',
    defaultMessage: 'Add main activity',
    description: 'Toolbar action creating a main activity in the draft',
  },
  actionEdit: {
    id: 'scheduleCanvas.actionEdit',
    defaultMessage: 'Edit',
    description: 'Row action opening the row drawer',
  },
  actionAddSubtask: {
    id: 'scheduleCanvas.actionAddSubtask',
    defaultMessage: 'Add subactivity',
    description: 'Main-activity row action creating a subactivity under it',
  },
  actionDelete: {
    id: 'scheduleCanvas.actionDelete',
    defaultMessage: 'Delete',
    description: 'Row action deleting the row, after confirmation',
  },
  deleteTitle: {
    id: 'scheduleCanvas.deleteTitle',
    defaultMessage: 'Delete “{title}”?',
    description: 'Delete confirmation title',
  },
  deleteBody: {
    id: 'scheduleCanvas.deleteBody',
    defaultMessage:
      '{count, plural, =0 {It goes to the trash.} one {It goes to the trash with its subactivity.} other {It goes to the trash with its # subactivities.}} Dependencies waiting on it are left broken.',
    description: 'What deleting a row does',
  },
  deleteOnlyChild: {
    id: 'scheduleCanvas.deleteOnlyChild',
    defaultMessage:
      'It is the only subactivity of its main activity. Delete the main activity instead.',
    description:
      'Why the last subactivity of a main activity cannot be deleted',
  },
  deleted: {
    id: 'scheduleCanvas.deleted',
    defaultMessage: 'Activity deleted',
    description: 'Toast after a row is deleted',
  },
  deleteFailed: {
    id: 'scheduleCanvas.deleteFailed',
    defaultMessage: 'The activity could not be deleted. Try again.',
    description: 'Toast when the delete fails',
  },
})
