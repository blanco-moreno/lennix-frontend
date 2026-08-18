import { defineMessages } from 'react-intl'

export const planQuotaNoticeMessages = defineMessages({
  projectLimitTitle: {
    id: 'planQuotaNotice.projectLimitTitle',
    defaultMessage:
      'You reached your plan limit: {limit, plural, one {# live project} other {# live projects}}',
    description:
      'Headline when activating a schedule would exceed the plan live-project cap',
  },
  projectLimitBody: {
    id: 'planQuotaNotice.projectLimitBody',
    defaultMessage:
      'Your draft is safe — nothing was lost. Archive or delete a live project, or upgrade your plan, and activate again.',
    description: 'Recovery options for the live-project cap',
  },
  draftLimitTitle: {
    id: 'planQuotaNotice.draftLimitTitle',
    defaultMessage:
      'You reached your plan limit: {limit, plural, one {# pending draft} other {# pending drafts}}',
    description: 'Headline when a new upload would exceed the draft cap',
  },
  draftLimitBody: {
    id: 'planQuotaNotice.draftLimitBody',
    defaultMessage:
      'Activate or delete one of your drafts, or upgrade your plan, and import again.',
    description: 'Recovery options for the draft cap',
  },
  storageLimitTitle: {
    id: 'planQuotaNotice.storageLimitTitle',
    defaultMessage: 'You reached your plan limit: {limit} MB of imported files',
    description: 'Headline when a new upload would exceed the storage cap',
  },
  storageLimitBody: {
    id: 'planQuotaNotice.storageLimitBody',
    defaultMessage:
      'This file was not stored. Upgrade your plan to import more files.',
    description: 'Recovery options for the storage cap',
  },
  currentUsage: {
    id: 'planQuotaNotice.currentUsage',
    defaultMessage: 'You are using {current} of {limit}.',
    description: 'Quiet line stating the exact usage the backend reported',
  },
  goToDrafts: {
    id: 'planQuotaNotice.goToDrafts',
    defaultMessage: 'Go to drafts',
    description: 'Action that takes the user to the drafts home to free a slot',
  },
  goToSettings: {
    id: 'planQuotaNotice.goToSettings',
    defaultMessage: 'See plan usage',
    description: 'Action that takes the user to the plan usage section',
  },
  goToProjects: {
    id: 'planQuotaNotice.goToProjects',
    defaultMessage: 'Go to projects',
    description:
      'Action that takes the user to the project list to free a live slot',
  },
})
