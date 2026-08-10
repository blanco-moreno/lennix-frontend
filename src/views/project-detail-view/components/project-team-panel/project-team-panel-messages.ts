import { defineMessages } from 'react-intl'

/** Catalog for the project team panel — wording only it renders. */
export const projectTeamPanelMessages = defineMessages({
  // Assignment only; the org roster is managed in Settings › Team.
  teamHeading: {
    id: 'projectDetail.teamHeading',
    defaultMessage: 'Project team ({count})',
    description: 'Heading of the team panel with the member count',
  },
  teamScopeCaption: {
    id: 'projectDetail.teamScopeCaption',
    defaultMessage:
      'Who is assigned to this project. People are created and removed once, in the organization roster.',
    description:
      'Caption that scopes the project team panel against the org roster',
  },
  teamRosterLink: {
    id: 'projectDetail.teamRosterLink',
    defaultMessage: 'Open the organization roster',
    description: 'Link from the project team panel to Settings › Team',
  },
  addMemberButton: {
    id: 'projectDetail.addMemberButton',
    defaultMessage: 'Assign member',
    description: 'Button in the team panel to open the assign-member modal',
  },
  teamLoadError: {
    id: 'projectDetail.teamLoadError',
    defaultMessage: 'Could not load the team.',
    description: 'Error state when the team query fails',
  },
  noTeamMembers: {
    id: 'projectDetail.noTeamMembers',
    defaultMessage:
      'Nobody is assigned to this project yet. Assign the first one using the button above.',
    description: 'Empty state of the team panel',
  },
  columnMember: {
    id: 'projectDetail.columnMember',
    defaultMessage: 'Member',
    description: 'Team table column header: member',
  },
  columnJoinedAt: {
    id: 'projectDetail.columnJoinedAt',
    defaultMessage: 'Member since',
    description: 'Team table column header: joined at',
  },
  managerBadge: {
    id: 'projectDetail.managerBadge',
    // "Project manager", not "Manager": `manager` is also the name of a system
    // role, and this badge marks the one member who leads *this* obra — a
    // per-obra field any role can be named to.
    defaultMessage: 'Project manager',
    description:
      'Label on the team row that leads the project. A label, never a control — leadership is handed over from the project form',
  },
  unnamedUser: {
    id: 'projectDetail.unnamedUser',
    defaultMessage: 'Unnamed user',
    description: 'Fallback when a team member has no name',
  },
  removeDialogTitle: {
    id: 'projectDetail.removeDialogTitle',
    defaultMessage: 'Remove from project',
    description: 'Title of the unassign-member confirmation dialog',
  },
  removeDialogDescription: {
    id: 'projectDetail.removeDialogDescription',
    defaultMessage:
      'Remove this member from the project? They stay in the organization roster and can be assigned again.',
    description: 'Body of the unassign-member confirmation dialog',
  },
  removeButton: {
    id: 'projectDetail.removeButton',
    defaultMessage: 'Remove from project',
    description: 'Confirm button in the unassign-member dialog',
  },
  removeMemberSuccess: {
    id: 'projectDetail.removeMemberSuccess',
    defaultMessage: 'Member removed from the project',
    description: 'Toast after removing a team member',
  },
  removeMemberError: {
    id: 'projectDetail.removeMemberError',
    defaultMessage: 'Could not remove the member',
    description: 'Toast when removing a team member fails',
  },
})
