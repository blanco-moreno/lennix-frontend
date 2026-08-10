import { defineMessages } from 'react-intl'

export const wizardNavMessages = defineMessages({
  back: {
    id: 'wizardNav.back',
    defaultMessage: 'Back',
    description: 'Action moving the wizard to the previous step',
  },
  next: {
    id: 'wizardNav.next',
    defaultMessage: 'Next',
    description: 'Action moving the wizard to the next step',
  },
  nextBlocked: {
    id: 'wizardNav.nextBlocked',
    defaultMessage: 'Finish this step first — the next one is not ready.',
    description: 'Why Next is disabled: the draft cannot reach the next step',
  },
  activate: {
    id: 'wizardNav.activate',
    defaultMessage: 'Activate schedule',
    description: 'The single go-live action, at the end of the wizard',
  },
  activating: {
    id: 'wizardNav.activating',
    defaultMessage: 'Activating…',
    description: 'Label while the go-live request is in flight',
  },
  saveForLater: {
    id: 'wizardNav.saveForLater',
    defaultMessage: 'Save and continue later',
    description:
      'Leaves the draft as-is and goes to Drafts — makes resumability explicit',
  },
  saving: {
    id: 'wizardNav.saving',
    defaultMessage: 'Saving…',
    description: 'Label of the save action while the write is in flight',
  },
  saved: {
    id: 'wizardNav.saved',
    defaultMessage: 'Saved.',
    description: 'Confirmation that the draft’s pending edits were written',
  },
  saveFailed: {
    id: 'wizardNav.saveFailed',
    defaultMessage: 'Nothing was saved. Your changes are still here.',
    description: 'Generic save failure — the draft stays open, nothing is lost',
  },
  unknownTasks: {
    id: 'wizardNav.unknownTasks',
    defaultMessage:
      '{count, plural, one {# activity is} other {# activities are}} no longer part of this draft, so nothing was saved. Reload and try again.',
    description:
      'The 400 unknown_review_tasks: the write is all-or-nothing and none of it landed',
  },
  pendingChanges: {
    id: 'wizardNav.pendingChanges',
    defaultMessage:
      '{count, plural, one {# unsaved change} other {# unsaved changes}}',
    description: 'How many fields the one Save would write',
  },
})
