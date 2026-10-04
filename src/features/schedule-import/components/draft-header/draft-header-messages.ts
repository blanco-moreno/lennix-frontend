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
  draftBadge: {
    id: 'draftHeader.draftBadge',
    defaultMessage: 'Draft',
    description: 'Says this project is not live yet',
  },
})
