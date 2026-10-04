import { defineMessages } from 'react-intl'

export const importStepperMessages = defineMessages({
  label: {
    id: 'importStepper.label',
    defaultMessage: 'Import progress',
    description: 'Accessible name of the import wizard stepper',
  },
  stepUpload: {
    id: 'importStepper.stepUpload',
    defaultMessage: 'Upload file',
    description: 'Step 1 of the import wizard',
  },
  stepSchedule: {
    id: 'importStepper.stepSchedule',
    defaultMessage: 'Schedule',
    description: 'Step 2 of the import wizard — review and adjust the schedule',
  },
  stepBudget: {
    id: 'importStepper.stepBudget',
    defaultMessage: 'Budget',
    description: 'Step 3 of the import wizard — split the budget per activity',
  },
  stepConfirm: {
    id: 'importStepper.stepConfirm',
    defaultMessage: 'Confirm',
    description: 'Step 4 of the import wizard — preview and go live',
  },
})
