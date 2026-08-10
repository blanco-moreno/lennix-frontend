/**
 * The shared list under every papelera tab. `trash-view.test.tsx` walks the
 * tabs through the network; these pin what the list itself owes its callers —
 * the empty state, per-row callbacks carrying the right id, and the bulk-purge
 * flow, which no view-level test exercises.
 */

import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import { server } from '@/mocks/server'
import { makeStore } from '@/stores'
import { seedProjectListDTO } from '@/tests/fixtures'
import { renderWithProviders } from '@/tests/render-with-providers'

import { TrashList, type TrashRow } from '.'

/** Deletion is a runtime event the seed does not stamp for these rows. */
const FIXTURE_DELETED_AT = '2026-07-24T12:00:00Z'

const [firstProject, secondProject] = seedProjectListDTO()

const ROWS: TrashRow[] = [
  {
    id: firstProject.id,
    primary: firstProject.name,
    deletedAt: FIXTURE_DELETED_AT,
  },
  {
    id: secondProject.id,
    primary: secondProject.name,
    deletedAt: FIXTURE_DELETED_AT,
  },
]

interface RenderOverrides {
  rows?: TrashRow[]
  onRestore?: (id: string) => Promise<void>
  onPurge?: (id: string) => void
  canPurge?: boolean
}

function renderList({
  rows = ROWS,
  onRestore = async () => undefined,
  onPurge = () => undefined,
  canPurge = true,
}: RenderOverrides = {}) {
  return renderWithProviders(
    <TrashList
      kind="project"
      rows={rows}
      isLoading={false}
      onRestore={onRestore}
      onPurge={onPurge}
      canPurge={canPurge}
      onPageChange={() => undefined}
    />,
    { store: makeStore() },
  )
}

describe('TrashList', () => {
  it('says the trash is empty instead of rendering a bare page', () => {
    renderList({ rows: [] })

    expect(screen.getByText('Trash is empty')).toBeInTheDocument()
    expect(
      screen.getByText(/Items removed from the active surfaces appear here/),
    ).toBeInTheDocument()
  })

  it('restores the row its button belongs to, not the first one', async () => {
    const restored: string[] = []
    renderList({
      onRestore: async (id) => {
        restored.push(id)
      },
    })

    const secondRestore = screen.getAllByRole('button', { name: 'Restore' })[1]
    await userEvent.click(secondRestore)

    expect(restored).toEqual([secondProject.id])
  })

  it('hands purge the id of the row whose button was pressed', async () => {
    const purged: string[] = []
    renderList({ onPurge: (id) => purged.push(id) })

    const firstPurge = screen.getAllByRole('button', {
      name: 'Delete forever',
    })[0]
    await userEvent.click(firstPurge)

    expect(purged).toEqual([firstProject.id])
  })

  it('bulk-purges the whole selection through the confirmation, then clears it', async () => {
    const bodies: unknown[] = []
    server.use(
      http.post('*/v1/trash/bulk-purge', async ({ request }) => {
        bodies.push(await request.json())
        return new HttpResponse(null, { status: 204 })
      }),
    )

    renderList()

    await userEvent.click(screen.getByRole('button', { name: 'Select All' }))
    expect(screen.getByText('2 selected')).toBeInTheDocument()

    await userEvent.click(
      screen.getByRole('button', { name: 'Delete Selected' }),
    )
    const dialog = await screen.findByRole('dialog')
    expect(
      within(dialog).getByText('Delete selected forever?'),
    ).toBeInTheDocument()

    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Delete forever' }),
    )

    await waitFor(() => {
      expect(bodies).toEqual([
        { kind: 'project', ids: [firstProject.id, secondProject.id] },
      ])
    })
    // The purged rows are gone server-side, so the selection must not survive.
    await waitFor(() => {
      expect(screen.queryByText('2 selected')).toBeNull()
    })
  })

  it('offers no bulk delete without the purge key, even with rows selected', async () => {
    renderList({ canPurge: false })

    await userEvent.click(screen.getByRole('button', { name: 'Select All' }))

    expect(screen.getByText('2 selected')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Delete Selected' })).toBeNull()
  })
})
