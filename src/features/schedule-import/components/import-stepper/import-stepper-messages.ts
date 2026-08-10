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
  hintUpload: {
    id: 'importStepper.hintUpload',
    defaultMessage: 'What Lennix read',
    description: 'One-line hint under the upload step',
  },
  hintSchedule: {
    id: 'importStepper.hintSchedule',
    defaultMessage: 'Fix and assign',
    description: 'One-line hint under the schedule step',
  },
  hintBudget: {
    id: 'importStepper.hintBudget',
    defaultMessage: 'Per main activity',
    description: 'One-line hint under the budget step',
  },
  hintConfirm: {
    id: 'importStepper.hintConfirm',
    defaultMessage: 'Preview and activate',
    description: 'One-line hint under the confirm step',
  },
  locked: {
    id: 'importStepper.locked',
    defaultMessage: 'Not available yet',
    description:
      'Why a later step cannot be opened — the draft is not there yet',
  },
})
