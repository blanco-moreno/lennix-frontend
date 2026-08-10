import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import toast from 'react-hot-toast'

import { makeStore } from '@/stores'
import { DEFAULT_SEED_PROJECT_ID, seedTaskListDTO } from '@/tests/fixtures'
import {
  SEARCH_TEST_ID,
  renderWithProviders,
} from '@/tests/render-with-providers'

import { ScheduleSurface } from './schedule-surface'

// No `<Toaster />` mounts in a unit render, so the feedback is asserted where
// it is produced rather than where it would be painted.
vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}))

beforeEach(() => {
  vi.mocked(toast.success).mockClear()
  vi.mocked(toast.error).mockClear()
})

/** The address the surface actually lives at — its selection is a query param. */
const SCHEDULE_ROUTE = `/projects/${DEFAULT_SEED_PROJECT_ID}?tab=schedule`

/**
 * A seed phase with live edges on both sides. Its edges are read and edited in
 * its drawer now; what the surface still owes it is the count, and a chart it
 * can be linked on.
 */
const LINKED_PHASE_ID = 'c0000000-0001-0002-0000-000000000000'
const SELECTED_ROUTE = `${SCHEDULE_ROUTE}&task=${LINKED_PHASE_ID}`

function renderSurface(
  props: Partial<Parameters<typeof ScheduleSurface>[0]> = {},
  route: string = SCHEDULE_ROUTE,
) {
  return renderWithProviders(
    <ScheduleSurface projectId={DEFAULT_SEED_PROJECT_ID} {...props} />,
    { store: makeStore(), route },
  )
}

const searchProbe = () => screen.getByTestId(SEARCH_TEST_ID)

