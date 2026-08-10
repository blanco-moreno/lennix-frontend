import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import { PATHS } from '@/constants'
import { server } from '@/mocks/server'
import { makeStore } from '@/stores'
import { seedImportReviewStateDTO } from '@/tests/fixtures'
import {
  LOCATION_TEST_ID,
  renderWithProviders,
  SEARCH_TEST_ID,
} from '@/tests/render-with-providers'

import { DraftReviewCanvas } from './draft-review-canvas'

const PROJECT_ID = seedImportReviewStateDTO().project.id

function renderCanvas(search = '') {
  return renderWithProviders(<DraftReviewCanvas projectId={PROJECT_ID} />, {
    store: makeStore(),
    route: `/drafts/${PROJECT_ID}/review${search}`,
  })
}

/** Serve a draft the parser landed nothing in — the one state that clamps. */
function serveEmptyDraft(project: Record<string, unknown> = {}) {
  server.use(
    http.get('*/v1/schedule/review/:projectId', () => {
      const state = seedImportReviewStateDTO()
      return HttpResponse.json({
        ...state,
        project: { ...state.project, ...project },
        tasks: [],
      })
    }),
  )
}

describe('DraftReviewCanvas', () => {
  it('resumes the draft from the backend review state', async () => {
    renderCanvas('?step=schedule')

    // The receipt and the schedule arrive together — the review IS the canvas.
    expect(
      await screen.findByText('Read from ampliacion-bodega-logistica.xlsx'),
    ).toBeInTheDocument()
    const canvas = screen.getByTestId('schedule-canvas')
    expect(canvas).toBeInTheDocument()
    // Scoped to the canvas: the phase names are also options in the tray's
    // placement picker, which is a different surface saying a different thing
    // about the same row.
    expect(within(canvas).getByText('OBRAS PRELIMINARES')).toBeInTheDocument()
  })

  it('never simulates a parse: no pipeline, no mock banner', async () => {
    renderCanvas()
    await screen.findByTestId('draft-review-canvas')

    expect(screen.queryByText(/Preprocessing/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/SemanticMapping/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/simulated|mocked/i)).not.toBeInTheDocument()
  })

  it('resolves the receipt’s claims in two places, split by nature', async () => {
    renderCanvas('?step=schedule')
    await screen.findByTestId('draft-review-canvas')

    // The tray holds what the parser could not resolve; the ledger holds what
    // it decided. Neither repeats the other, and there is no third list.
    expect(screen.getByTestId('review-tray')).toBeInTheDocument()
    expect(screen.getByTestId('assumption-ledger')).toBeInTheDocument()
    expect(screen.queryByTestId('caveat-list')).not.toBeInTheDocument()
  })

  it('points at them when the receipt number is clicked', async () => {
    renderCanvas('?step=schedule')
    const caveats = await screen.findByRole('button', {
      name: /things to check/,
    })

    expect(screen.getByTestId('review-tray')).toHaveAttribute(
      'data-highlighted',
      'false',
    )
    await userEvent.click(caveats)
    expect(screen.getByTestId('review-tray')).toHaveAttribute(
      'data-highlighted',
      'true',
    )
    expect(screen.getByTestId('assumption-ledger')).toHaveAttribute(
      'data-highlighted',
      'true',
    )

    // Clicking again releases it — the receipt is a toggle, not a trap.
    await userEvent.click(caveats)
    expect(screen.getByTestId('review-tray')).toHaveAttribute(
      'data-highlighted',
      'false',
    )
  })

  it('keeps the project’s identity above the wizard, at every step', async () => {
    renderCanvas('?step=schedule')
    await screen.findByTestId('draft-review-canvas')

    const name = screen.getByLabelText('Project name')
    await userEvent.clear(name)
    await userEvent.type(name, 'Bodega Oeste')

    // One draft, one count: the nav says what the one Save would write.
    expect(screen.getByTestId('wizard-nav-pending')).toHaveTextContent(
      '1 unsaved change',
    )
    // The header is identity, not money: the budget lives in its own step.
    expect(screen.queryByLabelText('Project budget')).not.toBeInTheDocument()
  })

  it('saves what the wizard is holding before it leaves for the drafts home', async () => {
    const seen: { body: unknown } = { body: null }
    server.use(
      http.put('*/v1/projects/:id', async ({ request }) => {
        seen.body = await request.json()
        return HttpResponse.json(seedImportReviewStateDTO().project)
      }),
    )
    renderCanvas('?step=schedule')
    await screen.findByTestId('draft-review-canvas')

    const name = screen.getByLabelText('Project name')
    await userEvent.clear(name)
    await userEvent.type(name, 'Bodega Oeste')
    await userEvent.click(screen.getByTestId('wizard-nav-save'))

    // "Save and continue later" saves before it navigates: the button whose
    // name promises a save must not be the one that discards.
    await waitFor(() => expect(seen.body).toEqual({ name: 'Bodega Oeste' }))
    await waitFor(() =>
      expect(screen.getByTestId(LOCATION_TEST_ID)).toHaveTextContent(
        PATHS.DRAFTS,
      ),
    )
  })

  it('remembers the step it was saved on, not just the one Next was pressed on', async () => {
    const steps: unknown[] = []
    server.use(
      http.patch(
        '*/v1/schedule/review/:projectId/step',
        async ({ request }) => {
          steps.push(await request.json())
          return HttpResponse.json({
            project_id: PROJECT_ID,
            review_step: 'budget',
          })
        },
      ),
    )
    // Deep-linked into budget: the wizard never navigated, so nothing but the
    // save can tell the backend where the review was left.
    renderCanvas('?step=budget')
    await screen.findByTestId('budget-step')

    await userEvent.click(screen.getByTestId('wizard-nav-save'))

    await waitFor(() => expect(steps).toEqual([{ step: 'budget' }]))
  })

  it('stays put when the save fails, instead of walking away from the loss', async () => {
    server.use(
      http.put('*/v1/projects/:id', () =>
        HttpResponse.json({ detail: 'boom' }, { status: 500 }),
      ),
    )
    renderCanvas('?step=schedule')
    await screen.findByTestId('draft-review-canvas')

    await userEvent.type(screen.getByLabelText('Location'), 'X')
    await userEvent.click(screen.getByTestId('wizard-nav-save'))

    expect(
      await screen.findByText(
        'Nothing was saved. Your changes are still here.',
      ),
    ).toBeInTheDocument()
    // Still on the draft's own route — `/drafts/:id/review`, not the list.
    expect(screen.getByTestId(LOCATION_TEST_ID)).toHaveTextContent(
      `/drafts/${PROJECT_ID}/review`,
    )
  })

  it('hands over to the project once the schedule is live', async () => {
    server.use(
      http.get('*/v1/schedule/review/:projectId', () => {
        const state = seedImportReviewStateDTO()
        return HttpResponse.json({
          ...state,
          project: { ...state.project, is_draft: false },
        })
      }),
    )
    renderCanvas()

    expect(
      await screen.findByText('This schedule is already live'),
    ).toBeInTheDocument()
    expect(screen.queryByTestId('activate-schedule')).not.toBeInTheDocument()
  })

  it('refuses to render a schedule the quality floor rejected', async () => {
    server.use(
      http.get('*/v1/schedule/review/:projectId', () => {
        const state = seedImportReviewStateDTO()
        return HttpResponse.json({
          ...state,
          outcome: 'needs_assisted_mapping',
        })
      }),
    )
    renderCanvas()

    expect(
      await screen.findByText('This file needs manual mapping'),
    ).toBeInTheDocument()
    expect(screen.queryByTestId('schedule-canvas')).not.toBeInTheDocument()
  })

  it('points a broken draft back at the drafts home', async () => {
    server.use(
      http.get('*/v1/schedule/review/:projectId', () =>
        HttpResponse.json({ detail: 'Project not found' }, { status: 404 }),
      ),
    )
    renderCanvas()

    await waitFor(() =>
      expect(
        screen.getByText('This draft could not be loaded'),
      ).toBeInTheDocument(),
    )
  })
})

