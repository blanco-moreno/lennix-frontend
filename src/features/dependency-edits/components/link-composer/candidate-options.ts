/**
 * Turns the rule's verdicts into picker rows: the reason a row is refused, in
 * the reader's language, and the dates that tell two same-named activities
 * apart.
 *
 * A refused row is kept and disabled rather than dropped. Hiding it sends
 * someone who knows the activity exists hunting for a name that is simply not
 * there; the reason, read at the moment of choosing, is what teaches the shape
 * of the graph.
 */

import type { IntlShape } from 'react-intl'

import type { SelectOption } from '@/theme/recipes/select.recipe'
import { parseDateValue, type LinkCandidate } from '@/utils'

import { dependencyEditorMessages as m } from '../../dependency-editor-messages'

export interface CandidateOption extends SelectOption {
  /** Why it cannot be linked, already translated. `null` when it can. */
  reason: string | null
  /** When it runs, shown when there is no reason to show instead. */
  when: string | null
  /**
   * Refused because the two rows live at different levels of the WBS. These are
   * the bulk of a big project and say nothing about the graph, so the composer
   * keeps them folded away until asked — or until a search reaches for one.
   */
  offLevel: boolean
}

/** A row, in the two fields the reason and the dates need. */
export interface CandidateRowMeta {
  parentId: string | null
  startDate: string | null
  dueDate: string | null
}

function formatWhen(intl: IntlShape, row: CandidateRowMeta): string | null {
  const start = row.startDate ? parseDateValue(row.startDate) : null
  const due = row.dueDate ? parseDateValue(row.dueDate) : null
  const short = (value: Date) =>
    intl.formatDate(value, { day: 'numeric', month: 'short' })
  if (start && due) return `${short(start)} – ${short(due)}`
  if (start) return short(start)
  if (due) return short(due)
  return null
}

export function buildCandidateOptions({
  candidates,
  rows,
  pivot,
  direction,
  intl,
}: {
  candidates: LinkCandidate[]
  rows: Map<string, CandidateRowMeta>
  pivot: CandidateRowMeta
  direction: 'upstream' | 'downstream'
  intl: IntlShape
}): CandidateOption[] {
  return candidates.flatMap((candidate) => {
    const row = rows.get(candidate.id)
    if (!row) return []
    const { reason } = candidate.verdict

    let text: string | null = null
    let offLevel = false
    if (reason === 'duplicate') {
      text = intl.formatMessage(m.reasonDuplicate)
    } else if (reason === 'cycle') {
      text = candidate.via
        ? intl.formatMessage(m.reasonCycleVia, { row: candidate.via })
        : intl.formatMessage(
            direction === 'upstream'
              ? m.reasonInverseUpstream
              : m.reasonInverseDownstream,
          )
    } else if (reason === 'pairing') {
      offLevel = true
      text = intl.formatMessage(
        !pivot.parentId && row.parentId
          ? m.reasonIsSubtask
          : pivot.parentId && !row.parentId
            ? m.reasonIsPhase
            : m.reasonOtherPhase,
      )
    }

    return [
      {
        value: candidate.id,
        label: candidate.title,
        disabled: !candidate.verdict.ok,
        reason: text,
        when: formatWhen(intl, row),
        offLevel,
      },
    ]
  })
}
