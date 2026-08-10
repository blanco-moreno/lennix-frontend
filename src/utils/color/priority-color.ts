import type { ColorStyle } from './color-style'
import { priorityStyle } from './semantic-tone'

/**
 * Urgency → style props. Resolves through `semantic-tone.ts` so priority and
 * work status can never drift into meaning the same thing by accident — they
 * are now separated by fill, not only by hue.
 */
export function getPriorityColor(priority: string): ColorStyle {
  return priorityStyle(priority)
}
