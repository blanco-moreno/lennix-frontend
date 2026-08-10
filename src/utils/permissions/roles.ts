/**
 * Role slugs as they come from the backend `/v1/roles` endpoint.
 * When a new role is added on the backend, update both this map and the
 * permission matrix in `matrix.ts`.
 *
 * One axis, two scopes: `owner` and `admin` act across the whole organization;
 * `manager` and `user` act only on the obras they are members of. The scope is
 * the backend's to enforce — this file only names the roles.
 */

export const ROLE_SLUGS = ['owner', 'admin', 'manager', 'user'] as const

export type RoleSlug = (typeof ROLE_SLUGS)[number]

// Ids 4 and 6 are retired: the migration renamed 1/2/3/5 in place and moved
// their users to `user` (5), so an unknown id resolves to `null` below.
const ROLE_ID_TO_SLUG: Record<number, RoleSlug> = {
  1: 'owner',
  2: 'admin',
  3: 'manager',
  5: 'user',
}

/**
 * Resolve a numeric backend role id to its slug. Returns `null` for
 * unknown ids so callers can decide whether to fall back to the most
 * restrictive role or surface an error.
 */
export function roleIdToSlug(
  roleId: number | null | undefined,
): RoleSlug | null {
  if (roleId === null || roleId === undefined) return null
  return ROLE_ID_TO_SLUG[roleId] ?? null
}
