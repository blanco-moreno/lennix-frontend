import { defineMessages } from 'react-intl'

export const reviewTrayMessages = defineMessages({
  title: {
    id: 'reviewTray.title',
    defaultMessage: 'Review this ({count})',
    description:
      'Header of the tray holding the exceptions the parser could not resolve',
  },
  blocking: {
    id: 'reviewTray.blocking',
    defaultMessage:
      '{count, plural, one {# item holds activation} other {# items hold activation}}',
    description: 'How many tray items must be resolved before go-live',
  },
  optionalNote: {
    id: 'reviewTray.optionalNote',
    defaultMessage: 'The rest is optional — you can activate without it.',
    description: 'Clarifies that non-structural exceptions never block go-live',
  },
  floorNote: {
    id: 'reviewTray.floorNote',
    defaultMessage:
      'Anything else — a wrong name, a date only you can read — is fixed by editing the row directly on the schedule below.',
    description:
      'Names the canvas edit as the universal fallback for what has no widget',
  },
  structureTitle: {
    id: 'reviewTray.structureTitle',
    defaultMessage: '“{title}” has no subactivities under it',
    description: 'Title of the structure exception card',
  },
  structureBody: {
    id: 'reviewTray.structureBody',
    defaultMessage:
      'A main activity is tracked through its subactivities. Lennix can add one mirror subactivity that repeats the main activity, or you can add the real subactivities by editing the schedule.',
    description:
      'Explains the every-main-activity-has-subactivities invariant and both ways out of it',
  },
  structureAccept: {
    id: 'reviewTray.structureAccept',
    defaultMessage: 'Add the mirror subactivity',
    description: 'One-click acceptance of the mirror subactivity',
  },
  unclassifiedTitle: {
    id: 'reviewTray.unclassifiedTitle',
    defaultMessage: 'Lennix could not place “{text}”',
    description: 'Title of an unclassified-row exception card',
  },
  unclassifiedSource: {
    id: 'reviewTray.unclassifiedSource',
    defaultMessage: 'Sheet {sheet}, row {row} · {cause}',
    description: 'Where the unplaced row came from and why it stayed out',
  },
  placeLabel: {
    id: 'reviewTray.placeLabel',
    defaultMessage: 'Place it under a main activity',
    description: 'Label of the main-activity picker for an unclassified row',
  },
  placePlaceholder: {
    id: 'reviewTray.placePlaceholder',
    defaultMessage: 'Choose a main activity',
    description: 'Empty state of the main-activity picker',
  },
  placeAction: {
    id: 'reviewTray.placeAction',
    defaultMessage: 'Place',
    description: 'Confirms placing the row under the chosen main activity',
  },
  discardAction: {
    id: 'reviewTray.discardAction',
    defaultMessage: 'Not part of the schedule',
    description: 'Discards a row that was never work to begin with',
  },
  placeFailed: {
    id: 'reviewTray.placeFailed',
    defaultMessage: 'The row could not be placed. Try again.',
    description: 'Error shown when placing an unclassified row fails',
  },
  edgeTitle: {
    id: 'reviewTray.edgeTitle',
    defaultMessage: 'Predecessor “{text}” matched no row',
    description: 'Title of an unresolved predecessor exception card',
  },
  edgeBody: {
    id: 'reviewTray.edgeBody',
    defaultMessage:
      'It was written on “{successor}”. Pick the row it meant, or leave it — Lennix never invents a dependency.',
    description:
      'Explains the unresolved edge and that resolving it is optional',
  },
  edgeNoOptions: {
    id: 'reviewTray.edgeNoOptions',
    defaultMessage:
      'No row in this schedule can precede it, so there is nothing to link.',
    description: 'Shown when no legal predecessor exists for the row',
  },
  edgeLabel: {
    id: 'reviewTray.edgeLabel',
    defaultMessage: 'Predecessor row',
    description: 'Label of the predecessor picker',
  },
  edgePlaceholder: {
    id: 'reviewTray.edgePlaceholder',
    defaultMessage: 'Choose a row',
    description: 'Empty state of the predecessor picker',
  },
  edgeSuggested: {
    id: 'reviewTray.edgeSuggested',
    defaultMessage: 'Closest to what the file says',
    description: 'Group of predecessor options the parser proposed or matched',
  },
  edgeOther: {
    id: 'reviewTray.edgeOther',
    defaultMessage: 'Every other row',
    description: 'Group of the remaining rows in the predecessor picker',
  },
  edgeAction: {
    id: 'reviewTray.edgeAction',
    defaultMessage: 'Link it',
    description: 'Creates the dependency with the picked predecessor',
  },
  working: {
    id: 'reviewTray.working',
    defaultMessage: 'Saving…',
    description: 'Shown on a tray action while its request is in flight',
  },
})
