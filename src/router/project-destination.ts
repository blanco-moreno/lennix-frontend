/**
 * Where a project card goes when it is clicked — decided in one place, so a
 * draft can only ever open its own resumable review canvas.
 */

import { buildDraftReviewPath, buildProjectDetailPath } from './router-utils'

export interface ProjectDestinationInput {
  id: string
  isDraft: boolean
}

export function resolveProjectDestination({
  id,
  isDraft,
}: ProjectDestinationInput): string {
  return isDraft ? buildDraftReviewPath(id) : buildProjectDetailPath(id)
}
