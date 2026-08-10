/**
 * Where the wizard opens, and why.
 *
 * Three sources disagree about the current step, and the order between them is
 * the whole rule:
 *
 *   1. **The URL** (`?step=budget`) — the user navigated here. Highest, because
 *      a link, a Back button and a refresh must all land where they say.
 *   2. **The saved step** (`project.review_step`) — the backend's memory of
 *      where this review was left, which is how a review resumed on another
 *      device does not restart. Advisory only.
 *   3. **Derived from the draft's real state** — the fallback when neither of
 *      the above says anything. This is where the *work* starts, not how far
 *      the draft could go: a file that just landed opens on `schedule`, the
 *      step that exists to check what Lennix read.
 *
 * On top of that precedence sits one clamp, and the clamp always wins: a step
 * the draft cannot actually be at is refused, whoever asked for it. A saved
 * `confirm` on a draft whose tray still blocks go-live lands on `schedule`,
 * because `confirm` would show an Activate button that cannot activate.
 */

import { REVIEW_STEPS, type ReviewStep } from '@/types'

export interface ReviewStepInputs {
  /** The raw `?step=` value — anything, including junk. */
  urlStep?: string | null
  /** `project.review_step` as the backend remembers it. */
  savedStep?: ReviewStep | null
  /** The draft carries rows: the file was read. */
  hasTasks: boolean
  /** Blocking exceptions still open in the review tray. */
  blockingExceptions: number
}

export function parseReviewStep(value: unknown): ReviewStep | null {
  return REVIEW_STEPS.includes(value as ReviewStep)
    ? (value as ReviewStep)
    : null
}

/**
 * The furthest station the draft's real state allows.
 *
 * Nothing read yet — nothing to review. Something the tray still blocks — the
 * schedule is where you fix it, and `confirm` would only offer a dead button.
 */
export function furthestReachableStep({
  hasTasks,
  blockingExceptions,
}: Pick<ReviewStepInputs, 'hasTasks' | 'blockingExceptions'>): ReviewStep {
  if (!hasTasks) return 'upload'
  return blockingExceptions > 0 ? 'schedule' : 'confirm'
}

/**
 * The earliest station a draft can be at. Once rows landed, `upload` is a
 * receipt, not a step: the wizard runs from `schedule` to `confirm`.
 */
export function earliestReachableStep({
  hasTasks,
}: Pick<ReviewStepInputs, 'hasTasks'>): ReviewStep {
  return hasTasks ? 'schedule' : 'upload'
}

const clamp = (
  step: ReviewStep,
  furthest: ReviewStep,
  earliest: ReviewStep,
): ReviewStep => {
  const index = REVIEW_STEPS.indexOf(step)
  if (index > REVIEW_STEPS.indexOf(furthest)) return furthest
  return index < REVIEW_STEPS.indexOf(earliest) ? earliest : step
}

/**
 * Where a review with nothing else to go on opens.
 *
 * `schedule` for anything that landed — reading the import is the first thing
 * the user has to do, and dropping them on `confirm` because nothing happens
 * to block it asks them to activate a schedule they have not seen.
 */
function startingStep(inputs: ReviewStepInputs): ReviewStep {
  return inputs.hasTasks ? 'schedule' : 'upload'
}

export function resolveReviewStep(inputs: ReviewStepInputs): ReviewStep {
  const furthest = furthestReachableStep(inputs)
  const earliest = earliestReachableStep(inputs)
  const fromUrl = parseReviewStep(inputs.urlStep)
  if (fromUrl) return clamp(fromUrl, furthest, earliest)

  // A landed draft never *resumes* at upload — the file is already read, and
  // the step exists there only to show what it was.
  const saved = inputs.savedStep
  if (saved) return clamp(saved, furthest, earliest)

  return clamp(startingStep(inputs), furthest, earliest)
}
