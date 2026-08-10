import { deriveStatusFromProgress } from './progress-status'

describe('deriveStatusFromProgress', () => {
  it('completes at 100 and reopens at 0, mirroring the backend rule', () => {
    expect(deriveStatusFromProgress(100, 'in_progress')).toBe('done')
    expect(deriveStatusFromProgress(0, 'in_progress')).toBe('todo')
  })

  it('starts anything in between — a report at 40% is work under way', () => {
    expect(deriveStatusFromProgress(60, 'in_progress')).toBe('in_progress')
    // Even 5% must start it — a "Pendiente" badge on started work is wrong.
    expect(deriveStatusFromProgress(5, 'todo')).toBe('in_progress')
  })

  it('does not restart a cancelled activity', () => {
    expect(deriveStatusFromProgress(50, 'cancelled')).toBe('cancelled')
  })
})