describe('ScheduleSurface', () => {
  it('lands on the Gantt with the seeded schedule drawn', async () => {
    renderSurface()

    expect(await screen.findByTestId('schedule-gantt')).toBeInTheDocument()
    expect(screen.getAllByTestId('gantt-bar').length).toBeGreaterThan(0)
  })

  it('offers no view but the Gantt — the filters already narrow it', async () => {
    renderSurface()
    await screen.findByTestId('schedule-gantt')

    expect(
      screen.queryByRole('button', { name: 'Critical path' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Delays' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Timeline' }),
    ).not.toBeInTheDocument()
  })

  it('narrows the timeline to the critical path without dropping its phases', async () => {
    const user = userEvent.setup()
    renderSurface()
    await screen.findByTestId('schedule-gantt')

    const before = screen.getAllByTestId('gantt-row-label').length
    await user.click(screen.getByRole('button', { name: 'Critical only' }))

    await waitFor(() => {
      expect(screen.getAllByTestId('gantt-row-label').length).toBeLessThan(
        before,
      )
    })
  })

  it('surfaces the seeded broken dependency with its re-link, not just a badge', async () => {
    renderSurface()

    const card = await screen.findByTestId('broken-dependency')
    expect(card).toHaveTextContent('Broken link — re-link required')
    expect(
      await screen.findByRole('button', { name: 'Re-link' }),
    ).toBeInTheDocument()
  })

  it('offers no link gesture — the graph is edited in the row panel', async () => {
    const user = userEvent.setup()
    renderSurface()
    await screen.findByTestId('schedule-gantt')

    expect(screen.queryByTestId('gantt-link-hint')).not.toBeInTheDocument()

    const labels = screen.getAllByTestId('gantt-row-label')
    labels[0].focus()
    await user.keyboard('l')
    expect(screen.queryByTestId('gantt-linking-banner')).not.toBeInTheDocument()
    expect(toast.success).not.toHaveBeenCalled()
    expect(toast.error).not.toHaveBeenCalled()
  })

  it('re-points a broken edge at a live row and drops the dead one', async () => {
    const user = userEvent.setup()
    renderSurface()

    await screen.findByTestId('broken-dependency')
    const picker = screen.getByLabelText('Now depends on')
    const option = within(picker).getAllByRole('option')[1] as HTMLOptionElement
    await user.selectOptions(picker, option.value)
    await user.click(screen.getByRole('button', { name: 'Re-link' }))

    // Create-then-delete: the broken edge only goes once its replacement exists.
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Re-linking…' })).toBeNull()
    })
    expect(toast.error).not.toHaveBeenCalled()
  })

  it('offers no "mark done" on the selection — completing lives in the drawer', async () => {
    const user = userEvent.setup()
    renderSurface()
    await screen.findByTestId('schedule-gantt')

    // An open subactivity is the one row the old panel offered to complete.
    const open = seedTaskListDTO(DEFAULT_SEED_PROJECT_ID)
      .flatMap((task) => task.subtasks)
      .find((subtask) => subtask.status !== 'done')!
    const activity = screen
      .getAllByTestId('gantt-row-label')
      .find((label) => label.textContent?.includes(open.title))!
    await user.click(activity)

    await screen.findByTestId('schedule-selection')
    expect(
      screen.queryByRole('button', { name: 'Mark done' }),
    ).not.toBeInTheDocument()
  })

  it('opens a row where the caller sends it, keeping the schedule the spine', async () => {
    const user = userEvent.setup()
    const onOpenRow = vi.fn()
    renderSurface({ onOpenRow })
    await screen.findByTestId('schedule-gantt')

    const labels = screen.getAllByTestId('gantt-row-label')
    await user.click(labels[0])
    await user.click(
      await screen.findByRole('button', { name: 'View Activity' }),
    )

    expect(onOpenRow).toHaveBeenCalled()
  })

  it('hands up the whole row, so a subactivity can open at its phase', async () => {
    // With only an id the caller could not tell the two levels apart, and
    // would send a subactivity to the phase address — which the API refuses.
    const user = userEvent.setup()
    const onOpenRow = vi.fn()
    renderSurface({ onOpenRow })
    await screen.findByTestId('schedule-gantt')

    const phase = seedTaskListDTO(DEFAULT_SEED_PROJECT_ID).find(
      (task) => task.subtasks.length > 0,
    )!
    const activity = phase.subtasks[0]
    const label = screen
      .getAllByTestId('gantt-row-label')
      .find((row) => row.textContent?.includes(activity.title))!
    await user.click(label)
    await user.click(
      await screen.findByRole('button', { name: 'View Subactivity' }),
    )

    expect(onOpenRow).toHaveBeenCalledWith(
      expect.objectContaining({
        id: activity.id,
        parentId: phase.id,
        level: 'subtask',
      }),
    )
  })

  it('opens the dependency drawer on the selection, without leaving the page', async () => {
    const user = userEvent.setup()
    renderSurface({}, SELECTED_ROUTE)
    await screen.findByTestId('schedule-selection')

    await user.click(screen.getByTestId('selection-dependencies'))

    // The same chain panel the activity page shows, in a drawer over the chart.
    expect(await screen.findByTestId('task-dependencies')).toBeInTheDocument()
  })

  it("counts the selected row's links but does not list them — the drawer does", async () => {
    renderSurface({}, SELECTED_ROUTE)
    await screen.findByTestId('schedule-gantt')

    const selection = await screen.findByTestId('schedule-selection')
    expect(selection).toHaveTextContent(/dependenc/i)
    // Editing a link stopped happening under the chart: the row's own edges
    // are read where the row is read.
    expect(screen.queryAllByTestId('dependency-edge')).toHaveLength(0)
  })

  it('keeps broken links here, selection or not — they belong to no row', async () => {
    renderSurface()
    await screen.findByTestId('schedule-gantt')

    // A broken edge has no predecessor left, so its fix needs the whole WBS to
    // pick from; and with nothing selected this is the only place it surfaces.
    await screen.findByTestId('broken-dependencies')
    expect(screen.queryAllByTestId('dependency-edge')).toHaveLength(0)
  })

  it('puts the selected row above the chart instead of below all of it', async () => {
    const user = userEvent.setup()
    renderSurface()
    await screen.findByTestId('schedule-gantt')

    await user.click(screen.getAllByTestId('gantt-row-label')[0])

    const panel = await screen.findByTestId('schedule-selection')
    const chart = screen.getByTestId('schedule-gantt')
    // The panel must precede the chart: at `rows × 30px` tall, rendering it
    // after would put most of a schedule between the row you clicked and what
    // you can do with it.
    expect(
      panel.compareDocumentPosition(chart) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })

  it('names the level of the row it selected, not only its title', async () => {
    const user = userEvent.setup()
    renderSurface()
    await screen.findByTestId('schedule-gantt')

    // Which level a row is decides where it opens and what it can be
    // linked to; on the chart it is carried by indent and fill alone.
    await user.click(screen.getAllByTestId('gantt-row-label')[0])
    expect(await screen.findByTestId('schedule-selection')).toHaveTextContent(
      'Main activity',
    )
  })

  describe('the URL owns the selection', () => {
    const firstRow = seedTaskListDTO(DEFAULT_SEED_PROJECT_ID)[0]

    it('writes the picked row into ?task=, so a selection is a link', async () => {
      const user = userEvent.setup()
      renderSurface()
      await screen.findByTestId('schedule-gantt')

      expect(searchProbe()).not.toHaveTextContent('task=')
      const label = screen.getAllByTestId('gantt-row-label')[0]
      const title = label.textContent ?? ''
      await user.click(label)

      await waitFor(() => {
        expect(searchProbe()).toHaveTextContent('task=')
      })
      // The param names the row that was actually picked, not just any row.
      expect(screen.getByTestId('schedule-selection')).toHaveTextContent(title)
      // The tab it was opened on survives — the param is added, not swapped in.
      expect(searchProbe()).toHaveTextContent('tab=schedule')
    })

    it('restores the selection from the URL on load, without a click', async () => {
      renderSurface({}, `${SCHEDULE_ROUTE}&task=${firstRow.id}`)

      await waitFor(() => {
        expect(screen.getByTestId('schedule-selection')).toHaveTextContent(
          firstRow.title,
        )
      })
    })

    it('drops the param when the selection is cleared', async () => {
      const user = userEvent.setup()
      renderSurface({}, `${SCHEDULE_ROUTE}&task=${firstRow.id}`)
      await screen.findByTestId('schedule-gantt')

      // The button is named after what it does — clearing the selection — not
      // after its consequence.
      await user.click(
        await screen.findByRole('button', { name: 'Clear selection' }),
      )

      await waitFor(() => {
        expect(searchProbe()).not.toHaveTextContent('task=')
      })
      expect(screen.queryByTestId('schedule-selection')).not.toBeInTheDocument()
    })

    it('paints nothing for an ?task= this schedule does not have', async () => {
      renderSurface({}, `${SCHEDULE_ROUTE}&task=from-another-project`)

      await screen.findByTestId('schedule-gantt')
      expect(screen.queryByTestId('schedule-selection')).not.toBeInTheDocument()
      // The hint takes its place, next to the list it is about.
      expect(screen.getByTestId('schedule-selection-hint')).toBeInTheDocument()
    })

    it('keeps the selection when a filter narrows what is drawn', async () => {
      const user = userEvent.setup()
      renderSurface({}, `${SCHEDULE_ROUTE}&task=${firstRow.id}`)
      await screen.findByTestId('schedule-gantt')

      await user.click(screen.getByRole('button', { name: 'Critical only' }))

      expect(searchProbe()).toHaveTextContent(`task=${firstRow.id}`)
      expect(screen.getByTestId('schedule-selection')).toHaveTextContent(
        firstRow.title,
      )
    })
  })
})