describe('DraftReviewCanvas — where the step comes from', () => {
  it('opens where the URL says', async () => {
    // A reachable step: `upload` is a receipt once rows landed, and the clamp
    // refuses it whoever asks — that rule is pinned in `review-step.test.ts`.
    renderCanvas('?step=budget')

    expect(await screen.findByTestId('budget-step')).toBeInTheDocument()
    expect(screen.queryByTestId('schedule-canvas')).not.toBeInTheDocument()
  })

  it('opens where the backend remembers when the URL says nothing', async () => {
    server.use(
      http.get('*/v1/schedule/review/:projectId', () => {
        const state = seedImportReviewStateDTO()
        return HttpResponse.json({
          ...state,
          project: { ...state.project, review_step: 'budget' },
        })
      }),
    )
    renderCanvas()

    expect(await screen.findByTestId('budget-step')).toBeInTheDocument()
  })

  it('opens a freshly imported draft where the work starts', async () => {
    // The backend leaves `review_step` at `upload` after an import. Nothing
    // blocks the seeded draft, but "as far as you may go" is not "where you
    // begin": a user who just imported has not read the schedule yet.
    renderCanvas()

    expect(await screen.findByTestId('schedule-canvas')).toBeInTheDocument()
    // The derived step is written back to the URL, so a refresh lands here too.
    await waitFor(() =>
      expect(screen.getByTestId(SEARCH_TEST_ID)).toHaveTextContent(
        'step=schedule',
      ),
    )
  })

  it('overrules a saved step the draft contradicts — the state wins', async () => {
    serveEmptyDraft({ review_step: 'confirm' })
    renderCanvas()

    // Saved `confirm` on a draft with no rows: there is nothing to confirm,
    // so the wizard lands on the only station that is true.
    expect(await screen.findByTestId('upload-summary')).toBeInTheDocument()
    expect(screen.queryByTestId('confirm-summary')).not.toBeInTheDocument()
    expect(screen.getByTestId('import-step-confirm')).toBeDisabled()
  })

  it('overrules the URL too, and says so in the URL', async () => {
    serveEmptyDraft()
    renderCanvas('?step=confirm')

    expect(await screen.findByTestId('upload-summary')).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.getByTestId(SEARCH_TEST_ID)).toHaveTextContent(
        'step=upload',
      ),
    )
  })

  it('shows Next disabled rather than hiding it when the step is not ready', async () => {
    serveEmptyDraft()
    renderCanvas()

    await screen.findByTestId('upload-summary')
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
    expect(screen.getByTestId('wizard-nav-blocked')).toBeInTheDocument()
  })

  it('moves between steps from the nav and writes it to the URL', async () => {
    renderCanvas()

    // Wait for the draft itself, not just its shell: until the rows land the
    // wizard is still at `upload` and Next would advance somewhere else.
    await screen.findByTestId('schedule-canvas')
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    expect(await screen.findByTestId('budget-step')).toBeInTheDocument()
    expect(screen.getByTestId(SEARCH_TEST_ID)).toHaveTextContent('step=budget')
  })

  it('shows the stations without letting the stepper jump between them', async () => {
    renderCanvas()

    // The wizard runs schedule→confirm on its own controls. The stepper is the
    // map, not the steering: it is mounted without `onSelect`, so every station
    // reads as disabled however far the draft has actually got.
    await screen.findByTestId('schedule-canvas')
    for (const station of ['upload', 'schedule', 'budget', 'confirm']) {
      expect(screen.getByTestId(`import-step-${station}`)).toBeDisabled()
    }
  })

  it('ends on the summary, the real preview, and one Activate in the nav', async () => {
    renderCanvas('?step=confirm')

    expect(await screen.findByTestId('confirm-summary')).toBeInTheDocument()
    expect(screen.getByTestId('schedule-preview')).toBeInTheDocument()
    // The go-live action sits where every step's primary action sits.
    const nav = within(screen.getByTestId('wizard-nav'))
    expect(nav.getByRole('button', { name: 'Activate schedule' })).toBeEnabled()
    expect(nav.queryByRole('button', { name: 'Next' })).toBeNull()
  })
})
