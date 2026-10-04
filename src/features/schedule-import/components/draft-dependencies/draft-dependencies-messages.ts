import { defineMessages } from 'react-intl'

export const draftDependenciesMessages = defineMessages({
  title: {
    id: 'draftDependencies.title',
    defaultMessage: 'Dependencies ({count})',
    description: 'Heading of the draft’s dependency list, with its edge count',
  },
  subtitle: {
    id: 'draftDependencies.subtitle',
    defaultMessage:
      'Read from the file or added by hand. Each change is saved the moment you make it; activating computes the schedule over these links.',
    description:
      'Says where the edges come from and that edits save immediately, unlike the wizard’s Save',
  },
  empty: {
    id: 'draftDependencies.empty',
    defaultMessage:
      'No dependencies yet. Until two activities are linked, a delay in one never reaches the other.',
    description: 'The draft has no edge at all — says what the absence costs',
  },
  sourceFile: {
    id: 'draftDependencies.sourceFile',
    defaultMessage: 'From the file',
    description: 'Provenance badge: the edge was parsed from the imported file',
  },
  sourceManual: {
    id: 'draftDependencies.sourceManual',
    defaultMessage: 'Added by hand',
    description: 'Provenance badge: someone drew the edge during the review',
  },
  subjectLabel: {
    id: 'draftDependencies.subjectLabel',
    defaultMessage: 'Activity that waits',
    description:
      'Label of the picker choosing the successor of the link being added',
  },
  skippedTitle: {
    id: 'draftDependencies.skippedTitle',
    defaultMessage:
      '{count, plural, one {# relationship in the file was not imported} other {# relationships in the file were not imported}}',
    description:
      'Heading of the relationships the file states that did not become an edge, with the full count',
  },
  skippedItem: {
    id: 'draftDependencies.skippedItem',
    defaultMessage: '“{text}” · sheet {sheet}, row {row} · {reason}',
    description:
      'One relationship that was not imported: the file’s own text, where it is, and why',
  },
  skippedCapped: {
    id: 'draftDependencies.skippedCapped',
    defaultMessage: 'Showing the first {shown} of {total}.',
    description: 'The parser caps the list; says how much of it is on screen',
  },
})
