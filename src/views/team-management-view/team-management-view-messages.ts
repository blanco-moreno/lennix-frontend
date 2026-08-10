import { defineMessages } from 'react-intl'

export const teamManagementViewMessages = defineMessages({
  title: {
    id: 'teamManagement.title',
    defaultMessage: 'Organization Team',
    description: 'Main heading of the team management page',
  },
  addMember: {
    id: 'teamManagement.addMember',
    defaultMessage: 'Add Member',
    description: 'Label for the button and dialog that adds a new member',
  },
  membersCardTitle: {
    id: 'teamManagement.membersCardTitle',
    defaultMessage: 'Members',
    description: 'Title of the members card',
  },
  membersCardDescription: {
    id: 'teamManagement.membersCardDescription',
    defaultMessage:
      'The organization roster: who exists in Lennix and their role. Assigning people to a project happens in that project’s Team tab.',
    description:
      'Description of the members card, scoping the roster against project assignment',
  },
  searchPlaceholder: {
    id: 'teamManagement.searchPlaceholder',
    defaultMessage: 'Search by name, email or role...',
    description: 'Placeholder for the members search input',
  },
  emptyTitle: {
    id: 'teamManagement.emptyTitle',
    defaultMessage: 'No members',
    description: 'Empty state title when the organization has no members',
  },
  emptyDescription: {
    id: 'teamManagement.emptyDescription',
    defaultMessage: 'Add the first member using the button above.',
    description: 'Empty state description when the organization has no members',
  },
  noMatchMessage: {
    id: 'teamManagement.noMatchMessage',
    defaultMessage: 'No member matches the search.',
    description: 'Message shown when no member matches the current search',
  },
  noOrgTitle: {
    id: 'teamManagement.noOrgTitle',
    defaultMessage: "You don't belong to any organization",
    description: 'Empty state title when the user has no organization',
  },
  noOrgDescription: {
    id: 'teamManagement.noOrgDescription',
    defaultMessage: 'Your user is not associated with an organization yet.',
    description: 'Empty state description when the user has no organization',
  },
  columnMember: {
    id: 'teamManagement.columnMember',
    defaultMessage: 'Member',
    description: 'Members table column header for the member name',
  },
  columnRole: {
    id: 'teamManagement.columnRole',
    defaultMessage: 'Role',
    description: 'Members table column header for the role',
  },
  columnJoinedAt: {
    id: 'teamManagement.columnJoinedAt',
    defaultMessage: 'Member since',
    description: 'Members table column header for the join date',
  },
  columnActions: {
    id: 'teamManagement.columnActions',
    defaultMessage: 'Actions',
    description: 'Members table column header for the actions column',
  },
  youBadge: {
    id: 'teamManagement.youBadge',
    defaultMessage: 'You',
    description: 'Badge marking the row that corresponds to the current user',
  },
  systemRoleLabel: {
    id: 'teamManagement.systemRoleLabel',
    defaultMessage: 'Role',
    description:
      'Column header and field label for the system role — the only role axis',
  },

  roleLabel: {
    id: 'teamManagement.roleLabel',
    defaultMessage: 'Organization role',
    description: 'Label of the role select in the add-member dialog',
  },
  roleHint: {
    id: 'teamManagement.roleHint',
    defaultMessage:
      'An admin can add people, remove them and change their role. You can change this later.',
    description: 'Help text under the role select in the add-member dialog',
  },
  removeMemberTitle: {
    id: 'teamManagement.removeMemberTitle',
    defaultMessage: 'Remove Member',
    description: 'Title of the confirmation dialog to remove a member',
  },
  removeMemberDescription: {
    id: 'teamManagement.removeMemberDescription',
    defaultMessage:
      'Are you sure you want to remove {firstName} {lastName} from the organization? This action cannot be undone.',
    description: 'Description of the confirmation dialog to remove a member',
  },
  cancel: {
    id: 'teamManagement.cancel',
    defaultMessage: 'Cancel',
    description: 'Cancel button of the remove member confirmation dialog',
  },
  remove: {
    id: 'teamManagement.remove',
    defaultMessage: 'Remove',
    description: 'Confirm button of the remove member confirmation dialog',
  },
  addMemberDialogDescription: {
    id: 'teamManagement.addMemberDialogDescription',
    defaultMessage: 'Create a new user and add them to your organization.',
    description: 'Description of the add member dialog',
  },
  createMemberButton: {
    id: 'teamManagement.createMemberButton',
    defaultMessage: 'Create member',
    description: 'Submit button of the add member dialog',
  },
  firstNameLabel: {
    id: 'teamManagement.firstNameLabel',
    defaultMessage: 'First name',
    description: 'Label for the first name field in the add member dialog',
  },
  firstNamePlaceholder: {
    id: 'teamManagement.firstNamePlaceholder',
    defaultMessage: 'e.g. María',
    description:
      'Placeholder for the first name field in the add member dialog',
  },
  lastNameLabel: {
    id: 'teamManagement.lastNameLabel',
    defaultMessage: 'Last name',
    description: 'Label for the last name field in the add member dialog',
  },
  lastNamePlaceholder: {
    id: 'teamManagement.lastNamePlaceholder',
    defaultMessage: 'e.g. González',
    description: 'Placeholder for the last name field in the add member dialog',
  },
  emailLabel: {
    id: 'teamManagement.emailLabel',
    defaultMessage: 'Email address',
    description: 'Label for the email field in the add member dialog',
  },
  emailPlaceholder: {
    id: 'teamManagement.emailPlaceholder',
    defaultMessage: 'user@company.com',
    description: 'Placeholder for the email field in the add member dialog',
  },
  tempPasswordHint: {
    id: 'teamManagement.tempPasswordHint',
    defaultMessage:
      'A temporary password will be generated that you can share with the user. We will recommend they change it on their first login.',
    description: 'Hint about the temporary password in the add member dialog',
  },
  memberCreatedTitle: {
    id: 'teamManagement.memberCreatedTitle',
    defaultMessage: 'Member created',
    description:
      'Title of the credentials dialog shown after creating a member',
  },
  memberCreatedDescription: {
    id: 'teamManagement.memberCreatedDescription',
    defaultMessage:
      'Share these credentials with the new member. The password will not be shown again.',
    description:
      'Description of the credentials dialog shown after creating a member',
  },
  copyCredentials: {
    id: 'teamManagement.copyCredentials',
    defaultMessage: 'Copy credentials',
    description: 'Button to copy the new member credentials to the clipboard',
  },
  done: {
    id: 'teamManagement.done',
    defaultMessage: 'Done',
    description: 'Button to close the credentials dialog',
  },
  credentialEmailLabel: {
    id: 'teamManagement.credentialEmailLabel',
    defaultMessage: 'Email',
    description: 'Email label in the credentials dialog',
  },
  tempPasswordLabel: {
    id: 'teamManagement.tempPasswordLabel',
    defaultMessage: 'Temporary password',
    description: 'Temporary password label in the credentials dialog',
  },
  credentialsCopyText: {
    id: 'teamManagement.credentialsCopyText',
    defaultMessage: 'Email: {email}\nTemporary password: {password}',
    description: 'Text copied to the clipboard with the new member credentials',
  },
  memberCreatedToast: {
    id: 'teamManagement.memberCreatedToast',
    defaultMessage: 'Member created and added to the organization',
    description: 'Success toast shown after creating and adding a member',
  },
  createMemberError: {
    id: 'teamManagement.createMemberError',
    defaultMessage: 'Error creating the member',
    description: 'Error toast shown when creating a member fails',
  },
  memberRemovedToast: {
    id: 'teamManagement.memberRemovedToast',
    defaultMessage: 'Member removed from the organization',
    description: 'Success toast shown after removing a member',
  },
  removeMemberError: {
    id: 'teamManagement.removeMemberError',
    defaultMessage: 'Error removing member',
    description: 'Error toast shown when removing a member fails',
  },
  credentialsCopiedToast: {
    id: 'teamManagement.credentialsCopiedToast',
    defaultMessage: 'Credentials copied to clipboard',
    description: 'Success toast shown after copying credentials',
  },
  credentialsCopyError: {
    id: 'teamManagement.credentialsCopyError',
    defaultMessage: 'Could not copy to clipboard',
    description: 'Error toast shown when copying credentials fails',
  },
  roleScopeTitle: {
    id: 'teamManagement.roleScopeTitle',
    defaultMessage: 'What each role reaches',
    description: 'Heading of the legend explaining the scope of every role',
  },
})
