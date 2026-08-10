import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { IntlProvider } from 'react-intl'

import enMessages from '../../../lang/en.json'

import { usePriorityLabel } from './use-priority-label'

/** Same shape as @/tests/with-intl: English pinned, whatever the app default. */
function wrapper({ children }: { children: ReactNode }) {
  return (
    <IntlProvider locale="en" defaultLocale="en" messages={enMessages}>
      {children}
    </IntlProvider>
  )
}

function label(priority: string): string {
  const { result } = renderHook(() => usePriorityLabel(), { wrapper })
  return result.current(priority)
}

describe('usePriorityLabel', () => {
  it.each([
    ['critical', 'Critical'],
    ['high', 'High'],
    ['medium', 'Medium'],
    ['low', 'Low'],
  ] as const)('labels backend priority %s as "%s"', (priority, expected) => {
    expect(label(priority)).toBe(expected)
  })

  it('keeps critical and high as distinct labels even though they share a colour', () => {
    // The colour scale collapses them (priority-color.ts); the words must not.
    expect(label('critical')).not.toBe(label('high'))
  })

  it('labels an unrecognised priority Normal instead of leaking the raw string', () => {
    expect(label('urgent')).toBe('Normal')
    expect(label('')).toBe('Normal')
  })
})
