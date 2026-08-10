import { defineMessages } from 'react-intl'

export const userProfileViewMessages = defineMessages({
  passwordUpdatedToast: {
    id: 'userProfile.passwordUpdatedToast',
    defaultMessage: 'Password updated successfully',
    description: 'Toast shown after the password is updated',
  },
  passwordUpdateErrorToast: {
    id: 'userProfile.passwordUpdateErrorToast',
    defaultMessage: 'Failed to update password',
    description: 'Toast shown when updating the password fails',
  },
  loadError: {
    id: 'userProfile.loadError',
    defaultMessage: 'Could not load profile',
    description: 'Message shown when the profile cannot be loaded',
  },
  title: {
    id: 'userProfile.title',
    defaultMessage: 'My Profile',
    description: 'Page heading for the user profile',
  },
  personalInfo: {
    id: 'userProfile.personalInfo',
    defaultMessage: 'Personal Information',
    description: 'Card title for the personal information section',
  },
  firstName: {
    id: 'userProfile.firstName',
    defaultMessage: 'First name',
    description: 'Label for the first name field',
  },
  lastName: {
    id: 'userProfile.lastName',
    defaultMessage: 'Last name',
    description: 'Label for the last name field',
  },
  email: {
    id: 'userProfile.email',
    defaultMessage: 'Email',
    description: 'Label for the email field',
  },
  phone: {
    id: 'userProfile.phone',
    defaultMessage: 'Phone',
    description: 'Label for the phone field',
  },
  phoneNotRegistered: {
    id: 'userProfile.phoneNotRegistered',
    defaultMessage: 'Not registered',
    description: 'Fallback shown when the user has no phone number',
  },
  role: {
    id: 'userProfile.role',
    defaultMessage: 'Role',
    description: 'Label for the role field',
  },
  status: {
    id: 'userProfile.status',
    defaultMessage: 'Status',
    description: 'Label for the status field',
  },
  active: {
    id: 'userProfile.active',
    defaultMessage: 'Active',
    description: 'Value shown when the user is active',
  },
  inactive: {
    id: 'userProfile.inactive',
    defaultMessage: 'Inactive',
    description: 'Value shown when the user is inactive',
  },
  personalInfoDescription: {
    id: 'userProfile.personalInfoDescription',
    defaultMessage: 'Your account details, as your organization sees them.',
    description: 'Description of the personal information card',
  },
  changePasswordDescription: {
    id: 'userProfile.changePasswordDescription',
    defaultMessage: 'Set a new password for signing in.',
    description: 'Description of the change password card',
  },
  changePassword: {
    id: 'userProfile.changePassword',
    defaultMessage: 'Change Password',
    description: 'Card title for the change password section',
  },
  newPasswordLabel: {
    id: 'userProfile.newPasswordLabel',
    defaultMessage: 'New password',
    description: 'Label for the new password field',
  },
  newPasswordPlaceholder: {
    id: 'userProfile.newPasswordPlaceholder',
    defaultMessage: 'Enter your new password',
    description: 'Placeholder for the new password field',
  },
  updating: {
    id: 'userProfile.updating',
    defaultMessage: 'Updating…',
    description: 'Submit button label while the password update is in flight',
  },
  updatePassword: {
    id: 'userProfile.updatePassword',
    defaultMessage: 'Update Password',
    description: 'Submit button label for the change password form',
  },

  // Account deletion / owner decision
  dangerZoneTitle: {
    id: 'userProfile.dangerZoneTitle',
    defaultMessage: 'Delete account',
    description: 'Title of the destructive account-deletion card',
  },
  dangerZoneDescription: {
    id: 'userProfile.dangerZoneDescription',
    defaultMessage: 'Permanently delete your account. This cannot be undone.',
    description: 'Body copy of the account-deletion card',
  },
  deleteAccountButton: {
    id: 'userProfile.deleteAccountButton',
    defaultMessage: 'Delete my account',
    description: 'Button that opens the account-deletion flow',
  },
  deleteConfirmTitle: {
    id: 'userProfile.deleteConfirmTitle',
    defaultMessage: 'Delete your account?',
    description: 'Title of the plain (non-owner) delete confirmation',
  },
  deleteConfirmBody: {
    id: 'userProfile.deleteConfirmBody',
    defaultMessage:
      'Your account will be deleted and you will be signed out immediately.',
    description: 'Body of the plain delete confirmation',
  },
  deleteConfirmAction: {
    id: 'userProfile.deleteConfirmAction',
    defaultMessage: 'Delete account',
    description: 'Confirm button of the plain delete confirmation',
  },
  cancel: {
    id: 'userProfile.cancel',
    defaultMessage: 'Cancel',
    description: 'Cancel button shared by the deletion modals',
  },
  ownerDecisionTitle: {
    id: 'userProfile.ownerDecisionTitle',
    defaultMessage: 'You own {org}',
    description: 'Title of the owner account-deletion decision modal',
  },
  ownerDecisionBody: {
    id: 'userProfile.ownerDecisionBody',
    defaultMessage:
      'An organization always needs an owner, so your account cannot be deleted while you own one. Choose what should happen to {org} first.',
    description: 'Explanation of the owner-deletion rule',
  },
  ownerDecisionTransferTitle: {
    id: 'userProfile.ownerDecisionTransferTitle',
    defaultMessage: 'Hand it over to someone else',
    description: 'Heading of the transfer option in the owner decision modal',
  },
  ownerDecisionTransferBody: {
    id: 'userProfile.ownerDecisionTransferBody',
    defaultMessage:
      'Transfer ownership to another member in organization settings, then come back and delete your account.',
    description: 'Body of the transfer option in the owner decision modal',
  },
  ownerDecisionTransferAction: {
    id: 'userProfile.ownerDecisionTransferAction',
    defaultMessage: 'Go to transfer ownership',
    description: 'Button that navigates to the transfer-ownership card',
  },
  ownerDecisionDeleteOrgTitle: {
    id: 'userProfile.ownerDecisionDeleteOrgTitle',
    defaultMessage: 'Delete the organization too',
    description: 'Heading of the delete-org option in the owner decision modal',
  },
  ownerDecisionDeleteOrgBody: {
    id: 'userProfile.ownerDecisionDeleteOrgBody',
    defaultMessage:
      '{org}, its projects and everything in them are deleted along with your account. This cannot be undone.',
    description: 'Body of the delete-org option in the owner decision modal',
  },
  ownerDecisionDeleteOrgAction: {
    id: 'userProfile.ownerDecisionDeleteOrgAction',
    defaultMessage: 'Delete organization and account',
    description: 'Button that deletes the org and then the account',
  },
  deleteOrgConfirmTitle: {
    id: 'userProfile.deleteOrgConfirmTitle',
    defaultMessage: 'Delete {org} and your account?',
    description: 'Title of the final delete-org confirmation',
  },
  deleteOrgConfirmBody: {
    id: 'userProfile.deleteOrgConfirmBody',
    defaultMessage:
      'Every project, task and expense in {org} will be destroyed, then your account will be deleted. There is no way back.',
    description: 'Body of the final delete-org confirmation',
  },
  deleteSuccessToast: {
    id: 'userProfile.deleteSuccessToast',
    defaultMessage: 'Your account has been deleted.',
    description: 'Toast shown after the account is deleted',
  },
  deleteErrorToast: {
    id: 'userProfile.deleteErrorToast',
    defaultMessage: 'Could not delete your account. Please try again.',
    description: 'Toast shown when account deletion fails',
  },
  deleteOwnerConflictToast: {
    id: 'userProfile.deleteOwnerConflictToast',
    defaultMessage:
      'You still own an organization — transfer it or delete it first.',
    description:
      'Toast for the backend 409 when an owner tries to delete their account',
  },
  deleteOrgErrorToast: {
    id: 'userProfile.deleteOrgErrorToast',
    defaultMessage: 'Could not delete the organization. Please try again.',
    description: 'Toast shown when deleting the organization fails',
  },
  deleteOrgSucceededAccountFailedToast: {
    id: 'userProfile.deleteOrgSucceededAccountFailedToast',
    defaultMessage:
      '{org} was deleted, but your account could not be. Try deleting your account again.',
    description:
      'Toast for the partial failure where the org is gone but the account survives',
  },
})
