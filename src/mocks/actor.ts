/**
 * Who the mocked API answers as.
 *
 * The handlers are shared by Vitest (`msw/node`) and the e2e worker
 * (`msw/browser`), and e2e needs one thing Vitest never did: the same endpoint
 * answering differently per role. The acting user lives in `localStorage` so a
 * Playwright fixture can plant it before the first navigation and every handler
 * reads it fresh. Unbeknownst to a unit test, the key is absent — the default is
 * Carlos, exactly what the handlers answered before.
 */

import { SEED_IDS, SEED_PROJECTS, SEED_USERS } from '@/tests/seed'

import { MOCK_ACTOR_KEY } from './actor-key'

export { MOCK_ACTOR_KEY }

export function mockActorId(): string {
  if (typeof localStorage === 'undefined') return SEED_IDS.USER_CARLOS_ID
  return localStorage.getItem(MOCK_ACTOR_KEY) ?? SEED_IDS.USER_CARLOS_ID
}

/** `manager` and `user` (role 3 and 5) act only where they are members. */
const SCOPED_ROLE_IDS = new Set([3, 5])

/**
 * The backend's second gate, mirrored here because e2e has no backend: an
 * organization-wide role receives every obra, a scoped one only the obras it
 * belongs to. Nothing in the app narrows rows client-side — this is the server's
 * job, and the mock is standing in for the server.
 */
export function scopeProjectsToActor<T extends { id: string }>(
  items: readonly T[],
): T[] {
  const actorId = mockActorId()
  const roleId = SEED_USERS.find((user) => user.userId === actorId)?.roleId
  if (roleId === undefined || !SCOPED_ROLE_IDS.has(roleId)) return [...items]

  const mine = new Set(
    SEED_PROJECTS.filter(
      (project) =>
        project.managerId === actorId ||
        project.members.some((member) => member.userId === actorId),
    ).map((project) => project.id),
  )
  return items.filter((item) => mine.has(item.id))
}
