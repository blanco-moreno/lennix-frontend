import { defineMessages } from 'react-intl'

export const importDropzoneMessages = defineMessages({
  title: {
    id: 'importDropzone.title',
    defaultMessage: 'Drop your schedule in',
    description: 'Heading of the single-step import upload',
  },
  subtitle: {
    id: 'importDropzone.subtitle',
    defaultMessage:
      'Your Excel or CSV programme, exactly as you keep it. Lennix reads it and shows you the schedule — you adjust from there.',
    description: 'Result-first promise under the upload heading',
  },
  dropzoneIdle: {
    id: 'importDropzone.dropzoneIdle',
    defaultMessage: 'Drag your file here, or click to choose it',
    description: 'Idle dropzone label',
  },
  dropzoneActive: {
    id: 'importDropzone.dropzoneActive',
    defaultMessage: 'Drop it to read the schedule',
    description: 'Dropzone label while a file is dragged over it',
  },
  formatsHint: {
    id: 'importDropzone.formatsHint',
    defaultMessage: '.xlsx, .xlsm or .csv · up to {size} MB',
    description: 'Accepted formats and the upload size cap',
  },
  selectFile: {
    id: 'importDropzone.selectFile',
    defaultMessage: 'Choose file',
    description: 'Button that opens the file picker',
  },
  removeFile: {
    id: 'importDropzone.removeFile',
    defaultMessage: 'Remove file',
    description: 'Accessible label of the button clearing the chosen file',
  },
  fileSize: {
    id: 'importDropzone.fileSize',
    defaultMessage: '{size} KB',
    description: 'Size of the chosen file',
  },
  fileTooLarge: {
    id: 'importDropzone.fileTooLarge',
    defaultMessage: 'That file is over the {size} MB limit.',
    description: 'Rejection message for an oversized file',
  },
  formatUnsupported: {
    id: 'importDropzone.formatUnsupported',
    defaultMessage: 'Lennix reads .xlsx, .xlsm and .csv files.',
    description: 'Rejection message for an unsupported file type',
  },
})
