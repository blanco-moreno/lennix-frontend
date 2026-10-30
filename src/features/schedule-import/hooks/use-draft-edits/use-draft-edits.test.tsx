import { renderHook, act, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import type { ReactNode } from 'react'
import { IntlProvider } from 'react-intl'
import { Provider } from 'react-redux'

import { server } from '@/mocks/server'
import { mapScheduleReviewStateDTO } from '@/services/schedule-import'
import { makeStore } from '@/stores'
import { seedImportReviewStateDTO, seedProjectDTO } from '@/tests/fixtures'
import type { ReviewProject, ReviewTask } from '@/types'

import enMessages from '../../../../../lang/en.json'

import { useDraftEdits } from './use-draft-edits'

const state = () => mapScheduleReviewStateDTO(seedImportReviewStateDTO())

/**
 * The wizard mounts before the review state arrives, so the hook's first
 * `project` is a placeholder — the same one the canvas passes.
 */
const PLACEHOLDER: ReviewProject = {
  id: '',
  name: '',
  description: null,
  location: null,
  budget: null,
  currency: 'USD',
  startDate: null,
  dueDate: null,
  isDraft: true,
  managerId: null,
  reviewStep: 'upload',
}

function wrapper({ children }: { children: ReactNode }) {
  return (
    <Provider store={makeStore()}>
      <IntlProvider locale="en" defaultLocale="en" messages={enMessages}>
        {children}
      </IntlProvider>
    </Provider>
  )
}

function renderEdits(project: ReviewProject, tasks: ReviewTask[] = []) {
  return renderHook(
    ({ project: p, tasks: t }) =>
      useDraftEdits({ projectId: p.id || 'p1', project: p, tasks: t }),
    { wrapper, initialProps: { project, tasks } },
  )
}

describe('useDraftEdits', () => {
  it('takes the project’s real values once they arrive', () => {
    const project = state().project
    const { result, rerender } = renderEdits(PLACEHOLDER)

    // Built from the placeholder, every field would read as "the user cleared
    // this" — and Save would blank the obra's description on its way out.
    expect(result.current.draft.name).toBe('')
    rerender({ project, tasks: [] })

    expect(result.current.draft.name).toBe(project.name)
    expect(result.current.draft.location).toBe(project.location)
    expect(result.current.pending).toBe(0)
  })

  it('follows a value that changed on the server while the form was open', () => {
    const project = state().project
    const { result, rerender } = renderEdits(project)

    // A save refetches the review state underneath an open form — coming back
    // to the draft must not show what it said before the save.
    rerender({ project: { ...project, name: 'Bodega Oeste' }, tasks: [] })

    expect(result.current.draft.name).toBe('Bodega Oeste')
    expect(result.current.pending).toBe(0)
  })

  it('never throws away what the user is in the middle of typing', () => {
    const project = state().project
    const { result, rerender } = renderEdits(project)

    act(() => result.current.edit({ name: 'Bodega Oeste' }))
    // Some other field of the same project changed server-side.
    rerender({ project: { ...project, location: 'Parque Sur' }, tasks: [] })

    expect(result.current.draft.name).toBe('Bodega Oeste')
    expect(result.current.draft.location).toBe('Parque Sur')
    expect(result.current.pending).toBe(1)
  })

  it('writes the project’s fields and the split in one Save', async () => {
    const { project, tasks } = state()
    const calls: string[] = []
    let projectBody: unknown = null
    server.use(
      http.put('*/v1/projects/:id', async ({ request }) => {
        calls.push('project')
        projectBody = await request.json()
        // A real project response, not the review state's reduced project:
        // this endpoint answers `ProjectResponseDTO`, and the mapper now reads
        // fields the reduced shape never carried.
        return HttpResponse.json(seedProjectDTO(project.id))
      }),
      http.patch('*/v1/schedule/review/:projectId/task-budgets', () => {
        calls.push('task-budgets')
        return HttpResponse.json({
          project_id: project.id,
          project_budget: '900000.00',
          allocated: 0,
          tasks: [],
        })
      }),
    )
    const { result } = renderEdits(project, tasks)

    act(() =>
      result.current.edit({
        name: 'Bodega Oeste',
        budget: '900000',
        taskBudgets: {
          ...result.current.draft.taskBudgets,
          [tasks[0].id]: '80000',
        },
      }),
    )
    await act(async () => {
      await result.current.save()
    })

    // The project's budget lands before the split measured against it.
    expect(calls).toEqual(['project', 'task-budgets'])
    expect(projectBody).toEqual({ name: 'Bodega Oeste', budget: '900000' })
    await waitFor(() =>
      expect(result.current.outcome).toEqual({ kind: 'saved' }),
    )
  })

  it('reports a rejected batch as a whole, never as a partial save', async () => {
    const { project, tasks } = state()
    server.use(
      http.patch('*/v1/schedule/review/:projectId/task-budgets', () =>
        HttpResponse.json(
          {
            detail: {
              code: 'unknown_review_tasks',
              task_ids: ['gone'],
              message: 'unknown review tasks',
            },
          },
          { status: 400 },
        ),
      ),
    )
    const { result } = renderEdits(project, tasks)

    act(() =>
      result.current.edit({
        taskBudgets: {
          ...result.current.draft.taskBudgets,
          [tasks[0].id]: '80000',
        },
      }),
    )
    await act(async () => {
      await result.current.save()
    })

    expect(result.current.outcome).toEqual({ kind: 'unknown-tasks', count: 1 })
  })

  it('writes nothing when nothing changed', async () => {
    const { project, tasks } = state()
    const { result } = renderEdits(project, tasks)

    await act(async () => {
      expect(await result.current.save()).toEqual({ kind: 'noop' })
    })
  })
})
