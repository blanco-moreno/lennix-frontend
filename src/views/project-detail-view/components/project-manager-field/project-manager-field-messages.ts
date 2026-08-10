import { defineMessages } from 'react-intl'

export const projectManagerFieldMessages = defineMessages({
  label: {
    id: 'projectManagerField.label',
    defaultMessage: 'Project manager',
    description: 'Label of the manager picker in the project edit modal',
  },
  caption: {
    id: 'projectManagerField.caption',
    defaultMessage:
      'Only somebody already on this project can lead it. Add them on the Team tab first.',
    description:
      'Help text under the manager picker explaining why the options are limited to project members',
  },
  placeholder: {
    id: 'projectManagerField.placeholder',
    defaultMessage: 'Pick a manager',
    description: 'Placeholder of the manager picker',
  },
  loadError: {
    id: 'projectManagerField.loadError',
    defaultMessage: 'Could not load the project team.',
    description: 'Error state when the project team fails to load',
  },
  noCandidates: {
    id: 'projectManagerField.noCandidates',
    defaultMessage:
      'Nobody is on this project yet. Add a member on the Team tab before handing it over.',
    description: 'Empty state of the manager picker when the team is empty',
  },
  unnamedUser: {
    id: 'projectManagerField.unnamedUser',
    defaultMessage: 'Unnamed user',
    description: 'Fallback option label when a project member has no name',
  },
})
