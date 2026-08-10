import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import toast from 'react-hot-toast'
import { IntlProvider } from 'react-intl'

import { DEFAULT_LOCALE } from '@/i18n'
import type { Subtask, Task } from '@/types'

import enMessages from '../../../../../../../lang/en.json'

import {
  autoCompletedPhases,
  useParentAutoCompleteToast,
} from './use-parent-auto-complete-toast'

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn() },
}))

function IntlWrapper({ children }: { children: ReactNode }) {
  return (
    <IntlProvider locale={DEFAULT_LOCALE} messages={enMessages}>
      {children}
    </IntlProvider>
  )
}

const subtask = (id: string, status: string): Subtask => ({
  id,
  parentId: 'p1',
  title: id,
  description: null,
  status,
  priority: 'medium',
  progress: status === 'done' ? 100 : 0,
  startDate: null,
  dueDate: null,
  location: null,
  assigneeId: null,
  assigneeName: null,
  spent: 0,
  delayReason: null,
  delayDays: 0,
  isBlocked: false,
  isCriticalPath: false,
  forceStarted: false,
  atRisk: false,
  systemGenerated: false,
  createdAt: '2026-01-01T00:00:00Z',
})

const task = (status: string, subtasks: Subtask[]): Task => ({
  id: 'p1',
  projectId: 'proj',
  projectName: 'Obra',
  title: 'Obras preliminares',
  description: null,
  status: status as Task['status'],
  priority: 'medium',
  budget: null,
  progress: 0,
  startDate: null,
  dueDate: null,
  spent: 0,
  isOverBudget: false,
  delayReason: null,
  delayDays: 0,
  isDraft: false,
  isBlocked: false,
  isCriticalPath: false,
  assigneeId: null,
  assigneeName: null,
  forceStarted: false,
  atRisk: false,
  createdAt: '2026-01-01T00:00:00Z',
  subtasks,
})

describe('autoCompletedPhases', () => {
  it('reports a phase that flipped to done with every activity done', () => {
    const before = [
      task('in_progress', [subtask('s1', 'done'), subtask('s2', 'todo')]),
    ]
    const after = [task('done', [subtask('s1', 'done'), subtask('s2', 'done')])]

    expect(autoCompletedPhases(before, after)).toEqual([
      { id: 'p1', title: 'Obras preliminares' },
    ])
  })

  it('stays quiet when the phase was already done', () => {
    const done = [task('done', [subtask('s1', 'done')])]
    expect(autoCompletedPhases(done, done)).toEqual([])
  })

  it('stays quiet for a phase completed directly, with nothing under it', () => {
    expect(
      autoCompletedPhases([task('in_progress', [])], [task('done', [])]),
    ).toEqual([])
  })

  it('stays quiet while an activity is still open', () => {
    expect(
      autoCompletedPhases(
        [task('in_progress', [subtask('s1', 'todo')])],
        [task('done', [subtask('s1', 'todo')])],
      ),
    ).toEqual([])
  })
})

describe('useParentAutoCompleteToast', () => {
  beforeEach(() => {
    vi.mocked(toast.success).mockClear()
  })

  it('treats the first render as a baseline, not as a transition', () => {
    const { rerender } = renderHook(
      (tasks: Task[]) => useParentAutoCompleteToast(tasks),
      {
        initialProps: [task('done', [subtask('s1', 'done')])],
        wrapper: IntlWrapper,
      },
    )

    rerender([task('done', [subtask('s1', 'done')])])
    expect(toast.success).not.toHaveBeenCalled()
  })

  it('says so once when the backend completes a phase for the user', () => {
    const { rerender } = renderHook(
      (tasks: Task[]) => useParentAutoCompleteToast(tasks),
      {
        initialProps: [
          task('in_progress', [subtask('s1', 'done'), subtask('s2', 'todo')]),
        ],
        wrapper: IntlWrapper,
      },
    )

    const completed = [
      task('done', [subtask('s1', 'done'), subtask('s2', 'done')]),
    ]
    rerender(completed)
    rerender(completed)

    expect(toast.success).toHaveBeenCalledTimes(1)
    expect(vi.mocked(toast.success).mock.calls[0][0]).toContain(
      'completed on its own',
    )
  })

  it('stays quiet when the query resolves with a phase already complete', () => {
    // A loading query renders `[]` first: that is not a baseline.
    const { rerender } = renderHook(
      (tasks: Task[]) => useParentAutoCompleteToast(tasks),
      { initialProps: [] as Task[], wrapper: IntlWrapper },
    )

    rerender([task('done', [subtask('s1', 'done')])])

    expect(toast.success).not.toHaveBeenCalled()
  })

  it('still announces a phase that completes after the data has landed', () => {
    const { rerender } = renderHook(
      (tasks: Task[]) => useParentAutoCompleteToast(tasks),
      { initialProps: [] as Task[], wrapper: IntlWrapper },
    )

    rerender([
      task('in_progress', [subtask('s1', 'done'), subtask('s2', 'todo')]),
    ])
    rerender([task('done', [subtask('s1', 'done'), subtask('s2', 'done')])])

    expect(toast.success).toHaveBeenCalledTimes(1)
  })

  it('stays quiet on a remount of a project whose phases are complete', () => {
    const done = [task('done', [subtask('s1', 'done')])]

    for (let mount = 0; mount < 2; mount += 1) {
      const { rerender, unmount } = renderHook(
        (tasks: Task[]) => useParentAutoCompleteToast(tasks),
        { initialProps: [] as Task[], wrapper: IntlWrapper },
      )
      rerender(done)
      unmount()
    }

    expect(toast.success).not.toHaveBeenCalled()
  })
})
