import { PATHS } from '@/constants'

import { resolveProjectDestination } from './project-destination'

const PROJECT_ID = 'b0000000-0000-0007-0000-000000000000'

describe('resolveProjectDestination (V2)', () => {
  it('sends a draft to its own resumable review canvas', () => {
    expect(resolveProjectDestination({ id: PROJECT_ID, isDraft: true })).toBe(
      `/drafts/${PROJECT_ID}/review`,
    )
  })

  it('never sends a draft to project-detail — the bug this fixes', () => {
    const destination = resolveProjectDestination({
      id: PROJECT_ID,
      isDraft: true,
    })

    expect(destination).not.toBe(
      PATHS.PROJECT_DETAIL.replace(':projectId', PROJECT_ID),
    )
  })

  it('sends a live project to its detail screen', () => {
    expect(resolveProjectDestination({ id: PROJECT_ID, isDraft: false })).toBe(
      `/projects/${PROJECT_ID}`,
    )
  })
})
