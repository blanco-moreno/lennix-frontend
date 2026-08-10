/**
 * The four system roles, played by the seed's own people.
 *
 * The names are the role slugs of `docs/PRODUCT.md` §6, capitalised, so a
 * feature file reads like the rule it pins. Fernando is the `user` on purpose:
 * he is the requestor of the seed's force-start request, which is what makes
 * the "my requests" inbox show a row instead of an empty state.
 */

import { SEED_IDS, SEED_PROJECTS, SEED_USERS } from '../../src/tests/seed'

export const ROLE_ACTORS = {
  Owner: SEED_IDS.USER_CARLOS_ID,
  Admin: SEED_IDS.USER_ANA_ID,
  Manager: SEED_IDS.USER_MIGUEL_ID,
  User: SEED_IDS.USER_FERNANDO_ID,
} as const

export type RoleName = keyof typeof ROLE_ACTORS

export function actorIdFor(role: string): string {
  const actorId = ROLE_ACTORS[role as RoleName]
  if (!actorId) {
    throw new Error(
      `Unknown role "${role}". Use one of: ${Object.keys(ROLE_ACTORS).join(', ')}`,
    )
  }
  return actorId
}

/** Whether the role acts organization-wide (`owner`/`admin`) or by membership. */
export function isOrganizationWide(role: string): boolean {
  const roleId = SEED_USERS.find(
    (user) => user.userId === actorIdFor(role),
  )?.roleId
  return roleId === 1 || roleId === 2
}

/** The live projects this role is served — the same narrowing the backend does. */
export function visibleProjectNames(role: string): string[] {
  const actorId = actorIdFor(role)
  return SEED_PROJECTS.filter((project) => !project.isDraft)
    .filter(
      (project) =>
        isOrganizationWide(role) ||
        project.managerId === actorId ||
        project.members.some((member) => member.userId === actorId),
    )
    .map((project) => project.name)
}

/** Obras this role must not be served. Empty for an organization-wide role. */
export function hiddenProjectNames(role: string): string[] {
  const visible = new Set(visibleProjectNames(role))
  return SEED_PROJECTS.filter(
    (project) => !project.isDraft && !visible.has(project.name),
  ).map((project) => project.name)
}
