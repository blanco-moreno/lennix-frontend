import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { IntlProvider } from 'react-intl'

import enMessages from '../../../lang/en.json'

import { useStatusLabel } from './use-status-label'

/** Same shape as @/tests/with-intl: English pinned, whatever the app default. */
function wrapper({ children }: { children: ReactNode }) {
  return (
    <IntlProvider locale="en" defaultLocale="en" messages={enMessages}>
      {children}
    </IntlProvider>
  )
}

function label(status: string): string {
  const { result } = renderHook(() => useStatusLabel(), { wrapper })
  return result.current(status)
}

describe('useStatusLabel', () => {
  it.each([
    // Both backend spellings collapse onto one label.
    ['completed', 'Completed'],
    ['done', 'Completed'],
    ['in_progress', 'In progress'],
    ['in-progress', 'In progress'],
    ['delayed', 'Delayed'],
    ['cancelled', 'Cancelled'],
    ['pending', 'Pending'],
    ['todo', 'Pending'],
    ['on_track', 'On track'],
    ['ahead', 'Ahead of schedule'],
    ['archived', 'Archived'],
  ] as const)('labels backend status %s as "%s"', (status, expected) => {
    expect(label(status)).toBe(expected)
  })

  it('labels an unrecognised status Unknown instead of leaking the raw string', () => {
    expect(label('paused')).toBe('Unknown')
  })
})
