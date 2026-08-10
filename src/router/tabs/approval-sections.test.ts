import { resolveApprovalSection } from './approval-sections'

describe('approval sections', () => {
  it('resolves a section the user can open to itself', () => {
    expect(
      resolveApprovalSection('force-start', ['budget', 'force-start']),
    ).toBe('force-start')
  })

  it.each([null, undefined, 'nonsense'])(
    'lands %s on the first available section',
    (raw) => {
      expect(resolveApprovalSection(raw, ['budget', 'force-start'])).toBe(
        'budget',
      )
    },
  )

  it('never opens a section the user cannot decide', () => {
    // A stale link to Budget from someone who only decides force-starts.
    expect(resolveApprovalSection('budget', ['force-start'])).toBe(
      'force-start',
    )
  })

  it('resolves to nothing when the user can open no section', () => {
    expect(resolveApprovalSection('budget', [])).toBeUndefined()
  })
})
