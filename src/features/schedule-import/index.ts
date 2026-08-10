/**
 * The schedule-import feature — one home for the wedge flow.
 *
 * upload → narration receipt → the schedule you land on → review it → Activate,
 * plus the quality-floor divert. This folder is the only import surface.
 * Corrections split by nature and never overlap: the tray answers what the
 * parser could not resolve, the ledger reverses what it decided, and the
 * canvas floor is under both.
 */

export { ImportUploadCanvas } from './components/import-upload-canvas'
export { DraftReviewCanvas } from './components/draft-review-canvas'
export { AssistedMapping } from './components/assisted-mapping'
