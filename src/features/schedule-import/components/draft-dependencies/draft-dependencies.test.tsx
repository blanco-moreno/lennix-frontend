/**
 * The draft's graph, before go-live: every edge with where it came from, edits
 * that land at once and re-read only this draft, links judged against the
 * review-state graph before they are offered, and the relationships the file
 * stated that never became an edge.
 */

import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import { server } from '@/mocks/server'
import { mapScheduleReviewStateDTO } from '@/services/schedule-import'
import { scheduleImportApi } from '@/services/schedule-import/schedule-import-service'
import { makeStore } from '@/stores'
import {
  seedImportReviewStateDTO,
  seedP8ImportReviewStateDTO,
} from '@/tests/fixtures'
import { renderWithProviders } from '@/tests/render-with-providers'
import { SEED_IDS } from '@/tests/seed'
import type { ScheduleReviewState } from '@/types'

import { DraftDependencies } from './draft-dependencies'

type Store = ReturnType<typeof makeStore>

/** A hand-made Gantt: no edges, no skipped relationships (contract 2.0). */
const handMade = () => mapScheduleReviewStateDTO(seedImportReviewStateDTO())

/** The MS Project draft: five parsed edges and two skipped relationships. */
const msProject = (dto = seedP8ImportReviewStateDTO()) =>
  mapScheduleReviewStateDTO(dto)

/** The parsed edge into Cabezales: SS +2 days after Pilotes. */
const cabezalesEdge = () =>
  seedP8ImportReviewStateDTO().dependencies.find(
    (edge) => edge.task_id === SEED_IDS.P8_SUB_CABEZALES,
  )!

/** Counts review-state reads per draft, so a refetch — or its absence — shows. */
function countReviewReads() {
  const reads: Record<string, number> = {}
  server.use(
    http.get('*/v1/schedule/review/:projectId', ({ params }) => {
      const id = String(params.projectId)
      reads[id] = (reads[id] ?? 0) + 1
      return HttpResponse.json(seedImportReviewStateDTO())
    }),
  )
  return reads
}

/** Holds the review state of each draft in the cache, as the wizard does. */
async function subscribeToReviews(store: Store, projectIds: string[]) {
  await Promise.all(
    projectIds.map(async (projectId) =>
      store.dispatch(
        scheduleImportApi.endpoints.getScheduleReviewState.initiate(projectId),
      ),
    ),
  )
}

function renderPanel(state: ScheduleReviewState, store = makeStore()) {
  renderWithProviders(
    <DraftDependencies projectId={state.project.id} state={state} />,
    { store },
  )
  return store
}

async function pick(
  user: ReturnType<typeof userEvent.setup>,
  combobox: HTMLElement,
  name: string,
) {
  await user.click(combobox)
  const options = await screen.findAllByRole('option')
  const option = options.find((candidate) =>
    candidate.textContent?.startsWith(name),
  )
  if (!option) throw new Error(`no option "${name}" in the open picker`)
  await user.click(option)
}

describe('DraftDependencies — a draft with no edges', () => {
  it('says the draft has none and offers the first link, with nothing skipped to report', () => {
    renderPanel(handMade())

    const panel = screen.getByTestId('draft-dependencies')
    expect(
      within(panel).getByRole('heading', { name: 'Dependencies (0)' }),
    ).toBeInTheDocument()
    expect(
      within(panel).getByText(
        'No dependencies yet. Until two activities are linked, a delay in one never reaches the other.',
      ),
    ).toBeInTheDocument()
    expect(
      within(panel).getByRole('button', { name: 'Add a dependency' }),
    ).toBeInTheDocument()
    // A contract older than 2.2 carries no skipped list: nothing to state.
    expect(screen.queryByTestId('skipped-edges')).not.toBeInTheDocument()
  })

  it('draws a link from the review-state rows, with its type and lag, and re-reads only this draft', async () => {
    const user = userEvent.setup()
    const state = handMade()
    const [first, second] = state.tasks
    const otherDraft = SEED_IDS.PROJECT_DRAFT_ESCUELA_ID
    const reads = countReviewReads()
    const created: { taskId: string; body: unknown }[] = []
    server.use(
      http.post(
        '*/v1/tasks/:taskId/dependencies',
        async ({ params, request }) => {
          created.push({
            taskId: String(params.taskId),
            body: await request.json(),
          })
          return HttpResponse.json({}, { status: 201 })
        },
      ),
    )
    const store = makeStore()
    await subscribeToReviews(store, [state.project.id, otherDraft])
    renderPanel(state, store)

    await user.click(screen.getByRole('button', { name: 'Add a dependency' }))
    const composer = screen.getByTestId('link-composer')
    await pick(
      user,
      within(composer).getByLabelText('Activity that waits'),
      second.title,
    )
    await pick(
      user,
      within(composer).getByLabelText('Add something this waits for'),
      first.title,
    )
    await user.click(within(composer).getByRole('button', { name: /^SS —/ }))
    const lag = within(composer).getByLabelText(
      'Lag (days; negative starts earlier)',
    )
    await user.clear(lag)
    await user.type(lag, '3')
    await user.click(screen.getByTestId('dependency-add-submit'))

    // The path names the successor; the scope comes from the pairing rule.
    await waitFor(() => expect(created).toHaveLength(1))
    expect(created[0]).toEqual({
      taskId: second.id,
      body: {
        depends_on_id: first.id,
        dependency_type: 'inter_phase',
        relationship_type: 'SS',
        lag_days: 3,
      },
    })
    // Activation sends no edges, so the write is the save: the draft's own
    // review state is read again, and no other draft's is.
    await waitFor(() => expect(reads[state.project.id]).toBe(2))
    expect(reads[otherDraft]).toBe(1)
  })
})

