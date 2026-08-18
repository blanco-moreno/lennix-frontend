import { defineMessages } from 'react-intl'

export const scheduleExportButtonMessages = defineMessages({
  label: {
    id: 'scheduleExport.label',
    defaultMessage: 'Export XLSX',
    description: 'Button that downloads the schedule as a spreadsheet',
  },
  pending: {
    id: 'scheduleExport.pending',
    defaultMessage: 'Exporting…',
    description: 'Button label while the spreadsheet is being produced',
  },
  error: {
    id: 'scheduleExport.error',
    defaultMessage:
      'The schedule could not be exported right now. Try again in a moment.',
    description: 'Toast when the export fails or the AI service is unavailable',
  },
})
