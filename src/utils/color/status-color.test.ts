import {
  getBlockedBadgeColor,
  getBlockedStatusBadgeColor,
  getCriticalPathBadgeColor,
  getDelayBannerContainerColor,
  getDelayIconColor,
  getDestructiveActionTextColor,
  getForceStartBannerColor,
  getForceStartBannerTextColor,
  getForceStartIconColor,
  getTaskGroupBorderColor,
  getTaskGroupContainerColor,
  getTaskStatusColor,
} from './status-color'

const MUTED = { bg: 'bg.muted', color: 'fg.muted', borderColor: 'border' }

const family = (token: string) => ({
  bg: `${token}/10`,
  color: token,
  borderColor: `${token}/20`,
})

describe('the defect the owner reported: one word, two colours', () => {
  it('has no project-status colour helper left to disagree with the verdict', async () => {
    // `getProjectStatusColor` was how a view reached its own opinion about an
    // obra. Projects paint from `healthTone(project.health.level)` now, and the
    // helper is gone so nothing can quietly go back to judging locally.
    const statusColor = await import('./status-color')
    expect('getProjectStatusColor' in statusColor).toBe(false)
  })

  it('paints a done task green — the one word both domains still share', () => {
    expect(getTaskStatusColor('done')).toEqual(family('success'))
  })

  it('leaves a cancelled activity grey, not red — it is an absence, not an emergency', () => {
    // A decision already taken is not something anybody has to act on, so it
    // does not share the red band with an obra losing days.
    expect(getTaskStatusColor('cancelled')).toEqual(MUTED)
    expect(getTaskStatusColor('cancelled')).not.toEqual(family('critical'))
  })

  it('has exactly one blocked colour, whichever getter asks for it', () => {
    // Two spellings, one state — an orange badge and a grey chip is a bug.
    expect(getBlockedStatusBadgeColor()).toEqual(getBlockedBadgeColor())
    expect(getBlockedBadgeColor()).toEqual(family('warning'))
  })
})

describe('getTaskStatusColor', () => {
  it.each([
    ['done', 'success'],
    ['in_progress', 'info'],
    ['in-progress', 'info'],
    ['delayed', 'delayed'],
    ['overdue', 'delayed'],
  ] as const)('paints a %s task with the %s family', (status, token) => {
    expect(getTaskStatusColor(status)).toEqual(family(token))
  })

  it.each(['todo', 'pending', 'cancelled'] as const)(
    'leaves a %s task grey — no work to do means no signal to give',
    (status) => {
      expect(getTaskStatusColor(status)).toEqual(MUTED)
    },
  )

  it('falls back to muted for a status it does not recognise', () => {
    expect(getTaskStatusColor('paused')).toEqual(MUTED)
  })
})

describe('getTaskGroupBorderColor precedence', () => {
  it('shows the blocked border first even on the critical path, and shows it in amber', () => {
    // Blocked outranks critical on purpose: you cannot work the bar until
    // somebody clears it, so the call to action is "unblock", not "hurry".
    // Grey makes the state disappear on a dense list; amber means exactly
    // "cannot proceed", so it says so.
    expect(
      getTaskGroupBorderColor({ isBlocked: true, isCriticalPath: true }),
    ).toEqual({ borderLeftColor: 'warning' })
  })

  it('paints the critical path critical once nothing blocks it', () => {
    expect(
      getTaskGroupBorderColor({ isBlocked: false, isCriticalPath: true }),
    ).toEqual({ borderLeftColor: 'critical' })
  })

  it('escalates on the first delayed subtask, not at zero', () => {
    expect(getTaskGroupBorderColor({ delayedSubtaskCount: 1 })).toEqual({
      borderLeftColor: 'critical',
    })
    expect(getTaskGroupBorderColor({ delayedSubtaskCount: 0 })).toEqual({
      borderLeftColor: 'primary',
    })
  })

  it('defaults a healthy group to the primary border', () => {
    expect(getTaskGroupBorderColor({})).toEqual({ borderLeftColor: 'primary' })
  })

  it('paints a finished activity green, even on the critical path', () => {
    // The bug this covers: `done` fell through to the fixed navy default, so
    // the row read "Completado" in green beside a colourless tick. The path is
    // a call to hurry and there is nothing left to hurry, so done outranks it.
    expect(
      getTaskGroupBorderColor({ status: 'done', isCriticalPath: true }),
    ).toEqual({ borderLeftColor: 'success' })
  })

  it('reads the rest of the tick off the status vocabulary', () => {
    expect(getTaskGroupBorderColor({ status: 'in_progress' })).toEqual({
      borderLeftColor: 'info',
    })
    expect(getTaskGroupBorderColor({ status: 'todo' })).toEqual({
      borderLeftColor: 'border',
    })
    // Blocked still outranks everything the status could say.
    expect(
      getTaskGroupBorderColor({ status: 'done', isBlocked: true }),
    ).toEqual({ borderLeftColor: 'warning' })
  })
})

describe('fixed badge and surface getters, by family', () => {
  it.each([
    // Warning family: a block is a caution you can still act on.
    ['getBlockedBadgeColor', getBlockedBadgeColor, family('warning')],
    [
      'getBlockedStatusBadgeColor',
      getBlockedStatusBadgeColor,
      family('warning'),
    ],
    [
      'getForceStartBannerColor',
      getForceStartBannerColor,
      { borderColor: 'warning/20', bg: 'warning/5' },
    ],
    [
      'getForceStartBannerTextColor',
      getForceStartBannerTextColor,
      { color: 'warning' },
    ],
    ['getForceStartIconColor', getForceStartIconColor, { color: 'warning' }],
    // Critical family: a materialised delay is not a caution any more.
    [
      'getCriticalPathBadgeColor',
      getCriticalPathBadgeColor,
      { bg: 'critical', color: 'critical.fg', borderColor: 'critical' },
    ],
    [
      'getDelayBannerContainerColor',
      getDelayBannerContainerColor,
      { borderColor: 'critical/20', bg: 'critical/5' },
    ],
    ['getDelayIconColor', getDelayIconColor, { color: 'critical' }],
    [
      'getDestructiveActionTextColor',
      getDestructiveActionTextColor,
      { color: 'destructive', _focus: { color: 'destructive' } },
    ],
  ] as const)('%s returns its fixed family', (_name, fn, expected) => {
    expect(fn()).toEqual(expected)
  })
})

describe('boolean-switched surfaces', () => {
  it('washes out a blocked task group and keeps a live one plain', () => {
    expect(getTaskGroupContainerColor(true)).toEqual({
      borderColor: 'border',
      bg: 'bg.muted/30',
    })
    expect(getTaskGroupContainerColor(false)).toEqual({
      borderColor: 'border',
    })
  })
})
