import { defineMessages } from 'react-intl'

export const rowDrawerMessages = defineMessages({
  editTaskTitle: {
    id: 'rowDrawer.editTaskTitle',
    defaultMessage: 'Main activity',
    description: 'Drawer title when editing a main activity',
  },
  editSubtaskTitle: {
    id: 'rowDrawer.editSubtaskTitle',
    defaultMessage: 'Subactivity',
    description: 'Drawer title when editing a subactivity',
  },
  createTaskTitle: {
    id: 'rowDrawer.createTaskTitle',
    defaultMessage: 'New main activity',
    description: 'Drawer title when adding a main activity to the draft',
  },
  createSubtaskTitle: {
    id: 'rowDrawer.createSubtaskTitle',
    defaultMessage: 'New subactivity',
    description: 'Drawer title when adding a subactivity under a main activity',
  },
  under: {
    id: 'rowDrawer.under',
    defaultMessage: 'Under “{phase}”',
    description:
      'Drawer subtitle naming the main activity a subactivity sits under',
  },
  titleLabel: {
    id: 'rowDrawer.titleLabel',
    defaultMessage: 'Name',
    description: 'Label of the row name field',
  },
  startLabel: {
    id: 'rowDrawer.startLabel',
    defaultMessage: 'Start',
    description: 'Label of the subactivity start date field',
  },
  dueLabel: {
    id: 'rowDrawer.dueLabel',
    defaultMessage: 'End',
    description: 'Label of the subactivity end date field',
  },
  datesLabel: {
    id: 'rowDrawer.datesLabel',
    defaultMessage: 'Dates',
    description: 'Label of a main activity’s read-only dates',
  },
  span: {
    id: 'rowDrawer.span',
    defaultMessage: '{start} → {end}',
    description: 'A main activity’s date span',
  },
  noDates: {
    id: 'rowDrawer.noDates',
    defaultMessage: 'No dates',
    description: 'A main activity carrying no dates',
  },
  derivedDates: {
    id: 'rowDrawer.derivedDates',
    defaultMessage: 'They come from its subactivities.',
    description: 'Why a main activity’s dates cannot be edited here',
  },
  save: {
    id: 'rowDrawer.save',
    defaultMessage: 'Save',
    description: 'Saves the row’s fields',
  },
  create: {
    id: 'rowDrawer.create',
    defaultMessage: 'Create',
    description: 'Creates the new row',
  },
  saved: {
    id: 'rowDrawer.saved',
    defaultMessage: 'Activity updated',
    description: 'Toast after a row edit lands',
  },
  saveFailed: {
    id: 'rowDrawer.saveFailed',
    defaultMessage: 'The change could not be saved. Try again.',
    description: 'Toast when a row edit fails',
  },
  created: {
    id: 'rowDrawer.created',
    defaultMessage: 'Activity created',
    description: 'Toast after a row is created',
  },
  createFailed: {
    id: 'rowDrawer.createFailed',
    defaultMessage: 'The activity could not be created. Try again.',
    description: 'Toast when creating a row fails',
  },
  predecessors: {
    id: 'rowDrawer.predecessors',
    defaultMessage: 'Predecessors ({count})',
    description: 'Heading of the row’s predecessor list',
  },
  noPredecessors: {
    id: 'rowDrawer.noPredecessors',
    defaultMessage: 'No predecessors.',
    description: 'Empty predecessor list',
  },
  sourceFile: {
    id: 'rowDrawer.sourceFile',
    defaultMessage: 'From the file',
    description: 'Badge on an edge parsed from the file',
  },
  sourceManual: {
    id: 'rowDrawer.sourceManual',
    defaultMessage: 'Added by hand',
    description: 'Badge on an edge the user drew',
  },
})
