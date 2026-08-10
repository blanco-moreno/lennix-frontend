/**
 * Per-draft localStorage journal for the review decisions the backend has no
 * state for: discarding an unplaced row, and which rows the date flip rewrote.
 */

import { useCallback, useState } from 'react'

import { LOCAL_STORAGE_KEYS } from '@/constants'

const STORAGE_KEY = LOCAL_STORAGE_KEYS.REVIEW_JOURNAL

export interface ReviewJournal {
  /** `sheet:row` ids of unclassified rows the user threw away. */
  discardedRows: string[]
  /**
   * `column:rowId` keys the date flip itself rewrote — without them the flip
   * would treat its own edits as user pins and refuse to undo itself.
   */
  flippedRows: string[]
}

export const EMPTY_REVIEW_JOURNAL: ReviewJournal = {
  discardedRows: [],
  flippedRows: [],
}

type JournalStore = Record<string, ReviewJournal>

/** A corrupt or unavailable store is not an error the user should ever see. */
function readStore(): JournalStore {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed: unknown = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? (parsed as JournalStore) : {}
  } catch {
    return {}
  }
}

function writeStore(store: JournalStore): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch {
    // A full or disabled storage costs the user a repeated question, never the
    // review itself — the schedule lives on the server.
  }
}

export function readReviewJournal(projectId: string): ReviewJournal {
  const entry = readStore()[projectId]
  return {
    discardedRows: [...(entry?.discardedRows ?? [])],
    flippedRows: [...(entry?.flippedRows ?? [])],
  }
}

function append(
  projectId: string,
  key: keyof ReviewJournal,
  value: string,
): ReviewJournal {
  const current = readReviewJournal(projectId)
  if (current[key].includes(value)) return current

  const next: ReviewJournal = { ...current, [key]: [...current[key], value] }
  writeStore({ ...readStore(), [projectId]: next })
  return next
}

export function discardRow(projectId: string, rowId: string): ReviewJournal {
  return append(projectId, 'discardedRows', rowId)
}

/**
 * Flip ownership toggles: writing a column marks its rows, reading it back the
 * original way clears them — so a hand edit made afterwards pins the row again.
 */
export function toggleFlippedRows(
  projectId: string,
  keys: string[],
): ReviewJournal {
  const current = readReviewJournal(projectId)
  const flipped = new Set(current.flippedRows)
  for (const key of keys) {
    if (flipped.has(key)) flipped.delete(key)
    else flipped.add(key)
  }

  const next: ReviewJournal = { ...current, flippedRows: [...flipped] }
  writeStore({ ...readStore(), [projectId]: next })
  return next
}

export interface ReviewJournalActions {
  discardRow: (rowId: string) => void
  toggleFlipped: (keys: string[]) => void
}

/** The journal as React state, so a decision re-renders the tray at once. */
export function useReviewJournal(
  projectId: string,
): [ReviewJournal, ReviewJournalActions] {
  const [journal, setJournal] = useState(() => readReviewJournal(projectId))

  const actions: ReviewJournalActions = {
    discardRow: useCallback(
      (rowId: string) => setJournal(discardRow(projectId, rowId)),
      [projectId],
    ),
    toggleFlipped: useCallback(
      (keys: string[]) => setJournal(toggleFlippedRows(projectId, keys)),
      [projectId],
    ),
  }

  return [journal, actions]
}
