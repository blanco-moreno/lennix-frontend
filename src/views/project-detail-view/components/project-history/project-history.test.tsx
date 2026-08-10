import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import { server } from '@/mocks/server'
import { makeStore } from '@/stores'
import {
  FIXTURE_ACTIVITY_LATEST_AT,
  seedEveryProjectActivityActionDTO,
  seedProjectActivityListDTO,
  seedProjectActivityPageDTO,
} from '@/tests/fixtures'
import { displayedDate } from '@/tests/intl-date'
import { renderWithProviders } from '@/tests/render-with-providers'
import { SEED_IDS } from '@/tests/seed'
import { PROJECT_ACTIVITY_ACTIONS } from '@/types'
import type { ProjectActivityResponseDTO } from '@/types/dto/project-dto'

import { HISTORY_ENTRY_TEST_ID, ProjectHistory } from './project-history'

const projectId = SEED_IDS.PROJECT_TORRE_ID

function renderHistory() {
  return renderWithProviders(<ProjectHistory projectId={projectId} />, {
    store: makeStore(),
    route: `/projects/${projectId}`,
  })
}

/** Serves the feed and records every URL it was asked for. */
function serveActivity(
  items: ProjectActivityResponseDTO[],
  options: { total?: number } = {},
) {
  const urls: string[] = []
  server.use(
    http.get('*/v1/projects/:projectId/activity', ({ request }) => {
      urls.push(request.url)
      const url = new URL(request.url)
      const pageSize = Number(url.searchParams.get('page_size') ?? '20')
      const page = Number(url.searchParams.get('page') ?? '1')
      // Slices by page, not just by size: the tab accumulates pages now, so a
      // mock that ignored `page` would hand back the first one forever.
      const start = (page - 1) * pageSize
      return HttpResponse.json(
        seedProjectActivityPageDTO(items.slice(start, start + pageSize), {
          page,
          pageSize,
          total: options.total ?? items.length,
        }),
      )
    }),
  )
  return urls
}

async function renderedSentences() {
  await waitFor(() => {
    expect(screen.getAllByTestId(HISTORY_ENTRY_TEST_ID).length).toBeGreaterThan(
      0,
    )
  })
  return screen
    .getAllByTestId(HISTORY_ENTRY_TEST_ID)
    .map((row) => row.textContent ?? '')
}

