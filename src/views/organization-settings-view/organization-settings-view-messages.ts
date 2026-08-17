import { defineMessages } from 'react-intl'

export const organizationSettingsViewMessages = defineMessages({
  createSuccessToast: {
    id: 'organization.createSuccessToast',
    defaultMessage: 'Organization created. Refresh to see the changes.',
    description: 'Toast shown after an organization is created',
  },
  createErrorToast: {
    id: 'organization.createErrorToast',
    defaultMessage: 'Failed to create the organization',
    description: 'Toast shown when creating an organization fails',
  },
  loading: {
    id: 'organization.loading',
    defaultMessage: 'Loading organization…',
    description: 'Loading state while the organization is fetched',
  },
  createTitle: {
    id: 'organization.createTitle',
    defaultMessage: 'Create Organization',
    description: 'Heading and submit button for the create organization form',
  },
  creating: {
    id: 'organization.creating',
    defaultMessage: 'Creating…',
    description: 'Create button label while the request is in flight',
  },
  newOrgCardTitle: {
    id: 'organization.newOrgCardTitle',
    defaultMessage: 'New Organization',
    description: 'Title of the create organization card',
  },
  newOrgCardDescription: {
    id: 'organization.newOrgCardDescription',
    defaultMessage:
      "You don't have an organization. Create one to start managing projects.",
    description: 'Description of the create organization card',
  },
  nameLabel: {
    id: 'organization.nameLabel',
    defaultMessage: 'Name',
    description: 'Label for the organization name field',
  },
  namePlaceholder: {
    id: 'organization.namePlaceholder',
    defaultMessage: 'My Organization',
    description: 'Placeholder for the organization name field',
  },
  slugLabel: {
    id: 'organization.slugLabel',
    defaultMessage: 'Slug',
    description: 'Label for the organization slug field',
  },
  slugPlaceholder: {
    id: 'organization.slugPlaceholder',
    defaultMessage: 'my-organization',
    description: 'Placeholder for the organization slug field',
  },
  slugDescription: {
    id: 'organization.slugDescription',
    defaultMessage: 'Unique identifier for URLs.',
    description: 'Helper text for the organization slug field',
  },
  unlimited: {
    id: 'organization.unlimited',
    defaultMessage: 'Unlimited',
    description: 'Value shown for a limit with no maximum',
  },
  title: {
    id: 'organization.title',
    defaultMessage: 'Organization',
    description: 'Page heading for the organization settings screen',
  },
  nameCardTitle: {
    id: 'organization.nameCardTitle',
    defaultMessage: 'Organization Name',
    description: 'Title of the organization name card',
  },
  nameCardDescription: {
    id: 'organization.nameCardDescription',
    defaultMessage: 'General information about your organization.',
    description: 'Description of the organization name card',
  },
  customPlanBadge: {
    id: 'organization.customPlanBadge',
    defaultMessage: 'Custom',
    description: 'Badge shown when the limits come from per-org overrides',
  },
  planLabel: {
    id: 'organization.planLabel',
    defaultMessage: 'Plan',
    description: 'Label for the current plan name',
  },
  storage: {
    id: 'organization.storage',
    defaultMessage: 'Storage',
    description: 'Label for the storage limit',
  },
  planUsageTitle: {
    id: 'organization.planUsageTitle',
    defaultMessage: 'Plan usage',
    description: 'Heading above the four plan-usage meters in settings',
  },
  upgradeToPro: {
    id: 'organization.upgradeToPro',
    defaultMessage:
      'You are running out of room on Basic. Pro raises every limit.',
    description: 'Upgrade notice shown to a Basic organization near its caps',
  },
  upgradeToEnterprise: {
    id: 'organization.upgradeToEnterprise',
    defaultMessage:
      'You are running out of room on Pro. Enterprise raises every limit.',
    description: 'Upgrade notice shown to a Pro organization near its caps',
  },

  // Ownership transfer
  transferCardTitle: {
    id: 'organization.transferCardTitle',
    defaultMessage: 'Transfer ownership',
    description: 'Title of the owner-only transfer-ownership card',
  },
  transferCardDescription: {
    id: 'organization.transferCardDescription',
    defaultMessage:
      'Hand the organization over to another member. Admin rights move with ownership: the new owner becomes an Admin and you are demoted to a regular member. This cannot be undone by you.',
    description: 'Explanatory copy for the transfer-ownership card',
  },
  transferCurrentOwner: {
    id: 'organization.transferCurrentOwner',
    defaultMessage: 'Current owner',
    description: 'Label above the current owner name',
  },
  transferSelectLabel: {
    id: 'organization.transferSelectLabel',
    defaultMessage: 'New owner',
    description: 'Label for the member picker in the transfer flow',
  },
  transferSelectPlaceholder: {
    id: 'organization.transferSelectPlaceholder',
    defaultMessage: 'Select a member…',
    description: 'Placeholder for the new-owner picker',
  },
  transferNoCandidates: {
    id: 'organization.transferNoCandidates',
    defaultMessage:
      'There is nobody to transfer to — invite another member first.',
    description: 'Shown when the owner is the only member of the organization',
  },
  transferButton: {
    id: 'organization.transferButton',
    defaultMessage: 'Transfer ownership',
    description: 'Button that opens the transfer confirmation',
  },
  transferConfirmTitle: {
    id: 'organization.transferConfirmTitle',
    defaultMessage: 'Transfer ownership?',
    description: 'Title of the transfer confirmation modal',
  },
  transferConfirmBody: {
    id: 'organization.transferConfirmBody',
    defaultMessage:
      '{name} will become the owner and Admin of {org}. You will keep access as a regular member.',
    description: 'Body of the transfer confirmation modal',
  },
  transferConfirmAction: {
    id: 'organization.transferConfirmAction',
    defaultMessage: 'Yes, transfer',
    description: 'Confirm button of the transfer modal',
  },
  transferCancel: {
    id: 'organization.transferCancel',
    defaultMessage: 'Cancel',
    description: 'Cancel button of the transfer modal',
  },
  transferSuccessToast: {
    id: 'organization.transferSuccessToast',
    defaultMessage: 'Ownership transferred to {name}.',
    description: 'Toast shown after a successful ownership transfer',
  },
  transferErrorToast: {
    id: 'organization.transferErrorToast',
    defaultMessage: 'Could not transfer ownership. Please try again.',
    description: 'Toast shown when the transfer request fails',
  },
})
