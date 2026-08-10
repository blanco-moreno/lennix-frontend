import { defineMessages } from 'react-intl'

export const brokenDependencyMessages = defineMessages({
  title: {
    id: 'brokenDependency.title',
    defaultMessage: 'Broken link — re-link required',
    description: 'Header of the broken-dependency card',
  },
  bodyKnown: {
    id: 'brokenDependency.bodyKnown',
    defaultMessage:
      '“{successor}” still depends on “{predecessor}”, which was deleted. Pick what it should follow now, or drop the link.',
    description:
      'Explains a broken dependency whose deleted predecessor is still identifiable',
  },
  bodyUnknown: {
    id: 'brokenDependency.bodyUnknown',
    defaultMessage:
      '“{successor}” depends on a row that no longer exists. Pick what it should follow now, or drop the link.',
    description: 'Explains a broken dependency whose predecessor is gone',
  },
  stillBlocked: {
    id: 'brokenDependency.stillBlocked',
    defaultMessage: 'It stays blocked until you do.',
    description:
      'States the consequence when the broken edge keeps the row blocked',
  },
  satisfied: {
    id: 'brokenDependency.satisfied',
    defaultMessage:
      'The deleted row was already done, so work is not blocked — the link is just stale.',
    description: 'A DONE-then-deleted predecessor stays satisfied',
  },
  pickLabel: {
    id: 'brokenDependency.pickLabel',
    defaultMessage: 'Now depends on',
    description: 'Label of the replacement-predecessor picker',
  },
  pickPlaceholder: {
    id: 'brokenDependency.pickPlaceholder',
    defaultMessage: 'Choose a row…',
    description: 'Placeholder of the replacement-predecessor picker',
  },
  relink: {
    id: 'brokenDependency.relink',
    defaultMessage: 'Re-link',
    description: 'Action that repoints a broken dependency at a live row',
  },
  relinking: {
    id: 'brokenDependency.relinking',
    defaultMessage: 'Re-linking…',
    description: 'Pending state of the re-link action',
  },
  discard: {
    id: 'brokenDependency.discard',
    defaultMessage: 'Drop the link',
    description:
      'Action that removes a broken dependency instead of re-linking',
  },
  noCandidates: {
    id: 'brokenDependency.noCandidates',
    defaultMessage:
      'No row can legally precede this one yet — add one, or drop the link.',
    description: 'Shown when the picker would be empty',
  },
  relinkFailed: {
    id: 'brokenDependency.relinkFailed',
    defaultMessage: 'Could not re-link. Try again.',
    description: 'Error after a failed re-link',
  },
  relinked: {
    id: 'brokenDependency.relinked',
    defaultMessage: 'Re-linked.',
    description: 'Toast after a successful re-link',
  },
})
