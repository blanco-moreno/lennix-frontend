import { makeStore } from '@/stores'
import { setUser } from '@/stores/slices/auth-slice'
import { SEED_IDS } from '@/tests/seed'

import { seedUserDTO } from './fixtures'

/** A store signed in as a seeded user — the owner unless told otherwise. */
export function signedInStore(userId: string = SEED_IDS.USER_CARLOS_ID) {
  const dto = seedUserDTO(userId)
  const store = makeStore()
  store.dispatch(
    setUser({
      userId: dto.user_id,
      email: dto.email,
      firstName: dto.first_name,
      lastName: dto.last_name,
      phone: dto.phone,
      isActive: dto.is_active,
      planId: dto.plan_id,
      roleId: dto.role_id,
      organizationId: dto.organization_id,
    }),
  )
  return store
}
