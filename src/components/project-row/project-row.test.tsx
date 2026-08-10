import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { mapProjectDTOToProject } from '@/services/project'
import { seedProjectDTO } from '@/tests/fixtures'
import { renderWithProviders } from '@/tests/render-with-providers'
import { SEED_IDS } from '@/tests/seed'
import type { ProjectSubject } from '@/types'
import type { ProjectResponseDTO } from '@/types/dto/project-dto'
import { formatMoney, formatPercent } from '@/utils'

import { ProjectListHeader } from '../project-list-header'

import { ProjectRow } from './project-row'

function seedProject(overrides?: Partial<ProjectResponseDTO>) {
  return mapProjectDTOToProject(
    seedProjectDTO(SEED_IDS.PROJECT_TORRE_ID, overrides),
  )
}

/** The dashboard's rollup row: a name, a verdict, and no money at all. */
const rollupSubject: ProjectSubject = {
  id: SEED_IDS.PROJECT_TORRE_ID,
  name: 'Obra sin plata',
  status: 'delayed',
  health: { level: 'delayed', delayDays: 3, daysOverdue: 0 },
  progress: 10,
  dueDate: null,
}

function renderRow(
  project: ProjectSubject = seedProject(),
  props: Partial<Parameters<typeof ProjectRow>[0]> = {},
) {
  const onClick = vi.fn()
  renderWithProviders(
    <ProjectRow project={project} onClick={onClick} {...props} />,
  )
  return { project, onClick }
}

describe('ProjectRow', () => {
  it('carries the obra name, its avance and its budget', () => {
    const { project } = renderRow()

    expect(screen.getByText(project.name)).toBeInTheDocument()
    // Twice in the DOM on purpose: the burn cell and the inline line the row
    // falls back to below `md`. CSS picks one; jsdom sees both.
    expect(
      screen.getAllByText(formatPercent(project.progress, 0)).length,
    ).toBeGreaterThan(0)
    expect(
      screen.getByText(formatMoney(project.budget ?? 0)),
    ).toBeInTheDocument()
  })

  it('says who runs the obra and where it is — the line an activity has no use for', () => {
    const { project } = renderRow()

    expect(
      screen.getByText(
        [project.managerName, project.location].filter(Boolean).join(' · '),
      ),
    ).toBeInTheDocument()
  })

  it('opens the obra from the name, and nowhere else', async () => {
    const { project, onClick } = renderRow()

    // The name is the door: focusable, and it opens the obra once — not twice
    // on its way up through the row.
    await userEvent.click(screen.getByRole('button', { name: project.name }))
    expect(onClick).toHaveBeenCalledTimes(1)

    // The row itself is not a click target: it holds a checkbox, badges and
    // buttons, and a container wrapping controls is invalid HTML and
    // unpredictable with a keyboard or a screen reader.
    await userEvent.click(screen.getByText(formatMoney(project.budget ?? 0)))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('draws no actions zone — the name is the only door, and the width it cost went to the obra name', () => {
    const { project } = renderRow()

    expect(
      screen.queryByRole('button', { name: `View detail of ${project.name}` }),
    ).toBeNull()
    expect(
      screen.queryByRole('button', { name: `Edit ${project.name}` }),
    ).toBeNull()
  })

  it('says there is no budget rather than printing a figure nobody set', () => {
    renderRow(seedProject({ budget: null }))

    expect(screen.getByText('No budget')).toBeInTheDocument()
  })

  it('claims no budget for a subject that carries no money', () => {
    renderRow(rollupSubject)

    expect(screen.getByText('Obra sin plata')).toBeInTheDocument()
    expect(screen.queryByText('No budget')).toBeNull()
  })

  it('renders the extra badges the caller passes beside the name', () => {
    renderRow(rollupSubject, { meta: <span>5 days of slip</span> })

    expect(screen.getByText('5 days of slip')).toBeInTheDocument()
  })

  // Nothing the caller hangs on the row is dropped or counted away: a state
  // the reader cannot see is a state they cannot filter by.
  it('shows every badge the caller hangs on the row', () => {
    renderRow(rollupSubject, {
      meta: [
        <span key="a">slip</span>,
        <span key="b">at risk</span>,
        <span key="c">third</span>,
      ],
    })

    expect(screen.getByText('slip')).toBeInTheDocument()
    expect(screen.getByText('at risk')).toBeInTheDocument()
    expect(screen.getByText('third')).toBeInTheDocument()
  })

  it('answers the two per-listing tracks with a station and an age for a draft', () => {
    renderRow(seedProject({ is_draft: true, review_step: 'budget' }))

    // The draft's own facts, in the tracks avance and the deadline occupy on a
    // live obra — and no progress bar it has not earned. The station is the
    // one the backend remembers, not a constant every draft shares.
    expect(screen.getByText('Step 2 of 3 · Budget')).toBeInTheDocument()
    expect(screen.getByText('Draft')).toBeInTheDocument()
    expect(screen.queryByText('Progress')).toBeNull()
    expect(screen.queryByText('Spent')).toBeNull()
  })

  it('selects without opening the obra', async () => {
    const onSelectedChange = vi.fn()
    const { onClick } = renderRow(seedProject({ is_draft: true }), {
      onSelectedChange,
    })

    await userEvent.click(screen.getByRole('checkbox'))

    expect(onSelectedChange).toHaveBeenCalledWith(true)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('renders no checkbox where there are no bulk actions', () => {
    renderRow()

    expect(screen.queryByRole('checkbox')).toBeNull()
  })

  it('lays out one cell per column the header names', () => {
    // Header and row read the same `PROJECT_GRID_COLUMNS`, so a mismatch here
    // is a track that drew in one place and not the other. Rendered together
    // because that is the only way the counts can be compared at all.
    renderWithProviders(
      <div role="table">
        <ProjectListHeader />
        <ProjectRow project={seedProject()} onClick={vi.fn()} />
      </div>,
    )

    const headers = screen.getAllByRole('columnheader')
    expect(screen.getAllByRole('cell')).toHaveLength(headers.length)
  })

  // The selection track exists in the header and the row together or in
  // neither: told only one of them, the columns stop lining up.
  it('keeps the cell count when the select track holds a checkbox', () => {
    renderWithProviders(
      <div role="table">
        <ProjectListHeader selectable />
        <ProjectRow
          project={seedProject({ is_draft: true })}
          onClick={vi.fn()}
          onSelectedChange={vi.fn()}
        />
      </div>,
    )

    expect(screen.getAllByRole('cell')).toHaveLength(
      screen.getAllByRole('columnheader').length,
    )
  })
})
