import { defineMessages } from 'react-intl'

/**
 * Copy for the permanent at-risk badge. The ids keep their `forceStart.`
 * prefix so the shipped translation catalogs stay valid.
 */
export const atRiskBadgeMessages = defineMessages({
  atRiskBadge: {
    id: 'forceStart.atRiskBadge',
    defaultMessage: 'At risk',
    description: 'Permanent badge on an activity that was force-started',
  },
  atRiskTooltip: {
    id: 'forceStart.atRiskTooltip',
    defaultMessage:
      'Started before its dependencies were done. This mark is permanent.',
    description: 'Explanation of the permanent at-risk badge',
  },
})
