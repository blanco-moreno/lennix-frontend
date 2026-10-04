import { defineMessages } from 'react-intl'

export const narrationReceiptMessages = defineMessages({
  sheetUsed: {
    id: 'narrationReceipt.sheetUsed',
    defaultMessage: 'sheet “{sheet}”',
    description: 'Which worksheet of the workbook the schedule was read from',
  },
  phaseNamesLabel: {
    id: 'narrationReceipt.phaseNamesLabel',
    defaultMessage: 'As the file names them:',
    description:
      'Label before the verbatim list of section names quoted from the file',
  },
  editedRows: {
    id: 'narrationReceipt.editedRows',
    defaultMessage:
      '{count, plural, one {# activity edited} other {# activities edited}}',
    description:
      'Shown on a resumed draft so the receipt matches what the user changed',
  },
  collapsedRows: {
    id: 'narrationReceipt.collapsedRows',
    defaultMessage:
      '{count, plural, one {# subactivity came} other {# subactivities came}} from {depth} levels and now {count, plural, one {sits} other {sit}} on 2; the original path shows before the name.',
    description:
      'Notice shown when the source hierarchy was deeper than the 2-level model',
  },
  interpretation: {
    id: 'narrationReceipt.interpretation',
    defaultMessage: 'How the file was read',
    description:
      'Disclosure holding the sheet choice, the readings with no viable alternative and the rows left out',
  },
})
