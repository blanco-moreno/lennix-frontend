import { defineMessages } from 'react-intl'

export const inlineRowEditMessages = defineMessages({
  edit: {
    id: 'inlineRowEdit.edit',
    defaultMessage: 'Edit',
    description: 'Opens the inline editor on a row of the imported schedule',
  },
  editRow: {
    id: 'inlineRowEdit.editRow',
    defaultMessage: 'Edit “{title}”',
    description: 'Accessible name of the inline edit control for one row',
  },
  titleLabel: {
    id: 'inlineRowEdit.titleLabel',
    defaultMessage: 'Name',
    description: 'Label of the row-name field in the inline editor',
  },
  startLabel: {
    id: 'inlineRowEdit.startLabel',
    defaultMessage: 'Start',
    description: 'Label of the start-date field in the inline editor',
  },
  dueLabel: {
    id: 'inlineRowEdit.dueLabel',
    defaultMessage: 'Finish',
    description: 'Label of the finish-date field in the inline editor',
  },
  save: {
    id: 'inlineRowEdit.save',
    defaultMessage: 'Save',
    description: 'Confirms the inline edit',
  },
  saving: {
    id: 'inlineRowEdit.saving',
    defaultMessage: 'Saving…',
    description: 'Shown while the inline edit is in flight',
  },
  cancel: {
    id: 'inlineRowEdit.cancel',
    defaultMessage: 'Cancel',
    description: 'Closes the inline editor without writing',
  },
  failed: {
    id: 'inlineRowEdit.failed',
    defaultMessage: 'The change could not be saved. Try again.',
    description: 'Error shown when an inline edit fails',
  },
  saved: {
    id: 'inlineRowEdit.saved',
    defaultMessage: 'Row updated',
    description: 'Toast confirming an inline edit landed on the server',
  },
  pinnedHint: {
    id: 'inlineRowEdit.pinnedHint',
    defaultMessage:
      'Once you edit a row it is yours: a global re-read never overwrites it.',
    description: 'Explains edit-pinning at the point where a pin is created',
  },
})
