import { defineMessages } from 'react-intl'

/**
 * The single force-start vocabulary, for both doors: the `direct*` keys are
 * what an approver reads when they override the block themselves, the rest is
 * the request a `user` files.
 */
export const forceStartMessages = defineMessages({
  directButton: {
    id: 'forceStart.directButton',
    defaultMessage: 'Force start',
    description: 'Trigger button of the direct force-start action',
  },
  directTitle: {
    id: 'forceStart.directTitle',
    defaultMessage: 'Force start now',
    description: 'Title of the direct force-start confirmation',
  },
  directDescription: {
    id: 'forceStart.directDescription',
    defaultMessage:
      'Start "{name}" before its dependencies are done. This takes effect immediately.',
    description: 'Body of the direct force-start confirmation',
  },
  directBannerTask: {
    id: 'forceStart.directBannerTask',
    defaultMessage:
      'This main activity has pending dependencies. Forcing it marks it at risk permanently.',
    description: 'Warning of the direct force-start of an activity',
  },
  directBannerSubtask: {
    id: 'forceStart.directBannerSubtask',
    defaultMessage:
      'This subactivity has pending dependencies. Forcing it marks it at risk permanently.',
    description: 'Warning of the direct force-start of a subactivity',
  },
  directConfirm: {
    id: 'forceStart.directConfirm',
    defaultMessage: 'Force start',
    description: 'Confirm button of the direct force-start',
  },
  directConfirmLoading: {
    id: 'forceStart.directConfirmLoading',
    defaultMessage: 'Starting…',
    description: 'Confirm button label while the override is in flight',
  },
  directSuccessTask: {
    id: 'forceStart.directSuccessTask',
    defaultMessage: 'Activity started — marked at risk',
    description: 'Toast after force-starting an activity directly',
  },
  directSuccessSubtask: {
    id: 'forceStart.directSuccessSubtask',
    defaultMessage: 'Subactivity started — marked at risk',
    description: 'Toast after force-starting a subactivity directly',
  },
  directError: {
    id: 'forceStart.directError',
    defaultMessage: 'Could not force the start',
    description: 'Toast when the direct force-start fails',
  },
  directNotBlocked: {
    id: 'forceStart.directNotBlocked',
    defaultMessage:
      'It is no longer blocked — nothing to force. Refresh to see its current state.',
    description:
      'Toast for the backend 400 raised when the target is not blocked',
  },
  button: {
    id: 'forceStart.button',
    defaultMessage: 'Request force start',
    description: 'Trigger button of the shared force-start request action',
  },
  title: {
    id: 'forceStart.title',
    defaultMessage: 'Request force start',
    description: 'Title of the force-start request modal',
  },
  description: {
    id: 'forceStart.description',
    defaultMessage:
      'Ask for "{name}" to start before its dependencies are done. An approver decides.',
    description: 'Body of the force-start request modal',
  },
  bannerTask: {
    id: 'forceStart.bannerTask',
    defaultMessage:
      'This main activity has pending dependencies. If approved, it will be marked at risk permanently.',
    description: 'Warning banner when the force-start target is an activity',
  },
  bannerSubtask: {
    id: 'forceStart.bannerSubtask',
    defaultMessage:
      'This subactivity has pending dependencies. If approved, it will be marked at risk permanently.',
    description: 'Warning banner when the force-start target is a subactivity',
  },
  reasonLabel: {
    id: 'forceStart.reasonLabel',
    defaultMessage: 'Why does it have to start now?',
    description: 'Label of the justification textarea',
  },
  reasonPlaceholder: {
    id: 'forceStart.reasonPlaceholder',
    defaultMessage:
      'e.g. the crew is already on site and the predecessor only lacks its final inspection…',
    description: 'Placeholder of the justification textarea',
  },
  cancel: {
    id: 'forceStart.cancel',
    defaultMessage: 'Cancel',
    description: 'Cancel button of the force-start request modal',
  },
  confirm: {
    id: 'forceStart.confirm',
    defaultMessage: 'Send request',
    description: 'Confirm button of the force-start request modal',
  },
  confirmLoading: {
    id: 'forceStart.confirmLoading',
    defaultMessage: 'Sending…',
    description: 'Confirm button label while the request is in flight',
  },
  successTask: {
    id: 'forceStart.successTask',
    defaultMessage: 'Request sent — awaiting approval',
    description: 'Toast after requesting the force start of an activity',
  },
  successSubtask: {
    id: 'forceStart.successSubtask',
    defaultMessage: 'Request sent — awaiting approval',
    description: 'Toast after requesting the force start of a subactivity',
  },
  errorTask: {
    id: 'forceStart.errorTask',
    defaultMessage: 'Could not send the request',
    description: 'Toast when requesting the force start of an activity fails',
  },
  errorSubtask: {
    id: 'forceStart.errorSubtask',
    defaultMessage: 'Could not send the request',
    description: 'Toast when requesting the force start of a subactivity fails',
  },
  pendingBadge: {
    id: 'forceStart.pendingBadge',
    defaultMessage: 'Force start requested',
    description: 'Badge shown while a request awaits a decision',
  },
})
