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
  invalidSignatureTitle: {
    id: 'importUploadCanvas.invalidSignatureTitle',
    defaultMessage: 'This file is not what its extension says',
    description: 'Headline when file magic bytes fail verification',
  },
  invalidSignatureBody: {
    id: 'importUploadCanvas.invalidSignatureBody',
    defaultMessage:
      "The file's contents do not match its extension. Executables and renamed binaries are refused; upload the original .xlsx, .xlsm or .csv.",
    description: 'Body when file signature validation fails',
  },
  unsupportedTypeTitle: {
    id: 'importUploadCanvas.unsupportedTypeTitle',
    defaultMessage: 'This file type cannot be imported',
    description:
      'Headline when the upload extension is not a supported schedule format',
  },
  unsupportedTypeBody: {
    id: 'importUploadCanvas.unsupportedTypeBody',
    defaultMessage:
      'Only .xlsx, .xlsm and .csv schedules can be imported. Export your schedule to one of those formats and upload it again.',
    description:
      'Body when the upload extension is not a supported schedule format',
  },
  scheduleTooLargeTitle: {
    id: 'importUploadCanvas.scheduleTooLargeTitle',
    defaultMessage: 'This schedule is too long to import',
    description:
      'Headline when the schedule has more rows than the parser reads from one sheet',
  },
  scheduleTooLargeBody: {
    id: 'importUploadCanvas.scheduleTooLargeBody',
    defaultMessage:
      'Lennix reads up to {maxRows, number} rows from one sheet, and this file has more. Nothing was imported. Split the schedule into smaller files, for example by phase, and import each one.',
    description:
      'Body when the schedule is longer than the sheet row limit; maxRows is that limit',
  },
  promptInjectionTitle: {
    id: 'importUploadCanvas.promptInjectionTitle',
    defaultMessage: 'This file was not processed',
    description: 'Headline when a prompt injection attempt is detected',
  },
  promptInjectionBody: {
    id: 'importUploadCanvas.promptInjectionBody',
    defaultMessage:
      'The file contains text that reads as instructions to the AI, so it was not processed. Remove that text and upload it again.',
    description: 'Body when prompt injection is detected',
  },
})