describe('ProjectHistory', () => {
  it('reads the project record, not the viewer’s notification inbox', async () => {
    const urls = serveActivity(seedProjectActivityListDTO())
    server.use(
      http.get('*/v1/notifications', () => {
        throw new Error(
          'the Historial must not read notifications — they are per user',
        )
      }),
    )

    renderHistory()

    // Not an exact count — a refetch under parallel-worker contention is not
    // the defect this test guards. The throwing notifications handler above is
    // what proves no other record was read.
    await waitFor(() => {
      expect(urls.length).toBeGreaterThan(0)
    })
    for (const url of urls) {
      expect(url).toContain(`/v1/projects/${projectId}/activity`)
    }
  })

  it('composes a sentence from the structured fields, and dates the timeline', async () => {
    serveActivity(seedProjectActivityListDTO())
    renderHistory()

    const sentences = await renderedSentences()

    // The feed carries no prose. "Cimentacion" is the entity name; the verb,
    // the word order and the punctuation all come from the message bundle.
    expect(sentences[0]).toBe(
      'Miguel Santos completed the activity Cimentacion.',
    )
    expect(
      screen.getByText(displayedDate(FIXTURE_ACTIVITY_LATEST_AT)),
    ).toBeInTheDocument()
  })

  it('records a change that notified nobody', async () => {
    serveActivity(seedProjectActivityListDTO())
    renderHistory()

    const sentences = await renderedSentences()

    // A dependency edit notifies nobody, yet it must still leave a row — the
    // record cannot depend on notification rules.
    expect(sentences).toContain(
      'Miguel Santos made Estructura depend on Cimentacion.',
    )
    // …and `dependency_type` — a backend key — never reaches the screen.
    expect(sentences.join(' ')).not.toContain('inter_phase')
  })

  it('names the system when a change had no human actor', async () => {
    serveActivity(seedProjectActivityListDTO())
    renderHistory()

    const sentences = await renderedSentences()
    const unblocked = sentences.find((s) => s.includes('no longer blocked'))

    expect(unblocked).toBe('Estructura is no longer blocked: it can start.')
    expect(sentences.join(' ')).not.toMatch(/null|undefined/)
  })

  it('has a real sentence for every action the backend can send', async () => {
    serveActivity(seedEveryProjectActivityActionDTO())
    renderHistory()

    await renderedSentences()
    // The vocabulary is far longer than one page, so the whole set only
    // renders past "Show more" — and at 20 a page that is several clicks,
    // not one.
    for (let click = 0; click < PROJECT_ACTIVITY_ACTIONS.length; click++) {
      const more = screen.queryByRole('button', { name: 'Show more' })
      if (!more) break
      await userEvent.click(more)
    }
    const sentences = await waitFor(async () => {
      const found = await renderedSentences()
      expect(found).toHaveLength(PROJECT_ACTIVITY_ACTIONS.length)
      return found
    })

    expect(sentences).toHaveLength(PROJECT_ACTIVITY_ACTIONS.length)
    // Every action reads differently — none collapsed onto a shared or a
    // missing message.
    expect(new Set(sentences).size).toBe(PROJECT_ACTIVITY_ACTIONS.length)

    const all = sentences.join(' ')
    for (const action of PROJECT_ACTIVITY_ACTIONS) {
      expect(all).not.toContain(action)
    }
    // No untranslated backend value behind the key either.
    expect(all).not.toContain('in_progress')
    expect(all).not.toContain('projectActivity.')
    // The generic fallback is only for keys this build does not know; no
    // enumerated action may land on it.
    expect(all).not.toContain('made a change to')
  })

  // --- approval decisions ---------------------------------------------------
  //
  // A task running under an override must trace who asked and who approved,
  // and a budget change must trace the decision that allowed it.

  it('names who asked on an approved force-start', async () => {
    const [known] = seedProjectActivityListDTO()
    serveActivity([
      {
        ...known,
        action: 'force_start.approved',
        entity_name: 'Estructura',
        // The actor is the decider; `old_value` is the requester.
        old_value: 'Fernando Lopez',
        new_value: null,
      },
    ])
    renderHistory()

    const sentences = await renderedSentences()

    expect(sentences[0]).toBe(
      'Miguel Santos approved the request from Fernando Lopez to force-start Estructura.',
    )
  })

  it('drops the requester clause rather than printing an empty one', async () => {
    const [known] = seedProjectActivityListDTO()
    serveActivity([
      {
        ...known,
        action: 'force_start.rejected',
        entity_name: 'Estructura',
        // The requester's account is gone, so the record has no name to print.
        old_value: null,
        new_value: null,
      },
    ])
    renderHistory()

    const sentences = await renderedSentences()

    expect(sentences[0]).toBe(
      'Miguel Santos rejected the request to force-start Estructura.',
    )
  })

  it('formats a budget decision as money, both amounts', async () => {
    const [known] = seedProjectActivityListDTO()
    serveActivity([
      {
        ...known,
        action: 'budget_approval.approved',
        entity_name: 'Estructura',
        old_value: '120000.00',
        new_value: '150000.00',
      },
    ])
    renderHistory()

    const sentences = await renderedSentences()

    // Decimal strings are a wire shape, never a screen shape.
    expect(sentences[0]).not.toContain('120000.00')
    expect(sentences[0]).toMatch(/approved the budget change for Estructura/)
    expect(sentences[0]).toMatch(/120[.,]000/)
    expect(sentences[0]).toMatch(/150[.,]000/)
  })

  it('names only the requested amount when a budget is set for the first time', async () => {
    const [known] = seedProjectActivityListDTO()
    serveActivity([
      {
        ...known,
        action: 'budget_approval.requested',
        entity_name: 'Estructura',
        // No budget before: a first allocation, not a raise. The sentence must
        // not print an amount that never existed.
        old_value: null,
        new_value: '150000.00',
      },
    ])
    renderHistory()

    const sentences = await renderedSentences()

    expect(sentences[0]).toBe(
      'Miguel Santos requested a budget change for Estructura: $150,000.00.',
    )
  })

  it('falls back to a translated sentence for an action it does not know', async () => {
    const [known] = seedProjectActivityListDTO()
    serveActivity([{ ...known, action: 'task.teleported' }])
    renderHistory()

    const sentences = await renderedSentences()

    expect(sentences[0]).toBe('Miguel Santos made a change to Cimentacion.')
    expect(sentences[0]).not.toContain('task.teleported')
  })

  it('is a record, not a second inbox', async () => {
    serveActivity(seedProjectActivityListDTO())
    renderHistory()

    await renderedSentences()

    expect(
      screen.getByText(/everything that has happened in this project/i),
    ).toBeInTheDocument()
    // No inbox affordances: nothing to mark as read, nothing to dismiss.
    expect(screen.queryByText(/mark all as read/i)).not.toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('says the project has no record yet instead of rendering an empty rail', async () => {
    serveActivity([])
    renderHistory()

    expect(await screen.findByText('Nothing recorded yet')).toBeInTheDocument()
    expect(screen.queryAllByTestId(HISTORY_ENTRY_TEST_ID)).toHaveLength(0)
  })

  it('says so when the record could not be read', async () => {
    server.use(
      http.get('*/v1/projects/:projectId/activity', () =>
        HttpResponse.json({ detail: 'boom' }, { status: 500 }),
      ),
    )
    renderHistory()

    expect(
      await screen.findByText('The project history could not be loaded.'),
    ).toBeInTheDocument()
  })

  it('asks for the next page rather than truncating the record silently', async () => {
    const rows = seedEveryProjectActivityActionDTO()
    // One row per action out of 60: the record continues past the first page.
    const urls = serveActivity(rows, { total: 60 })
    renderHistory()

    const firstPage = await renderedSentences()
    await userEvent.click(
      await screen.findByRole('button', { name: 'Show more' }),
    )

    // "Show more" asks for the next page at the same size — never a growing
    // page, which would re-download every row already on screen and break the
    // page-size ceiling of 20.
    await waitFor(() => {
      expect(urls.at(-1)).toContain('page=2')
    })
    expect(urls.every((url) => url.includes('page_size=20'))).toBe(true)

    // …and the rows pile up rather than being replaced.
    await waitFor(async () => {
      expect((await renderedSentences()).length).toBeGreaterThan(
        firstPage.length,
      )
    })
  })
})

describe('money on the wire never reaches the screen', () => {
  const moneyRow = (
    action: string,
    oldValue: string | null,
    newValue: string | null,
  ) => {
    const [known] = seedProjectActivityListDTO()
    return { ...known, action, old_value: oldValue, new_value: newValue }
  }

  it.each([
    ['task.over_budget', '120000.00', '131500.00'],
    ['task.within_budget', '120000.00', '99000.00'],
    ['project.over_budget', '800000.00', '850000.00'],
    ['project.within_budget', '800000.00', '750000.00'],
    ['project.budget_changed', '800000.00', '850000.00'],
  ])('formats both amounts on %s', async (action, oldValue, newValue) => {
    serveActivity([moneyRow(action, oldValue, newValue)])
    renderHistory()

    const [sentence] = await renderedSentences()

    // A decimal string is a wire shape, never a screen shape.
    expect(sentence).not.toContain(oldValue)
    expect(sentence).not.toContain(newValue)
    expect(sentence).toMatch(/\$[\d.,]+/)
  })

  it('leaves the subactivity name on an expense row alone', async () => {
    // `old` is the parent subactivity there, not an amount — the reason the
    // decision is per placeholder rather than per action.
    serveActivity([moneyRow('expense.recorded', 'Excavacion', '1500.00')])
    renderHistory()

    const [sentence] = await renderedSentences()

    expect(sentence).toContain('$1,500.00')
    expect(sentence).not.toContain('NaN')
  })

  it('leaves a non-money row untouched', async () => {
    serveActivity([moneyRow('project.critical_path_changed', '2', '4')])
    renderHistory()

    const [sentence] = await renderedSentences()

    expect(sentence).toBe('The critical path went from 2 to 4 activities.')
  })
})
