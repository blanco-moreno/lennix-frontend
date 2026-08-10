import { defineMessages } from 'react-intl'

export const narrationReceiptMessages = defineMessages({
  readFrom: {
    id: 'narrationReceipt.readFrom',
    defaultMessage: 'Read from {fileName}',
    description:
      'Header of the import receipt, naming the file Lennix parsed verbatim',
  },
  sheetUsed: {
    id: 'narrationReceipt.sheetUsed',
    defaultMessage: 'sheet “{sheet}”',
    description: 'Which worksheet of the workbook the schedule was read from',
  },
  tasks: {
    id: 'narrationReceipt.tasks',
    defaultMessage: '{count, plural, one {# activity} other {# activities}}',
    description: 'Count of leaf work items the import landed',
  },
  phases: {
    id: 'narrationReceipt.phases',
    defaultMessage:
      '{count, plural, one {# main activity} other {# main activities}}',
    description: 'Count of sections that group activities in the imported file',
  },
  noPhases: {
    id: 'narrationReceipt.noPhases',
    defaultMessage: 'no main activities — a flat list',
    description:
      'Shown instead of a main-activity count when the file had no section structure',
  },
  dateRange: {
    id: 'narrationReceipt.dateRange',
    defaultMessage: '{start} – {end}',
    description: 'The schedule span read from the file',
  },
  noDates: {
    id: 'narrationReceipt.noDates',
    defaultMessage: 'no dates read',
    description: 'Shown when the file carried no readable dates',
  },
  caveats: {
    id: 'narrationReceipt.caveats',
    defaultMessage:
      '{count, plural, one {# thing to check} other {# things to check}}',
    description:
      'Count of assumptions and unresolved items the user may want to review',
  },
  nothingToCheck: {
    id: 'narrationReceipt.nothingToCheck',
    defaultMessage: 'nothing to check',
    description: 'Shown when the file parsed with no caveats at all',
  },
  phaseNamesLabel: {
    id: 'narrationReceipt.phaseNamesLabel',
    defaultMessage: 'Main activities, as your file names them:',
    description:
      'Label before the verbatim list of section names quoted from the file',
  },
  editedRows: {
    id: 'narrationReceipt.editedRows',
    defaultMessage:
      '{count, plural, one {# row you already adjusted} other {# rows you already adjusted}}',
    description:
      'Shown on a resumed draft so the receipt matches what the user changed',
  },
  collapsedRows: {
    id: 'narrationReceipt.collapsedRows',
    defaultMessage:
      'Your file nested {depth} levels deep; projects keep 2, so {count, plural, one {# activity was} other {# activities were}} flattened. The full path shows before each one.',
    description:
      'Notice shown when the source hierarchy was deeper than the 2-level model',
  },
})
