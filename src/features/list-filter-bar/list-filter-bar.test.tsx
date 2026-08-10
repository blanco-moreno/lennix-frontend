/**
 * The one bar both listings wear.
 *
 * What it has to hold: the surface decides which controls exist (a control the
 * endpoint cannot answer is a 422, not a missing feature), the secondary ones
 * stay behind a disclosure so twelve selects are not a wall, and every chip
 * removes exactly its own filter.
 */

import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useListQueryState } from '@/hooks'
import type { ListSurface } from '@/router'
import { makeStore } from '@/stores'
import {
  SEARCH_TEST_ID,
  renderWithProviders,
} from '@/tests/render-with-providers'

import { ListFilterBar } from './list-filter-bar'

function Harness({ surface }: { surface: ListSurface }) {
  const query = useListQueryState(surface)
  return (
    <ListFilterBar
      surface={surface}
      query={query}
      searchPlaceholder="Search rows…"
    />
  )
}

function renderBar(surface: ListSurface, route = '/list') {
  return renderWithProviders(<Harness surface={surface} />, {
    store: makeStore(),
    route,
  })
}

describe('ListFilterBar — the surface decides what it can ask', () => {
  it('offers the obra picker on the activity list', async () => {
    renderBar('tasks')

    expect(await screen.findByText('Project')).toBeInTheDocument()
  })

  it('does not offer it on the project list, whose endpoint has no such filter', () => {
    renderBar('projects')

    expect(screen.queryByText('Project')).not.toBeInTheDocument()
  })

  it('calls the person filter by what it means on each surface', async () => {
    const user = userEvent.setup()
    renderBar('projects')

    await user.click(screen.getByRole('button', { name: /more filters/i }))

    // An obra is led, an activity is assigned — one URL word, two labels.
    expect(await screen.findByText('Project manager')).toBeInTheDocument()
    expect(screen.queryByText('Assignee')).not.toBeInTheDocument()
  })
})

describe('ListFilterBar — density', () => {
  it('keeps the secondary filters behind a disclosure', async () => {
    const user = userEvent.setup()
    renderBar('tasks')

    expect(screen.queryByText('On the critical path')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /more filters/i }))

    expect(await screen.findByText('On the critical path')).toBeInTheDocument()
    expect(screen.getByText('Blocked')).toBeInTheDocument()
    expect(screen.getByText('Due from')).toBeInTheDocument()
  })

  it('counts the active filters on the phone-width toggle', async () => {
    // At 375px the toggle is the only control beside the box, so it has to say
    // how much narrowing is already on.
    renderBar('tasks', '/list?blocked=true&status=in_progress')

    expect(await screen.findByText('Filters (2)')).toBeInTheDocument()
  })
})

describe('ListFilterBar — the chips', () => {
  it('names the field and the value it is narrowing to', async () => {
    renderBar('tasks', '/list?blocked=true')

    expect(
      await screen.findByRole('button', {
        name: 'Remove filter: Blocked: Yes',
      }),
    ).toBeInTheDocument()
  })

  it('writes the sort to the URL, so the order travels with the link', async () => {
    renderBar('projects', '/list?sort=-progress')

    // Ordering the fetched page would rank five rows of five hundred; the key
    // goes to the server, and the URL is what carries it there.
    expect(screen.getByTestId(SEARCH_TEST_ID)).toHaveTextContent(
      'sort=-progress',
    )
  })
})
