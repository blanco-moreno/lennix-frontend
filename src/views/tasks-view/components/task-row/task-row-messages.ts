import { defineMessages } from 'react-intl'

export const taskRowMessages = defineMessages({
  criticalPath: {
    id: 'taskRow.criticalPath',
    defaultMessage: 'Critical path',
    description: 'Badge marking the activity as part of the critical path',
  },
  blocked: {
    id: 'taskRow.blocked',
    defaultMessage: 'Blocked',
    description: 'Badge shown when the activity is blocked by dependencies',
  },
  delayedSubtasksBadge: {
    id: 'taskRow.delayedSubtasksBadge',
    defaultMessage:
      '{count, plural, one {# delayed subactivity} other {# delayed subactivities}}',
    description:
      'Accessible label of the compact badge counting delayed subactivities in a row',
  },
  moreBadges: {
    id: 'taskRow.moreBadges',
    defaultMessage: '+{count}',
    description:
      'Compact badge standing for the markers that do not fit on a phone row',
  },
  moreBadgesLabel: {
    id: 'taskRow.moreBadgesLabel',
    defaultMessage:
      '{count, plural, one {# more marker} other {# more markers}} — open the activity',
    description:
      'Accessible label of the compact badge that opens the activity detail to show the remaining markers',
  },
  expand: {
    id: 'taskRow.expand',
    defaultMessage:
      'Show {count, plural, one {# subactivity} other {# subactivities}}',
    description:
      'Accessible label of the chevron that opens the subactivities of a row',
  },
  collapse: {
    id: 'taskRow.collapse',
    defaultMessage:
      'Hide {count, plural, one {# subactivity} other {# subactivities}}',
    description:
      'Accessible label of the chevron that closes the subactivities of a row',
  },
  subtaskCount: {
    id: 'taskRow.subtaskCount',
    defaultMessage:
      '{count, plural, one {# subactivity} other {# subactivities}}',
    description:
      'Title of the compact subactivity counter beside an activity name',
  },
})
