import { defineMessages } from 'react-intl'

export const commonMessages = defineMessages({
  selectDate: {
    id: 'common.selectDate',
    defaultMessage: 'Select date',
    description: 'Placeholder for an empty date picker input',
  },
  appTagline: {
    id: 'common.appTagline',
    defaultMessage: 'Lennix — Construction control and tracking',
    description: 'Alt text for the Lennix logo describing the app',
  },
  authFooter: {
    id: 'common.authFooter',
    defaultMessage: '© {year} Lennix. All rights reserved.',
    description: 'Copyright footer of the public auth pages',
  },
  authBrandSubhead: {
    id: 'common.authBrandSubhead',
    defaultMessage:
      'Schedule, progress and costs for every project, in one place.',
    description: 'Single line under the logo on the public auth pages',
  },
  actions: {
    id: 'common.actions',
    defaultMessage: 'Actions',
    description: 'Accessible label for a menu that opens contextual actions',
  },
  close: {
    id: 'common.close',
    defaultMessage: 'Close',
    description: 'Accessible label for the close button of a side panel',
  },
  cancel: {
    id: 'common.cancel',
    defaultMessage: 'Cancel',
    description: 'Generic cancel button in a form dialog footer',
  },
  save: {
    id: 'common.save',
    defaultMessage: 'Save',
    description: 'Generic save/submit button in a form dialog footer',
  },
  saving: {
    id: 'common.saving',
    defaultMessage: 'Saving...',
    description: 'Generic submit button label while a form is submitting',
  },
})
