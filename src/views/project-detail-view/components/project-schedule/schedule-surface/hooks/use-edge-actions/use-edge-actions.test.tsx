import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import toast from 'react-hot-toast'
import { IntlProvider } from 'react-intl'
import { Provider } from 'react-redux'

import { makeStore } from '@/stores'
import { SEED_IDS } from '@/tests/seed'
import type { DependencyNode } from '@/types'

import enMessages from '../../../../../../../../lang/en.json'

import { useEdgeActions } from './use-edge-actions'

// No `<Toaster />` mounts in a unit render — feedback is asserted where it is
// produced, same as the surface's own tests.
vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}))

beforeEach(() => {
  vi.mocked(toast.success).mockClear()
  vi.mocked(toast.error).mockClear()
})

const PROJECT_ID = SEED_IDS.PROJECT_TORRE_ID
const STRUCTURE = SEED_IDS.P1_TASK_STRUCTURE

const edge: DependencyNode = {
  id: '7',
  task: {
    id: STRUCTURE,
    title: 'Estructura',
    status: 'in_progress',
    priority: 'medium',
    progress: 0,
    startDate: null,
    dueDate: null,
    delayReason: null,
    delayDays: 0,
    isBlocked: false,
    forceStarted: false,
  },
  dependsOn: null,
  relationshipType: 'FS',
  lagDays: 0,
  isBroken: false,
}

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <Provider store={makeStore()}>
      <IntlProvider locale="en" defaultLocale="en" messages={enMessages}>
        {children}
      </IntlProvider>
    </Provider>
  )
}

function renderActions() {
  return renderHook(() => useEdgeActions({ projectId: PROJECT_ID }), {
    wrapper: Wrapper,
  })
}

// Creating and editing healthy edges lives with `useDependencyEdits` now —
// this hook keeps only what the schedule surface itself still does: the
// broken card's re-link and discard.
describe('useEdgeActions', () => {
  it('discards an edge behind the same toast contract', async () => {
    const { result } = renderActions()

    await act(async () => result.current.handleRemoveEdge(edge))
    expect(toast.success).toHaveBeenCalledWith(
      'Dependency removed.',
      expect.anything(),
    )
    expect(toast.error).not.toHaveBeenCalled()
  })
})
