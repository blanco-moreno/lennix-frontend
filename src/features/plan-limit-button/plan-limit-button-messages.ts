import { defineMessages } from 'react-intl'

/**
 * One line per resource, and each says three things: which ceiling, the exact
 * numbers, and the way out. A blocked control that only says "unavailable"
 * makes the user guess — and guessing ends in a support ticket.
 */
export const planLimitButtonMessages = defineMessages({
  projects: {
    id: 'planLimit.projectsBlocked',
    defaultMessage:
      'You reached your plan’s project limit ({used} of {max}). Delete a project or upgrade your plan.',
    description:
      'Tooltip on a create action blocked by the live-project plan ceiling',
  },
  drafts: {
    id: 'planLimit.draftsBlocked',
    defaultMessage:
      'You reached your plan’s draft limit ({used} of {max}). Activate or delete a draft, or upgrade your plan.',
    description:
      'Tooltip on an import action blocked by the draft plan ceiling',
  },
  members: {
    id: 'planLimit.membersBlocked',
    defaultMessage:
      'You reached your plan’s team limit ({used} of {max}). Remove a member or upgrade your plan.',
    description:
      'Tooltip on the add-member action blocked by the team-size plan ceiling',
  },
  ai: {
    id: 'planLimit.aiBlocked',
    defaultMessage:
      'You reached your plan’s AI request limit ({used} of {max}). Upgrade your plan to perform more AI imports.',
    description:
      'Tooltip on an AI action blocked by the monthly AI request ceiling',
  },
  storage: {
    id: 'planLimit.storageBlocked',
    defaultMessage:
      'You reached your plan’s storage limit ({used} of {max} MB). Upgrade your plan to import more files.',
    description: 'Tooltip on an upload action blocked by the storage ceiling',
  },
})
