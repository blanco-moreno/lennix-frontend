import { defineMessages } from 'react-intl'

export const memberRoleControlMessages = defineMessages({
  trigger: {
    id: 'memberRoleControl.trigger',
    defaultMessage: 'Change role',
    description: 'Row action that opens the change-organization-role dialog',
  },
  title: {
    id: 'memberRoleControl.title',
    defaultMessage: 'Change role',
    description: 'Title of the change-organization-role dialog',
  },
  description: {
    id: 'memberRoleControl.description',
    defaultMessage:
      'Choose what {firstName} {lastName} can do in this organization. This does not change what they can do on any individual project.',
    description: 'Body of the change-organization-role dialog',
  },
  fieldLabel: {
    id: 'memberRoleControl.fieldLabel',
    defaultMessage: 'Role',
    description:
      'Label of the role select in the grant dialog — the system role, the only role axis',
  },
  roleMemberHelp: {
    id: 'memberRoleControl.roleMemberHelp',
    defaultMessage:
      'A member works on the projects they are assigned to. They cannot manage the team.',
    description: 'Explanation shown when the "member" role is selected',
  },
  roleAdminHelp: {
    id: 'memberRoleControl.roleAdminHelp',
    defaultMessage:
      'An Admin also manages the organization: adding people, removing them and changing their role.',
    description: 'Explanation shown when the "admin" role is selected',
  },
  submit: {
    id: 'memberRoleControl.submit',
    defaultMessage: 'Save role',
    description: 'Confirm button of the change-organization-role dialog',
  },
  successToast: {
    id: 'memberRoleControl.successToast',
    defaultMessage: '{firstName} is now {role}.',
    description: 'Toast shown after a successful organization-role change',
  },
  genericError: {
    id: 'memberRoleControl.genericError',
    defaultMessage: 'The role could not be changed. Try again.',
    description: 'Fallback error in the change-organization-role dialog',
  },
  ownerImmutableTitle: {
    id: 'memberRoleControl.ownerImmutableTitle',
    defaultMessage: 'The owner is always an admin',
    description: 'Title of the owner_system_role_immutable explanation',
  },
  ownerImmutableBody: {
    id: 'memberRoleControl.ownerImmutableBody',
    defaultMessage:
      'The owner’s role moves only together with ownership. To change it, transfer the organization to someone else in Organization settings — the new owner becomes admin and the previous one steps down in the same operation.',
    description:
      'Body of the owner_system_role_immutable explanation, with the way out',
  },
  goToTransferOwnership: {
    id: 'memberRoleControl.goToTransferOwnership',
    defaultMessage: 'Go to Organization settings',
    description: 'Button that takes the user to the transfer-ownership surface',
  },
  selfEditTitle: {
    id: 'memberRoleControl.selfEditTitle',
    defaultMessage: 'This is the only admin left',
    description: 'Title of the cannot_change_own_system_role explanation',
  },
  selfEditBody: {
    id: 'memberRoleControl.selfEditBody',
    defaultMessage:
      'An organization with no admin cannot administer itself: nobody could add a person, remove one, or promote anyone back. Promote another member to admin first, then come back.',
    description: 'Body of the cannot_change_own_system_role explanation',
  },
  onlyOwnerAdminsTitle: {
    id: 'memberRoleControl.onlyOwnerAdminsTitle',
    defaultMessage: 'Only the owner manages admins',
    description: 'Title of the only_owner_manages_admins explanation',
  },
  onlyOwnerAdminsBody: {
    id: 'memberRoleControl.onlyOwnerAdminsBody',
    defaultMessage:
      'Granting or revoking Admin is the owner’s alone — an admin who could appoint admins would be an owner in all but name. You can still grant Manager and User.',
    description: 'Body of the only_owner_manages_admins explanation',
  },
  adminRowHint: {
    id: 'memberRoleControl.adminRowHint',
    defaultMessage: 'Only the owner changes this',
    description:
      'Hint on another admin’s row, whose role only the organization owner may change',
  },
  ownerRowHint: {
    id: 'memberRoleControl.ownerRowHint',
    defaultMessage: 'Owner',
    description:
      'Badge on the owner’s row, whose organization role cannot be edited here',
  },
})
