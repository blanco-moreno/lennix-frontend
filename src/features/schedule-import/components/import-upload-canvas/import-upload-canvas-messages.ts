import { defineMessages } from 'react-intl'

export const importUploadCanvasMessages = defineMessages({
  reading: {
    id: 'importUploadCanvas.reading',
    defaultMessage: 'Reading {fileName}…',
    description:
      'Status while the real parse runs — no simulated pipeline, no fake steps',
  },
  unreadableTitle: {
    id: 'importUploadCanvas.unreadableTitle',
    defaultMessage: 'Lennix could not read this file',
    description: 'Headline when the parser rejects the upload outright',
  },
  unreadableBody: {
    id: 'importUploadCanvas.unreadableBody',
    defaultMessage:
      'Nothing was imported. Try the file your team actually plans with — a schedule with task names and dates — or export it again as .xlsx or .csv.',
    description: 'Recovery guidance for an unreadable file',
  },
  tooLarge: {
    id: 'importUploadCanvas.tooLarge',
    defaultMessage: 'That file is too large for Lennix to read.',
    description: 'Shown when the backend rejects the upload as oversized (413)',
  },
  uploadFailed: {
    id: 'importUploadCanvas.uploadFailed',
    defaultMessage: 'The file could not be uploaded. Nothing was imported.',
    description: 'Generic upload failure',
  },
  tryAnother: {
    id: 'importUploadCanvas.tryAnother',
    defaultMessage: 'Try another file',
    description:
      'Action that clears the failed upload and reopens the dropzone',
  },
})
