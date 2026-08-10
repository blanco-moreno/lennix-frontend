import { defineMessages } from 'react-intl'

export const uploadSummaryMessages = defineMessages({
  title: {
    id: 'uploadSummary.title',
    defaultMessage: 'The file Lennix read',
    description: 'Heading of the upload step once the draft has landed',
  },
  filename: {
    id: 'uploadSummary.filename',
    defaultMessage: 'File',
    description: 'Label of the uploaded filename',
  },
  sheet: {
    id: 'uploadSummary.sheet',
    defaultMessage: 'Sheet',
    description: 'Label of the sheet the parser chose',
  },
  rows: {
    id: 'uploadSummary.rows',
    defaultMessage: 'Rows',
    description: 'Label of the row counts the parse produced',
  },
  rowCounts: {
    id: 'uploadSummary.rowCounts',
    defaultMessage:
      '{imported} imported of {scanned} scanned · {dropped} dropped',
    description: 'What the parse did with the rows in the file',
  },
  unknownFile: {
    id: 'uploadSummary.unknownFile',
    defaultMessage: 'No file recorded for this draft',
    description: 'Shown when the draft carries no import record',
  },
  explainer: {
    id: 'uploadSummary.explainer',
    defaultMessage:
      'This step is done. To work from a different file, import it as a new draft — this one stays where it is.',
    description:
      'Why the upload step is read-only here: re-uploading means a new draft',
  },
  importAnother: {
    id: 'uploadSummary.importAnother',
    defaultMessage: 'Import another file',
    description: 'Action taking the user back to the upload surface',
  },
})
