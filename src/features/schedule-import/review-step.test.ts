import {
  furthestReachableStep,
  parseReviewStep,
  resolveReviewStep,
} from './review-step'

const CLEAN = { hasTasks: true, blockingExceptions: 0 }

describe('parseReviewStep', () => {
  it('accepts the four stations and nothing else', () => {
    expect(parseReviewStep('budget')).toBe('budget')
    expect(parseReviewStep('activate')).toBeNull()
    expect(parseReviewStep(undefined)).toBeNull()
  })
})

describe('furthestReachableStep', () => {
  it('stops at upload while nothing has been read', () => {
    expect(
      furthestReachableStep({ hasTasks: false, blockingExceptions: 0 }),
    ).toBe('upload')
  })

  it('stops at schedule while the tray still blocks go-live', () => {
    expect(
      furthestReachableStep({ hasTasks: true, blockingExceptions: 3 }),
    ).toBe('schedule')
  })

  it('reaches confirm once nothing blocks', () => {
    expect(furthestReachableStep(CLEAN)).toBe('confirm')
  })
})

describe('resolveReviewStep precedence', () => {
  it('puts the URL above the saved step', () => {
    expect(
      resolveReviewStep({ urlStep: 'budget', savedStep: 'schedule', ...CLEAN }),
    ).toBe('budget')
  })

  it('puts the saved step above what the state would derive', () => {
    // The state alone would open `confirm`; the review was left at `budget`.
    expect(resolveReviewStep({ savedStep: 'budget', ...CLEAN })).toBe('budget')
  })

  it('derives the step the work starts at, not the furthest one allowed', () => {
    // A file that just landed opens on `schedule`. Dropping the user on
    // `confirm` because nothing happens to block it would ask them to
    // activate a schedule they have not looked at.
    expect(resolveReviewStep(CLEAN)).toBe('schedule')
    expect(resolveReviewStep({ hasTasks: false, blockingExceptions: 0 })).toBe(
      'upload',
    )
  })

  it('ignores a junk ?step= instead of failing on it', () => {
    expect(
      resolveReviewStep({ urlStep: 'activate', savedStep: 'budget', ...CLEAN }),
    ).toBe('budget')
  })

  it('never resumes a landed draft at upload', () => {
    // Saved `upload` on a draft that already carries rows is stale memory: the
    // file is read.
    expect(resolveReviewStep({ savedStep: 'upload', ...CLEAN })).toBe(
      'schedule',
    )
    // Nor does the URL get to jump back there: once rows landed, `schedule` is
    // the earliest reachable step and the clamp holds for every input.
    expect(
      resolveReviewStep({ urlStep: 'upload', savedStep: 'confirm', ...CLEAN }),
    ).toBe('schedule')
  })
})

describe('resolveReviewStep is advisory: the real state wins', () => {
  it('refuses a saved confirm while the tray still blocks it', () => {
    expect(
      resolveReviewStep({
        savedStep: 'confirm',
        hasTasks: true,
        blockingExceptions: 3,
      }),
    ).toBe('schedule')
  })

  it('refuses a URL that asks for the same impossible step', () => {
    expect(
      resolveReviewStep({
        urlStep: 'confirm',
        hasTasks: true,
        blockingExceptions: 1,
      }),
    ).toBe('schedule')
  })

  it('refuses any step past upload while nothing has been read', () => {
    expect(
      resolveReviewStep({
        urlStep: 'confirm',
        savedStep: 'budget',
        hasTasks: false,
        blockingExceptions: 0,
      }),
    ).toBe('upload')
  })

  it('leaves a reachable step alone', () => {
    expect(
      resolveReviewStep({
        urlStep: 'schedule',
        hasTasks: true,
        blockingExceptions: 2,
      }),
    ).toBe('schedule')
  })
})
