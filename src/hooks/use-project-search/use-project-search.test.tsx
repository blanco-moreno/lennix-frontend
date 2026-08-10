import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { useState } from 'react'
import { afterEach, describe, expect, it } from 'vitest'

import { Combobox } from '@/components'
import { server } from '@/mocks/server'
import { makeStore } from '@/stores'
import { renderWithProviders } from '@/tests/render-with-providers'

import { useProjectSearch } from './use-project-search'

/**
 * A picker wired the way the two real ones are: the hook fetches, the box
 * reports what was typed. Driving the box rather than the hook alone is the
 * point — the defect was the wiring between them, not either half.
 */
function ProjectPickerHarness() {
  const { options, isLoading, onSearch, isOrganizationEmpty } =
    useProjectSearch()
  const [value, setValue] = useState('')

  return (
    <>
      <Combobox
        id="project"
        value={value}
        onValueChange={setValue}
        options={options}
        onSearch={onSearch}
        isLoading={isLoading}
        placeholder="Select a project"
      />
      <div data-testid="empty-org">{String(isOrganizationEmpty)}</div>
    </>
  )
}

function renderPicker() {
  return renderWithProviders(<ProjectPickerHarness />, { store: makeStore() })
}

/** Every `GET /v1/projects` the surface made, newest last. */
function recordProjectRequests() {
  const urls: URL[] = []
  const record = ({ request }: { request: Request }) => {
    const url = new URL(request.url)
    if (url.pathname.endsWith('/v1/projects')) {
      urls.push(url)
    }
  }
  server.events.on('request:start', record)
  return {
    urls,
    stop: () => server.events.removeListener('request:start', record),
  }
}

async function openAndType(term: string) {
  const input = screen.getByRole('combobox')
  await userEvent.click(input)
  if (term) {
    await userEvent.type(input, term)
  }
  return input
}

describe('useProjectSearch', () => {
  afterEach(() => {
    server.events.removeAllListeners()
  })

  it('offers the page the server returned', async () => {
    renderPicker()

    await openAndType('')
    await waitFor(() =>
      expect(screen.getByText('Torre Residencial Norte')).toBeInTheDocument(),
    )
    expect(screen.getByText('Estacionamiento Municipal')).toBeInTheDocument()
  })

  it('sends the typed term to the server instead of filtering what it holds', async () => {
    const recorded = recordProjectRequests()
    renderPicker()

    await openAndType('Hospital')

    await waitFor(() =>
      expect(
        recorded.urls.some(
          (url) => url.searchParams.get('search') === 'Hospital',
        ),
      ).toBe(true),
    )
    // The narrowing, not the match, is what proves the server answered: the
    // opening page already contained the Hospital row, so asserting on it
    // alone would pass before the search ever landed.
    await waitFor(() =>
      expect(
        screen.queryByText('Torre Residencial Norte'),
      ).not.toBeInTheDocument(),
    )
    expect(screen.getByText('Renovacion Hospital Central')).toBeInTheDocument()

    // The page it asks for is a first screenful, not the maximum page size.
    expect(recorded.urls[0].searchParams.get('page_size')).toBe('20')
    recorded.stop()
  })

  it('keeps showing what a match found on a field the label does not', async () => {
    // The backend searches name, description *and* location. A box that
    // re-filtered the response by label would throw this row away.
    server.use(
      http.get('*/v1/projects', () =>
        HttpResponse.json({
          items: [
            {
              id: '00000000-0000-4000-8000-000000000abc',
              name: 'Torre Residencial Norte',
              description: null,
              location: 'Antofagasta',
              status: 'in_progress',
              priority: 'high',
              progress: 10,
              start_date: null,
              due_date: null,
              manager_id: null,
              manager_name: null,
              is_draft: false,
              created_at: '2026-01-01T00:00:00Z',
              health: { level: 'on_track', delay_days: 0, days_overdue: 0 },
            },
          ],
          total: 1,
          page: 1,
          page_size: 20,
          total_pages: 1,
        }),
      ),
    )
    renderPicker()

    await openAndType('Antofagasta')

    await waitFor(() =>
      expect(screen.getByText('Torre Residencial Norte')).toBeInTheDocument(),
    )
  })

  it('asks for the settled word, not for every keystroke prefix', async () => {
    const recorded = recordProjectRequests()
    renderPicker()

    await openAndType('Plaza')

    // The five keystrokes of "Plaza" must not each be a request. An exact
    // request count is real-timer-dependent — under parallel-worker contention
    // keystrokes straddle the 300 ms window — so the collapse itself is proven
    // deterministically with fake timers in src/hooks/use-debounced-value.test.ts
    // (the Combobox feeds `onSearch` through that hook). What this harness
    // pins is the wiring: the term the server is finally asked for is the
    // whole settled word.
    await waitFor(() =>
      expect(
        recorded.urls
          .filter((url) => url.searchParams.has('search'))
          .at(-1)
          ?.searchParams.get('search'),
      ).toBe('Plaza'),
    )
    recorded.stop()
  })

  it('holds on to the selected project once the search stops returning it', async () => {
    renderPicker()

    await openAndType('Torre')
    await waitFor(() =>
      expect(screen.getByText('Torre Residencial Norte')).toBeInTheDocument(),
    )
    await userEvent.click(screen.getByText('Torre Residencial Norte'))

    // Search for something else: the selected project is no longer in the
    // page, and react-select renders the selected *option*, not the id.
    await openAndType('Plaza')
    await waitFor(() =>
      expect(screen.getByText('Centro Comercial Plaza')).toBeInTheDocument(),
    )
    expect(screen.getByText('Torre Residencial Norte')).toBeInTheDocument()
  })

  it('tells an organization with no projects apart from a search that missed', async () => {
    renderPicker()

    await waitFor(() =>
      expect(screen.getByTestId('empty-org')).toHaveTextContent('false'),
    )

    await openAndType('nothing matches this')
    await waitFor(() =>
      expect(screen.getByText('No results found')).toBeInTheDocument(),
    )
    // A search that found nothing is not an empty organization.
    expect(screen.getByTestId('empty-org')).toHaveTextContent('false')
  })
})
