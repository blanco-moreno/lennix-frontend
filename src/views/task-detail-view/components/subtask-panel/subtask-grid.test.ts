import { SUBTASK_GRID_COLUMNS } from './subtask-grid'

describe('SUBTASK_GRID_COLUMNS', () => {
  it('stacks into one column on a phone and lays out seven above', () => {
    expect(SUBTASK_GRID_COLUMNS.base).toBe('minmax(0, 1fr)')
    expect(SUBTASK_GRID_COLUMNS.lg.split('minmax').length - 1).toBe(6)
    expect(SUBTASK_GRID_COLUMNS.lg.endsWith(' 7.5rem')).toBe(true)
  })
})
