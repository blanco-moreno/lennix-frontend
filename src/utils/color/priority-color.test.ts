import { getPriorityColor } from './priority-color'
import { getTaskStatusColor } from './status-color'

describe('getPriorityColor', () => {
  it.each([
    ['critical', 'priority.high'],
    ['high', 'priority.high'],
    ['medium', 'priority.medium'],
    ['low', 'priority.low'],
  ] as const)('paints %s with the %s token', (priority, token) => {
    expect(getPriorityColor(priority)).toEqual({
      bg: 'transparent',
      color: token,
      borderColor: `${token}/40`,
    })
  })

  it('is hollow, where every state badge is a tinted fill', () => {
    // The defect: medium priority was the same orange as "blocked" and high
    // the same red as "delayed", so an attribute of the work was
    // indistinguishable from something happening to it. Hue alone could not
    // separate them — urgency and danger legitimately read warm — so the fill
    // does.
    for (const priority of ['critical', 'high', 'medium', 'low']) {
      expect(getPriorityColor(priority).bg).toBe('transparent')
      expect(getTaskStatusColor('delayed').bg).not.toBe('transparent')
    }
  })

  it('collapses critical and high onto the same top step (one scale, three steps)', () => {
    expect(getPriorityColor('critical')).toEqual(getPriorityColor('high'))
  })

  it('never paints a priority success-green — green means "on track", not "unimportant"', () => {
    for (const priority of ['critical', 'high', 'medium', 'low']) {
      expect(Object.values(getPriorityColor(priority)).join(' ')).not.toMatch(
        /success/,
      )
    }
  })

  it('never collides with the finished, late or unstarted statuses', () => {
    // Whatever the hue, a priority chip must never render identically to a
    // state badge — that is what made urgency and schedule state
    // indistinguishable at a glance.
    const forbidden = (['done', 'delayed', 'todo'] as const).map(
      getTaskStatusColor,
    )
    for (const priority of ['critical', 'high', 'medium', 'low']) {
      expect(forbidden).not.toContainEqual(getPriorityColor(priority))
    }
  })

  it('falls back to muted for a priority it does not recognise', () => {
    expect(getPriorityColor('urgent')).toEqual({
      bg: 'bg.muted',
      color: 'fg.muted',
      borderColor: 'border',
    })
  })
})
