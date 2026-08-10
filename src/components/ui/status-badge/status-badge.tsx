import type { ReactNode } from 'react'
import { useIntl } from 'react-intl'

import {
  approvalTone,
  healthKey,
  healthMessages,
  healthTone,
  priorityKey,
  priorityMessages,
  priorityVariant,
  statusKey,
  statusMessages,
  statusTone,
  toneVariant,
  type SemanticTone,
} from '@/utils'

import { Badge } from '../badge'

export interface StatusBadgeProps {
  /**
   * Which vocabulary `value` belongs to. It decides the tone — the same
   * string means different things as a work status and as a decision
   * someone is waiting on.
   *
   * `health` is a **project's** verdict, already decided by the server; `status`
   * is an activity's own state. A project must never be passed as `status`:
   * that was how each view came to judge an obra for itself.
   */
  domain: 'health' | 'status' | 'priority' | 'approval'
  value: string
  /**
   * Wording, when the caller owns better words than the generic catalog.
   *
   * Approvals need this: their states read as "Approved"/"Rejected" and, on
   * a force-start request, as a whole sentence. Centralising the COLOUR of a
   * state is the point here; centralising its copy would flatten wording the
   * surfaces earned. Omitted, `status` and `priority` label themselves.
   */
  label?: ReactNode
  'data-testid'?: string
}

/**
 * A state badge coloured from the single tone system.
 *
 * Every inline `status === 'x' ? 'success' : ...` ternary in the app is
 * meant to become one of these: the colour of a state is not a decision a
 * view gets to make on its own.
 *
 * The state is always a word, at every width. Colour alone is a legend the
 * reader has to have learnt, and a listing whose states are readable is what
 * makes filtering by one of them worth doing — a phone row grows taller for
 * it rather than trading the word for a dot.
 */
export function StatusBadge({
  domain,
  value,
  label,
  'data-testid': testId,
}: StatusBadgeProps) {
  const intl = useIntl()

  // Priority does not resolve through the tone system at all: it is an
  // attribute of the work, not something happening to it, so it gets its own
  // hollow register instead of competing with the state palette.
  const tone: SemanticTone =
    domain === 'health'
      ? healthTone(value)
      : domain === 'approval'
        ? approvalTone(value)
        : statusTone(value)

  const variant =
    domain === 'priority' ? priorityVariant(value) : toneVariant(tone)

  const catalogText = intl.formatMessage(
    domain === 'priority'
      ? priorityMessages[priorityKey(value)]
      : domain === 'health'
        ? healthMessages[healthKey(value)]
        : statusMessages[statusKey(value)],
  )

  const text = label ?? catalogText

  return (
    <Badge variant={variant} data-testid={testId}>
      {text}
    </Badge>
  )
}
