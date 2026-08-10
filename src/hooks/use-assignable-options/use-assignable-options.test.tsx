import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { Provider } from 'react-redux'

import { makeStore } from '@/stores'
import { seedAssignableMembersDTO } from '@/tests/fixtures'
import { SEED_IDS } from '@/tests/seed'

import { useAssignableOptions } from './use-assignable-options'

function wrapper({ children }: { children: ReactNode }) {
  return <Provider store={makeStore()}>{children}</Provider>
}

const PROJECT_ID = SEED_IDS.PROJECT_TORRE_ID
const rows = seedAssignableMembersDTO(PROJECT_ID)

/**
 * One endpoint, two assignment fields. What is pinned is that the hook hands
 * the jefe-de-obra picker the wide set the write accepts, and hands an activity
 * picker only the rows flagged `is_work_assignable` — the ones the *other*
 * write accepts. Offering a row the backend refuses is a 400 the user meets
 * after choosing, which is the failure this filter exists to prevent.
 */
describe('useAssignableOptions', () => {
  it('offers every row by default — naming a jefe de obra seats whoever is named', async () => {
    const { result } = renderHook(() => useAssignableOptions(PROJECT_ID), {
      wrapper,
    })

    await waitFor(() =>
      expect(result.current.options.length).toBeGreaterThan(0),
    )
    expect(result.current.options).toHaveLength(rows.length)
  })

  it('drops the rows an activity assignee would be refused', async () => {
    const narrow = rows.filter((row) => row.is_work_assignable)
    // The seed has to actually disagree, or the test would pass on an
    // unfiltered list.
    expect(narrow.length).toBeLessThan(rows.length)

    const { result } = renderHook(
      () => useAssignableOptions(PROJECT_ID, { workAssignableOnly: true }),
      { wrapper },
    )

    await waitFor(() =>
      expect(result.current.options.length).toBeGreaterThan(0),
    )
    expect(result.current.options.map((option) => option.value)).toEqual(
      narrow.map((row) => row.user_id),
    )
  })

  it('asks for nothing while skipped', () => {
    const { result } = renderHook(
      () => useAssignableOptions(PROJECT_ID, { skip: true }),
      { wrapper },
    )

    expect(result.current.options).toEqual([])
    expect(result.current.isLoading).toBe(false)
  })
})
