/**
 * Progress colour answers schedule health, not percentage.
 *
 * The two cases the owner reported open the file deliberately: they are the
 * defect, stated as behaviour.
 */

import {
  getProgressBadgeColor,
  getProgressColor,
  getProjectProgressColor,
  resolveProgressHealth,
  type ProgressHealthInput,
} from './progress-color'
import { getTaskStatusColor } from './status-color'

/** An activity that is moving and on schedule. */
function activity(
  over: Partial<ProgressHealthInput> = {},
): ProgressHealthInput {
  return {
    status: 'in_progress',
    progress: 50,
    delayDays: 0,
    isBlocked: false,
    atRisk: false,
    ...over,
  }
}

describe("a project's bar answers to the server, and to nothing else", () => {
  it('paints an obra at 65% and on schedule blue, not amber', () => {
    // "a veces está en amarillo" — a percentage-only ladder warned about a
    // perfectly healthy obra. The percentage is not the question; the verdict is.
    expect(getProjectProgressColor('on_track')).toEqual({ bg: 'info' })
  })

  it('paints every urgent verdict red, however far along the obra is', () => {
    // The more dangerous half of the old bug: a percentage ladder called
    // anything over 80% a success no matter how far behind it was.
    for (const level of ['delayed', 'critical', 'overdue', 'over_budget']) {
      expect(getProjectProgressColor(level)).toEqual({ bg: 'critical' })
    }
  })

  it('gives a draft and an archived obra no bar colour at all', () => {
    // Neither is running, so neither has schedule health to report. A
    // coloured bar would be an empty claim.
    expect(getProjectProgressColor('draft')).toEqual({})
    expect(getProjectProgressColor('archived')).toEqual({})
  })

  it('falls back to no colour for a level this client does not know', () => {
    expect(getProjectProgressColor('teleported')).toEqual({})
  })
})

describe('the bar agrees with the badge beside it', () => {
  it('gives a late bar the same token as a delayed status badge', () => {
    // The regression: `delayDays > 0` drew a red bar under an amber badge, so
    // one row said two things about the same slip.
    expect(getProgressColor('late').bg).toBe(
      getTaskStatusColor('delayed').color,
    )
    expect(getProgressBadgeColor('late')).toEqual(getTaskStatusColor('delayed'))
  })

  it('gives an on-time bar the same token as a done activity badge', () => {
    expect(getProgressColor('on_time').bg).toBe(
      getTaskStatusColor('done').color,
    )
    expect(getProgressBadgeColor('on_time')).toEqual(getTaskStatusColor('done'))
  })
})

describe('resolveProgressHealth', () => {
  it('reads a slip as late whatever the percentage says', () => {
    expect(
      resolveProgressHealth(activity({ progress: 95, delayDays: 21 })),
    ).toBe('late')
  })

  it('reads a block as late — a bar has no words to distinguish the two', () => {
    // The badge keeps `blocked` and `delayed` apart because it can label them.
    expect(resolveProgressHealth(activity({ isBlocked: true }))).toBe('late')
  })

  it('treats at-risk provenance as trouble, ranking it above a plain slip', () => {
    // `atRisk` is provenance of an approved force-start and never
    // self-clears — it is NOT a slip, and it is here only because
    // `resolveTaskScheduleState` already ranks it above one.
    expect(
      resolveProgressHealth(activity({ atRisk: true, delayDays: 0 })),
    ).toBe('late')
  })

  it('gives an untouched activity no colour at all', () => {
    const health = resolveProgressHealth(
      activity({ status: 'todo', progress: 0 }),
    )
    expect(health).toBe('pending')
    // No `bg` key, not a muted one: a coloured bar at zero width claims nothing.
    expect(getProgressColor(health)).toEqual({})
  })

  it('counts a finished activity as on time even at zero progress', () => {
    expect(
      resolveProgressHealth(activity({ status: 'done', progress: 0 })),
    ).toBe('on_time')
  })
})

describe('one ladder, two registers', () => {
  it.each([
    ['late', 'delayed'],
    ['on_time', 'success'],
  ] as const)('the badge tints the bar own token on %s', (health, token) => {
    expect(getProgressColor(health)).toEqual({ bg: token })
    expect(getProgressBadgeColor(health)).toEqual({
      bg: `${token}/10`,
      color: token,
      borderColor: `${token}/20`,
    })
  })

  it('drops the bar entirely on pending while the badge still renders grey', () => {
    // A badge always occupies its box, so it needs a fill; a zero-width bar
    // does not, and colouring one would claim progress that has not happened.
    expect(getProgressColor('pending')).toEqual({})
    expect(getProgressBadgeColor('pending')).toEqual({
      bg: 'bg.muted',
      color: 'fg.muted',
      borderColor: 'border',
    })
  })

  it('never returns the brand accent, which is what made healthy read as warning', () => {
    const all = (['late', 'on_time', 'pending'] as const).flatMap((h) => [
      ...Object.values(getProgressColor(h)),
      ...Object.values(getProgressBadgeColor(h)),
    ])
    expect(all.join(' ')).not.toMatch(/complementary|warning|info/)
  })
})
