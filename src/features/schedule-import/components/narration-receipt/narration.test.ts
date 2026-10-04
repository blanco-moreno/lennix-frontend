import { mapScheduleReviewStateDTO } from '@/services/schedule-import'
import { seedImportReviewStateDTO } from '@/tests/fixtures'

import { buildNarration } from './narration'

const seededState = () => mapScheduleReviewStateDTO(seedImportReviewStateDTO())

describe('buildNarration', () => {
  it('names the file and the sheet it was read from', () => {
    const state = seededState()
    const narration = buildNarration(state)

    expect(narration.fileName).toBe(state.scheduleImport?.sourceFilename)
    expect(narration.sheet).toBe(state.scheduleImport?.sheet ?? null)
  })

  it('quotes the phase names exactly as the file writes them', () => {
    const state = seededState()
    const narration = buildNarration(state)

    const expected = state.tasks
      .filter((task) => task.subtasks.length > 0)
      .map((task) => task.title)

    expect(narration.phaseNames).toEqual(expected)
  })

  it('speaks levels, not the backend’s depth offset', () => {
    const state = seededState()
    state.stats = { ...state.stats, collapsedRows: 4, maxSourceDepth: 2 }

    expect(buildNarration(state)).toMatchObject({
      collapsedRows: 4,
      maxSourceDepth: 3,
    })
  })

  it('carries the resumed draft’s edit count', () => {
    const state = seededState()
    state.stats = { ...state.stats, editedTasks: 3 }

    expect(buildNarration(state).editedCount).toBe(3)
  })
})