describe('DraftDependencies — an MS Project draft', () => {
  it('lists every edge by both its ends, says it came from the file, and claims no status', () => {
    renderPanel(msProject())

    const panel = screen.getByTestId('draft-dependencies')
    expect(
      within(panel).getByRole('heading', { name: 'Dependencies (5)' }),
    ).toBeInTheDocument()
    const rows = within(panel).getAllByTestId('dependency-edge')
    expect(rows).toHaveLength(5)
    // In the file's reading order, the row that waits named after what it
    // waits for, with the PDM shape the file stated.
    const cabezales = within(panel).getByRole('button', {
      name: 'Pilotes → Cabezales',
    })
    expect(cabezales).toHaveTextContent('SS +2d')
    expect(cabezales).toHaveTextContent('From the file')
    expect(within(panel).getAllByText('From the file')).toHaveLength(5)
    // No engine has run on a draft: no status is drawn for either end.
    expect(within(panel).queryByText('Pending')).not.toBeInTheDocument()
  })

  it('tells an edge added by hand from one read from the file', () => {
    const dto = seedP8ImportReviewStateDTO()
    const manual = dto.dependencies.find(
      (edge) => edge.task_id === SEED_IDS.P8_SUB_LOSA,
    )!
    manual.source = 'manual'
    renderPanel(msProject(dto))

    expect(
      screen.getByRole('button', {
        name: 'Vigas pretensadas → Losa de tablero',
      }),
    ).toHaveTextContent('Added by hand')
    expect(screen.getAllByText('From the file')).toHaveLength(4)
  })

  it('changes a parsed edge’s type and lag in place, on the edge itself', async () => {
    const user = userEvent.setup()
    const patched: { url: string; body: unknown }[] = []
    server.use(
      http.patch(
        '*/v1/tasks/:taskId/dependencies/:depId',
        async ({ params, request }) => {
          patched.push({
            url: `${String(params.taskId)}/${String(params.depId)}`,
            body: await request.json(),
          })
          return HttpResponse.json({}, { status: 200 })
        },
      ),
    )
    renderPanel(msProject())

    await user.click(
      screen.getByRole('button', { name: 'Pilotes → Cabezales' }),
    )
    const detail = screen.getByTestId('dependency-edge-detail')
    await user.click(within(detail).getByRole('button', { name: /^FF —/ }))
    const lag = within(detail).getByLabelText(
      'Lag (days; negative starts earlier)',
    )
    await user.clear(lag)
    await user.type(lag, '-1')
    await user.tab()

    // Endpoints are immutable: the edge keeps its id and is reshaped.
    const url = `${SEED_IDS.P8_SUB_CABEZALES}/${cabezalesEdge().id}`
    await waitFor(() => expect(patched).toHaveLength(2))
    expect(patched).toEqual([
      { url, body: { relationship_type: 'FF' } },
      { url, body: { lag_days: -1 } },
    ])
  })

  it('keeps a parsed edge that crosses phases editable and removable — an existing edge is never re-judged', async () => {
    const user = userEvent.setup()
    const dto = seedP8ImportReviewStateDTO()
    // A file can link across phases; the draft keeps that edge as read, even
    // though a new link would have to respect the pairing rule.
    const crossing = dto.dependencies.find(
      (edge) => edge.task_id === SEED_IDS.P8_SUB_CABEZALES,
    )!
    crossing.depends_on_id = SEED_IDS.P8_SUB_TOPOGRAFIA
    const patched: string[] = []
    const deleted: string[] = []
    server.use(
      http.patch('*/v1/tasks/:taskId/dependencies/:depId', ({ params }) => {
        patched.push(`${String(params.taskId)}/${String(params.depId)}`)
        return HttpResponse.json({}, { status: 200 })
      }),
      http.delete('*/v1/tasks/:taskId/dependencies/:depId', ({ params }) => {
        deleted.push(`${String(params.taskId)}/${String(params.depId)}`)
        return new HttpResponse(null, { status: 204 })
      }),
    )
    renderPanel(msProject(dto))

    await user.click(
      screen.getByRole('button', {
        name: 'Topografía y replanteo → Cabezales',
      }),
    )
    const detail = screen.getByTestId('dependency-edge-detail')
    await user.click(within(detail).getByRole('button', { name: /^FS —/ }))
    await user.click(within(detail).getByRole('button', { name: 'Remove' }))

    const edge = `${SEED_IDS.P8_SUB_CABEZALES}/${crossing.id}`
    await waitFor(() => expect(deleted).toEqual([edge]))
    expect(patched).toEqual([edge])
  })

  it('deletes an edge and re-reads this draft’s review state, and no other draft’s', async () => {
    const user = userEvent.setup()
    const state = msProject()
    const reads = countReviewReads()
    const deleted: string[] = []
    server.use(
      http.delete('*/v1/tasks/:taskId/dependencies/:depId', ({ params }) => {
        deleted.push(`${String(params.taskId)}/${String(params.depId)}`)
        return new HttpResponse(null, { status: 204 })
      }),
    )
    const store = makeStore()
    await subscribeToReviews(store, [
      state.project.id,
      SEED_IDS.PROJECT_DRAFT_ID,
    ])
    renderPanel(state, store)

    await user.click(
      screen.getByRole('button', { name: 'Pilotes → Cabezales' }),
    )
    await user.click(screen.getByRole('button', { name: 'Remove' }))

    await waitFor(() =>
      expect(deleted).toEqual([
        `${SEED_IDS.P8_SUB_CABEZALES}/${cabezalesEdge().id}`,
      ]),
    )
    await waitFor(() => expect(reads[state.project.id]).toBe(2))
    expect(reads[SEED_IDS.PROJECT_DRAFT_ID]).toBe(1)
  })

  it('refuses a duplicate and a loop in the picker, with the reason, before anything is sent', async () => {
    const user = userEvent.setup()
    renderPanel(msProject())

    await user.click(screen.getByRole('button', { name: 'Add a dependency' }))
    const composer = screen.getByTestId('link-composer')
    // The draft holds Obras preliminares → Fundaciones → Superestructura.
    await pick(
      user,
      within(composer).getByLabelText('Activity that waits'),
      'Obras preliminares',
    )
    await user.click(
      within(composer).getByLabelText('Add something this waits for'),
    )
    const options = await screen.findAllByRole('option')
    const at = (name: string) =>
      options.find((option) => option.textContent?.startsWith(name))

    expect(at('Fundaciones')).toHaveTextContent('Already waits for this one')
    expect(at('Fundaciones')).toHaveAttribute('aria-disabled', 'true')
    expect(at('Superestructura')).toHaveTextContent(
      'Would create a loop, via Fundaciones',
    )
    expect(at('Superestructura')).toHaveAttribute('aria-disabled', 'true')
  })

  it('says a pair the draft already links is linked, rather than linking it twice', async () => {
    const user = userEvent.setup()
    renderPanel(msProject())

    await user.click(screen.getByRole('button', { name: 'Add a dependency' }))
    const composer = screen.getByTestId('link-composer')
    await pick(
      user,
      within(composer).getByLabelText('Activity that waits'),
      'Fundaciones › Cabezales',
    )
    await user.click(
      within(composer).getByLabelText('Add something this waits for'),
    )
    const pilotes = (await screen.findAllByRole('option')).find((option) =>
      option.textContent?.startsWith('Pilotes'),
    )

    expect(pilotes).toHaveTextContent('Already linked')
    expect(pilotes).toHaveAttribute('aria-disabled', 'true')
  })

  it('names each relationship the file stated that was not imported, with the file’s text and why', () => {
    renderPanel(msProject())

    const skipped = screen.getByTestId('skipped-edges')
    expect(skipped).toHaveTextContent(
      '2 relationships in the file were not imported',
    )
    expect(
      within(skipped).getByText(
        '“3FC+2 díast” · sheet Task_Table, row 8 · a lag in a unit that cannot be converted to days',
      ),
    ).toBeInTheDocument()
    expect(
      within(skipped).getByText(
        '“14” · sheet Task_Table, row 11 · it points at no row in the schedule',
      ),
    ).toBeInTheDocument()
    expect(within(skipped).queryByText(/Showing the first/)).toBeNull()
  })

  it('counts the whole list when the parser capped it', () => {
    const dto = seedP8ImportReviewStateDTO()
    dto.report = { ...dto.report, skipped_edges_total: 40 }
    renderPanel(msProject(dto))

    const skipped = screen.getByTestId('skipped-edges')
    expect(skipped).toHaveTextContent(
      '40 relationships in the file were not imported',
    )
    expect(skipped).toHaveTextContent('Showing the first 2 of 40.')
  })
})
