import { act, renderHook } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import type { ReactNode } from 'react'
import toast from 'react-hot-toast'
import { IntlProvider } from 'react-intl'
import { Provider } from 'react-redux'

import { server } from '@/mocks/server'
import { makeStore } from '@/stores'
import { SEED_IDS } from '@/tests/seed'
import type { DependencyNode } from '@/types'

import enMessages from '../../../lang/en.json'

import { useDependencyEdits } from './use-dependency-edits'

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}))

beforeEach(() => {
  vi.mocked(toast.success).mockClear()
  vi.mocked(toast.error).mockClear()
})

const edge: DependencyNode = {
  id: '7',
  task: {
    id: SEED_IDS.P1_TASK_STRUCTURE,
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

const renderEdits = () =>
  renderHook(() => useDependencyEdits(SEED_IDS.PROJECT_TORRE_ID), {
    wrapper: Wrapper,
  })

describe('useDependencyEdits', () => {
  it('patches the type and the lag rather than recreating the edge', async () => {
    const patched: unknown[] = []
    server.use(
      http.patch(
        '*/v1/tasks/:taskId/dependencies/:depId',
        async ({ request }) => {
          patched.push(await request.json())
          return HttpResponse.json({}, { status: 200 })
        },
      ),
    )
    const { result } = renderEdits()

    await act(async () => result.current.changeRelationship(edge, 'FF'))
    await act(async () => result.current.changeLag(edge, -3))

    expect(patched).toEqual([{ relationship_type: 'FF' }, { lag_days: -3 }])
    expect(toast.success).toHaveBeenCalledWith(
      'Dependency updated.',
      expect.anything(),
    )
  })

  it('removes an edge and says so', async () => {
    const { result } = renderEdits()

    await act(async () => result.current.remove(edge))

    expect(toast.success).toHaveBeenCalledWith(
      'Dependency removed.',
      expect.anything(),
    )
    expect(toast.error).not.toHaveBeenCalled()
  })

  describe('createLink', () => {
    const FOUNDATION = SEED_IDS.P1_TASK_FOUNDATION
    const STRUCTURE = SEED_IDS.P1_TASK_STRUCTURE
    const INSTALLATIONS = SEED_IDS.P1_TASK_INSTALLATIONS

    /** Three seeded phases; the seed already links structure ← foundation. */
    const rows = new Map([
      [FOUNDATION, { parentId: null }],
      [STRUCTURE, { parentId: null }],
      [INSTALLATIONS, { parentId: null }],
    ])
    const existingEdges = [{ taskId: STRUCTURE, dependsOnId: FOUNDATION }]

    const link = async (
      result: ReturnType<typeof renderEdits>['result'],
      predecessorId: string,
      successorId: string,
    ) =>
      result.current.createLink({
        predecessorId,
        successorId,
        rows,
        existingEdges,
      })

    it('creates a legal link and says so', async () => {
      const { result } = renderEdits()
      await act(async () => link(result, FOUNDATION, INSTALLATIONS))

      expect(toast.success).toHaveBeenCalledWith(
        'Dependency created.',
        expect.anything(),
      )
      expect(toast.error).not.toHaveBeenCalled()
    })

    it('refuses a duplicate and a self-link before the server is asked', async () => {
      const requests: string[] = []
      server.use(
        http.post('*/v1/tasks/:taskId/dependencies', ({ params }) => {
          requests.push(String(params.taskId))
          return HttpResponse.json({}, { status: 201 })
        }),
      )
      const { result } = renderEdits()

      // The seed already carries structure ← foundation.
      await act(async () => link(result, FOUNDATION, STRUCTURE))
      expect(toast.error).toHaveBeenCalledWith(
        'That dependency already exists.',
        expect.anything(),
      )

      await act(async () => link(result, FOUNDATION, FOUNDATION))
      expect(toast.error).toHaveBeenCalledWith(
        'A row cannot depend on itself.',
        expect.anything(),
      )

      expect(requests).toHaveLength(0)
      expect(toast.success).not.toHaveBeenCalled()
    })

    it('answers a failed create with the failure toast, not the success one', async () => {
      server.use(
        http.post('*/v1/tasks/:taskId/dependencies', () =>
          HttpResponse.json({ detail: 'boom' }, { status: 500 }),
        ),
      )
      const { result } = renderEdits()

      await act(async () => link(result, FOUNDATION, INSTALLATIONS))

      expect(toast.success).not.toHaveBeenCalled()
      expect(toast.error).toHaveBeenCalledWith(
        'Could not create the dependency. Try again.',
        expect.anything(),
      )
    })
  })

  it('answers a failed edit with the failure toast, not the success one', async () => {
    server.use(
      http.patch('*/v1/tasks/:taskId/dependencies/:depId', () =>
        HttpResponse.json({ detail: 'boom' }, { status: 500 }),
      ),
    )
    const { result } = renderEdits()

    await act(async () => result.current.changeLag(edge, 2))

    expect(toast.success).not.toHaveBeenCalled()
    expect(toast.error).toHaveBeenCalledWith(
      'Could not update the dependency. Try again.',
      expect.anything(),
    )
  })
})
