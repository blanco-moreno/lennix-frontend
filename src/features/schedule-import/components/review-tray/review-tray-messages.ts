import { defineMessages } from 'react-intl'

export const reviewTrayMessages = defineMessages({
  title: {
    id: 'reviewTray.title',
    defaultMessage: '{count} to review',
    description:
      'Header of the tray holding the exceptions the parser could not resolve',
  },
  blocking: {
    id: 'reviewTray.blocking',
    defaultMessage:
      '{count, plural, one {# item holds activation} other {# items hold activation}}',
    description: 'How many tray items must be resolved before go-live',
  },
  unclassifiedTitle: {
    id: 'reviewTray.unclassifiedTitle',
    defaultMessage: '“{text}” did not land under any main activity',
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
    defaultMessage: '“{text}”, written on “{successor}”, matches no activity',
    description: 'Title of an unresolved predecessor exception card',
  },
  edgeNoOptions: {
    id: 'reviewTray.edgeNoOptions',
    defaultMessage: 'No activity can precede it.',
    description: 'Shown when no legal predecessor exists for the row',
  },
  edgeLabel: {
    id: 'reviewTray.edgeLabel',
    defaultMessage: 'Predecessor',
    description: 'Label of the predecessor picker',
  },
  edgePlaceholder: {
    id: 'reviewTray.edgePlaceholder',
    defaultMessage: 'Choose an activity',
    description: 'Empty state of the predecessor picker',
  },
  edgeSuggested: {
    id: 'reviewTray.edgeSuggested',
    defaultMessage: 'Closest to what the file says',
    description: 'Group of predecessor options the parser proposed or matched',
  },
  edgeOther: {
    id: 'reviewTray.edgeOther',
    defaultMessage: 'Every other activity',
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
  edgeOpen: {
    id: 'reviewTray.edgeOpen',
    defaultMessage: 'Choose predecessor',
    description:
      'Opens the drawer of the row the unmatched predecessor was written on',
  },
  skippedTitle: {
    id: 'reviewTray.skippedTitle',
    defaultMessage:
      '{count, plural, one {# dependency in the file was not imported} other {# dependencies in the file were not imported}}',
    description:
      'Relationships the file states that did not become an edge, with the full count',
  },
  skippedItem: {
    id: 'reviewTray.skippedItem',
    defaultMessage: '“{text}” · sheet {sheet}, row {row} · {reason}',
    description:
      'One relationship that was not imported: the file’s own text, where it is, and why',
  },
  skippedCapped: {
    id: 'reviewTray.skippedCapped',
    defaultMessage: 'Showing the first {shown} of {total}.',
    description: 'The skipped list is capped by the parser',
  },
})
