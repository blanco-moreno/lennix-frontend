/**
 * The tone table is the single source of truth for state colour, so this file
 * pins the table itself: which words map to which tone, and what a tone paints.
 * Every other colour test leans on these answers.
 */

import {
  approvalTone,
  healthTone,
  priorityStyle,
  priorityVariant,
  statusTone,
  toneStyle,
  toneVariant,
  type SemanticTone,
} from './semantic-tone'

const GREY = { bg: 'bg.muted', color: 'fg.muted', borderColor: 'border' }

describe('toneStyle', () => {
  it.each([
    ['done', 'success'],
    ['late', 'delayed'],
    ['blocked', 'warning'],
    ['danger', 'critical'],
    ['running', 'info'],
  ] as const)('paints %s with the %s token', (tone, token) => {
    expect(toneStyle(tone)).toEqual({
      bg: `${token}/10`,
      color: token,
      borderColor: `${token}/20`,
    })
  })

  it.each(['pending', 'neutral'] as const)(
    'gives %s no hue at all — "nothing to report" must not compete with the states that do',
    (tone) => {
      expect(toneStyle(tone)).toEqual(GREY)
    },
  )

  it('never paints a state with the brand accent, which is reserved for action and selection', () => {
    const tones: SemanticTone[] = [
      'done',
      'late',
      'blocked',
      'pending',
      'danger',
      'running',
      'neutral',
    ]
    const every = tones.flatMap((tone) => Object.values(toneStyle(tone)))
    expect(every.join(' ')).not.toMatch(/complementary/)
  })
})

describe('toneVariant', () => {
  it.each([
    ['done', 'success'],
    ['late', 'delayed'],
    ['blocked', 'warning'],
    ['pending', 'gray'],
    ['danger', 'critical-soft'],
    ['running', 'info'],
    ['neutral', 'gray'],
  ] as const)('hands %s the %s badge variant', (tone, variant) => {
    expect(toneVariant(tone)).toBe(variant)
  })
})

describe('statusTone — activities only', () => {
  it.each([
    ['done', 'done'],
    ['delayed', 'late'],
    ['overdue', 'late'],
    ['in_progress', 'running'],
    ['in-progress', 'running'],
    ['todo', 'pending'],
    ['pending', 'pending'],
    ['cancelled', 'pending'],
  ] as const)('reads %s as %s', (status, tone) => {
    expect(statusTone(status)).toBe(tone)
  })

  it("no longer answers for a PROJECT status — that is the verdict's job", () => {
    // Answering for these words here is how a view reaches its own opinion
    // about an obra. They go through `healthTone`, so this must refuse them.
    for (const projectStatus of [
      'on_track',
      'ahead',
      'completed',
      'archived',
    ]) {
      expect(statusTone(projectStatus)).toBe('neutral')
    }
  })

  it('falls back to neutral for a word it does not know', () => {
    expect(statusTone('whatever')).toBe('neutral')
  })

  it('separates finished from cancelled — one is an achievement, the other an absence', () => {
    expect(statusTone('done')).not.toBe(statusTone('cancelled'))
  })
})

describe('healthTone — the verdict is a lookup, never a computation', () => {
  it.each([
    ['completed', 'done'],
    ['on_track', 'running'],
    ['ahead', 'running'],
    ['critical', 'danger'],
    ['delayed', 'danger'],
    ['overdue', 'danger'],
    ['over_budget', 'danger'],
    ['draft', 'pending'],
    ['archived', 'pending'],
  ] as const)('reads the %s verdict as %s', (level, tone) => {
    expect(healthTone(level)).toBe(tone)
  })

  it('greys out a level it has never heard of, instead of guessing', () => {
    // The contract can grow a level. A client one deploy behind must say
    // nothing rather than assert something confidently wrong.
    expect(healthTone('evacuated')).toBe('neutral')
  })

  it('never calls an unfinished obra done — green is reserved for finished work', () => {
    for (const level of ['on_track', 'ahead', 'delayed', 'overdue']) {
      expect(healthTone(level)).not.toBe('done')
    }
  })

  it('puts every urgent verdict in one band, so the cause is told by the word', () => {
    // Over budget shares the band deliberately: severity is the hue's job,
    // and the badge's word (plus a money icon on the row) carries the cause.
    const urgent = ['critical', 'delayed', 'overdue', 'over_budget']
    expect(new Set(urgent.map(healthTone))).toEqual(new Set(['danger']))
  })
})

describe('priority lives in its own register', () => {
  it.each([
    ['critical', 'priority-high'],
    ['high', 'priority-high'],
    ['medium', 'priority-medium'],
    ['low', 'priority-low'],
  ] as const)('gives %s the %s variant', (priority, variant) => {
    expect(priorityVariant(priority)).toBe(variant)
  })

  it('never dresses a priority as a state', () => {
    // The defect: medium priority was the same orange as "blocked" and high
    // the same red as "delayed", so an attribute of the work looked like
    // something happening to it. Priority is hollow; state is filled.
    for (const priority of ['critical', 'high', 'medium', 'low']) {
      expect(priorityStyle(priority).bg).toBe('transparent')
    }
  })

  it('falls back to grey for a priority it does not know', () => {
    expect(priorityVariant('urgent')).toBe('gray')
    expect(priorityStyle('urgent')).toEqual(GREY)
  })
})

describe('approvalTone', () => {
  it.each([
    ['approved', 'done'],
    ['rejected', 'danger'],
    ['pending', 'blocked'],
  ] as const)('reads %s as %s', (status, tone) => {
    expect(approvalTone(status)).toBe(tone)
  })

  it('reads a pending decision as blocked, not as the grey pending of unstarted work — somebody is waiting on a person', () => {
    expect(approvalTone('pending')).not.toBe(statusTone('pending'))
  })

  it('falls back to neutral for a decision it does not know', () => {
    expect(approvalTone('withdrawn')).toBe('neutral')
  })
})
