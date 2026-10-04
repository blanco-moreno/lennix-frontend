/**
 * What the schedule card's header says about the file, derived from the
 * draft's own review state: which file and sheet, the section names quoted
 * verbatim, what the two-level model flattened and what the user already
 * edited. The counts and the span are `ScheduleFacts`', not repeated here.
 */

import type { ScheduleReviewState, SheetEvidence } from '@/types'

export interface ImportNarration {
  fileName: string | null
  sheet: string | null
  /**
   * Why that sheet won, as facts — the header turns it into a sentence with
   * `useTrustCopy`. The contract's own `sheetReason` is English prose and is
   * never rendered.
   */
  sheetEvidence: SheetEvidence
  /** Section names exactly as the file writes them (never re-titled). */
  phaseNames: string[]
  /** Rows the user already corrected — what makes a resumed draft honest. */
  editedCount: number
  /** Subtasks the 2-level model flattened from a deeper source hierarchy. */
  collapsedRows: number
  /** Levels the file nested, counting the phase — 2 is what the project keeps. */
  maxSourceDepth: number
}

export function buildNarration(state: ScheduleReviewState): ImportNarration {
  return {
    fileName: state.scheduleImport?.sourceFilename ?? null,
    sheet: state.scheduleImport?.sheet ?? null,
    sheetEvidence: state.report.sheetEvidence,
    phaseNames: state.tasks
      .filter((task) => task.subtasks.length > 0)
      .map((task) => task.title),
    editedCount: state.stats.editedTasks,
    collapsedRows: state.stats.collapsedRows,
    // The backend counts depth BELOW the phase, so a grandchild is 2 and the
    // file itself nests 3. The header speaks levels, not offsets.
    maxSourceDepth: state.stats.maxSourceDepth + 1,
  }
}
