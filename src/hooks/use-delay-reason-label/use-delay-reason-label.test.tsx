import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { IntlProvider } from 'react-intl'

import enMessages from '../../../lang/en.json'

import { useDelayReasonLabel } from './use-delay-reason-label'

/** Same shape as @/tests/with-intl: English pinned, whatever the app default. */
function wrapper({ children }: { children: ReactNode }) {
  return (
    <IntlProvider locale="en" defaultLocale="en" messages={enMessages}>
      {children}
    </IntlProvider>
  )
}

function label(reason: string): string {
  const { result } = renderHook(() => useDelayReasonLabel(), { wrapper })
  return result.current(reason)
}

describe('useDelayReasonLabel', () => {
  it.each([
    ['resource_unavailable', 'Resource unavailable'],
    ['dependency_blocked', 'Dependency blocked'],
    ['scope_change', 'Scope change'],
    ['technical_issues', 'Technical issues'],
    ['client_feedback', 'Client feedback'],
    ['weather_conditions', 'Weather conditions'],
    ['material_shortage', 'Material shortage'],
    ['budget_constraints', 'Budget constraints'],
    ['external_approval', 'External approval'],
    ['other', 'Other'],
  ] as const)('translates backend reason %s to "%s"', (reason, expected) => {
    expect(label(reason)).toBe(expected)
  })

  it('humanises an unrecognised reason instead of showing raw snake_case', () => {
    // Underscores become spaces and only the first letter is capitalised.
    expect(label('crane_stuck_in_mud')).toBe('Crane stuck in mud')
  })

  it('capitalises a single-word unknown reason', () => {
    expect(label('permits')).toBe('Permits')
  })
})
