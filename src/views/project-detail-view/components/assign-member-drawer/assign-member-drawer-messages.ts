import { defineMessages } from 'react-intl'

/** Catalog for the assign member modal — wording only it renders. */
export const assignMemberModalMessages = defineMessages({
  assignMemberTitle: {
    id: 'projectDetail.assignMemberTitle',
    defaultMessage: 'Assign member',
    description: 'Title of the assign-member modal',
  },
  assignMemberDescription: {
    id: 'projectDetail.assignMemberDescription',
    defaultMessage:
      'Pick someone from the organization roster to assign them to {project}. New people are created in Settings › Team.',
    description: 'Subtitle of the assign-member modal, naming the project',
  },
  assignMemberSubmit: {
    id: 'projectDetail.assignMemberSubmit',
    defaultMessage: 'Assign',
    description: 'Submit button label in the assign-member modal',
  },
  userFieldLabel: {
    id: 'projectDetail.userFieldLabel',
    defaultMessage: 'User',
    description: 'Label of the user select in the add-member modal',
  },
  selectUserPlaceholder: {
    id: 'projectDetail.selectUserPlaceholder',
    defaultMessage: 'Pick a user',
    description: 'Placeholder of the user select in the add-member modal',
  },
  orgMembersLoadError: {
    id: 'projectDetail.orgMembersLoadError',
    defaultMessage: 'Could not load the organization members.',
    description: 'Error state when org members fail to load in the modal',
  },
  noAvailableMembers: {
    id: 'projectDetail.noAvailableMembers',
    defaultMessage:
      'No available members. Every organization member is already on this project.',
    description:
      'Empty state of the add-member modal when nothing can be added',
  },
  memberAddSuccess: {
    id: 'projectDetail.memberAddSuccess',
    defaultMessage: 'Member added to the project',
    description: 'Toast after adding a member to a project',
  },
  memberAddError: {
    id: 'projectDetail.memberAddError',
    defaultMessage: 'Could not add the member',
    description: 'Toast when adding a member fails',
  },
})
