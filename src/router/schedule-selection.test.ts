import {
  SCHEDULE_TASK_PARAM,
  resolveScheduleSelection,
} from './schedule-selection'

const rows = [{ id: 'phase-1' }, { id: 'activity-7' }]

describe('schedule selection', () => {
  it('reads the selection from ?task=', () => {
    expect(SCHEDULE_TASK_PARAM).toBe('task')
    expect(resolveScheduleSelection('activity-7', rows)).toBe('activity-7')
  })

  it('selects nothing when the param is absent or empty', () => {
    expect(resolveScheduleSelection(null, rows)).toBeNull()
    expect(resolveScheduleSelection(undefined, rows)).toBeNull()
    expect(resolveScheduleSelection('', rows)).toBeNull()
  })

  it('paints nothing for a row this schedule does not have', () => {
    expect(resolveScheduleSelection('from-another-project', rows)).toBeNull()
    expect(resolveScheduleSelection('activity-7', [])).toBeNull()
  })

  it('resolves a phase as readily as an activity', () => {
    expect(resolveScheduleSelection('phase-1', rows)).toBe('phase-1')
  })
})
