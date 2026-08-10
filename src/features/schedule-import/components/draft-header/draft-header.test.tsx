import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'

import { mapScheduleReviewStateDTO } from '@/services/schedule-import'
import { seedImportReviewStateDTO } from '@/tests/fixtures'
import { renderWithProviders } from '@/tests/render-with-providers'

import {
  draftFromProject,
  type ProjectDetailsDraft,
} from '../../project-details-draft'

import { DraftHeader } from './draft-header'

const project = () =>
  mapScheduleReviewStateDTO(seedImportReviewStateDTO()).project

/** The wizard owns the draft; this stands in for it. */
function Host({ pending = 0 }: { pending?: number }) {
  const [draft, setDraft] = useState<ProjectDetailsDraft>(() =>
    draftFromProject(project()),
  )
  return (
    <DraftHeader
      draft={draft}
      onEdit={(patch) => setDraft((current) => ({ ...current, ...patch }))}
      pending={pending}
    />
  )
}

describe('DraftHeader', () => {
  it('opens on what the import produced, editable in place', () => {
    renderWithProviders(<Host />)

    expect(screen.getByLabelText('Project name')).toHaveValue(project().name)
    expect(screen.getByLabelText('Location')).toBeInTheDocument()
    expect(screen.getByLabelText('Description')).toBeInTheDocument()
  })

  it('carries the identity and nothing else — the budget is its own step', () => {
    renderWithProviders(<Host />)

    expect(screen.queryByLabelText('Project budget')).not.toBeInTheDocument()
  })

  it('reports every keystroke to the draft the wizard saves', async () => {
    renderWithProviders(<Host />)

    const location = screen.getByLabelText('Location')
    await userEvent.type(location, 'X')

    expect(location).toHaveValue(`${project().location ?? ''}X`)
  })

  it('says what the one Save would write, once something is pending', () => {
    renderWithProviders(<Host pending={1} />)

    expect(screen.getByTestId('draft-header-pending')).toHaveTextContent(
      '1 change is applied when you activate',
    )
  })

  it('says nothing is pending before the first edit', () => {
    renderWithProviders(<Host />)

    expect(screen.getByTestId('draft-header-pending')).toHaveTextContent(
      /Lennix took these from your file/,
    )
  })
})
