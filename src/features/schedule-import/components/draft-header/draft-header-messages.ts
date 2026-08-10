import { defineMessages } from 'react-intl'

export const draftHeaderMessages = defineMessages({
  nameLabel: {
    id: 'draftHeader.nameLabel',
    defaultMessage: 'Project name',
    description: 'Accessible name of the editable draft title',
  },
  namePlaceholder: {
    id: 'draftHeader.namePlaceholder',
    defaultMessage: 'Name this project',
    description: 'Placeholder shown when the import produced no project name',
  },
  locationLabel: {
    id: 'draftHeader.locationLabel',
    defaultMessage: 'Location',
    description: 'Label of the project location field in the draft header',
  },
  locationPlaceholder: {
    id: 'draftHeader.locationPlaceholder',
    defaultMessage: 'Where is the site?',
    description: 'Placeholder of the project location field',
  },
  descriptionLabel: {
    id: 'draftHeader.descriptionLabel',
    defaultMessage: 'Description',
    description: 'Label of the project description field in the draft header',
  },
  descriptionPlaceholder: {
    id: 'draftHeader.descriptionPlaceholder',
    defaultMessage: 'What is being built here?',
    description: 'Placeholder of the project description field',
  },
  explainer: {
    id: 'draftHeader.explainer',
    defaultMessage:
      'Lennix took these from your file. Edits are applied when you activate — nothing here holds the wizard up.',
    description: 'Why the header fields are optional and when they are written',
  },
  pendingChanges: {
    id: 'draftHeader.pendingChanges',
    defaultMessage:
      '{count, plural, one {# change is applied when you activate} other {# changes are applied when you activate}}',
    description: 'Tells the user the header edits travel with go-live',
  },
  draftBadge: {
    id: 'draftHeader.draftBadge',
    defaultMessage: 'Draft',
    description: 'Says this project is not live yet',
  },
  locationHint: {
    id: 'draftHeader.locationHint',
    defaultMessage: 'City or site — whatever your team calls it.',
    description: 'What to put in the location field',
  },
})
