/**
 * The four roles, named in the user's language — the backend's `/v1/roles` names
 * are English reference data, not copy. A `Record` over `RoleSlug`, so a role
 * added to the matrix is a type error here rather than a blank label.
 */

import { defineMessages, type MessageDescriptor } from 'react-intl'

import type { RoleSlug } from './roles'

export const systemRoleMessages: Record<RoleSlug, MessageDescriptor> =
  defineMessages({
    owner: {
      id: 'systemRole.owner',
      defaultMessage: 'Owner',
      description: 'System role: owner',
    },
    admin: {
      id: 'systemRole.admin',
      defaultMessage: 'Admin',
      description: 'System role: admin',
    },
    manager: {
      id: 'systemRole.manager',
      defaultMessage: 'Manager',
      description: 'System role: manager',
    },
    user: {
      id: 'systemRole.user',
      defaultMessage: 'User',
      description: 'System role: user',
    },
  }) as Record<RoleSlug, MessageDescriptor>

/**
 * The **scope** of each role in one line: what it reaches, and what it has to
 * ask for. One `Record` over every slug, so the grant dialog (which indexes it
 * by the value being granted) and the team view's legend (which walks all four)
 * read the same sentence — a role cannot be described two ways.
 *
 * `owner` is here for the legend only: it is never an option in a grant dialog,
 * because it moves solely by transferring ownership.
 */
export const systemRoleHelpMessages: Record<RoleSlug, MessageDescriptor> =
  defineMessages({
    owner: {
      id: 'systemRoleHelp.owner',
      defaultMessage:
        'The whole organization, and only one person holds it: their role cannot be changed, and they alone transfer ownership or grant and revoke Admin.',
      description: 'Help text for the owner role',
    },
    admin: {
      id: 'systemRoleHelp.admin',
      defaultMessage:
        'The whole organization: sees every obra, decides the approval requests and manages the settings and the team.',
      description: 'Help text for the admin role',
    },
    manager: {
      id: 'systemRoleHelp.manager',
      defaultMessage:
        'Only the obras they belong to: creates them, decides their approval requests and manages their team.',
      description: 'Help text for the manager role',
    },
    user: {
      id: 'systemRoleHelp.user',
      defaultMessage:
        'Only the obras they belong to, and changing a budget or force-starting an activity goes through an approval request. The default for a new account.',
      description: 'Help text for the user role',
    },
  }) as Record<RoleSlug, MessageDescriptor>
