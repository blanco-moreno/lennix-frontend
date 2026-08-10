import { defineMessages } from 'react-intl'

/**
 * The `taskDetail.*` ids are kept verbatim: the copy moved out of the task
 * page so every listing can say the same thing, and a rename would be a
 * translation churn for no reader's benefit.
 */
export const blockedReasonMessages = defineMessages({
  blockedWaitingOn: {
    id: 'taskDetail.blockedWaitingOn',
    defaultMessage: 'Waiting on {names} to finish.',
    description:
      'Names the predecessors still holding a blocked subactivity. `names` is an already-joined list; `count` drives verb agreement in es/pt, which English does not inflect',
  },
  blockedListSeparator: {
    id: 'taskDetail.blockedListSeparator',
    defaultMessage: ', ',
    description:
      'Joins predecessor names. Punctuation, not prose — see trustCopy.listSeparator',
  },
  blockedByBrokenEdge: {
    id: 'taskDetail.blockedByBrokenEdge',
    defaultMessage:
      'Waiting on a dependency that no longer exists. Re-link it to continue.',
    description:
      'The blocked case with no predecessor left to name — a broken edge',
  },
  brokenEdgeAction: {
    id: 'blockedReason.brokenEdgeAction',
    defaultMessage: 'Re-link in the schedule',
    description:
      'Link on the broken-edge note, to the one surface that can re-link',
  },
})
