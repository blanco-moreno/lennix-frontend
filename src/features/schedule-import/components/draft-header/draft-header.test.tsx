import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'

import { mapScheduleReviewStateDTO } from '@/services/schedule-import'
import { makeStore } from '@/stores'
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
function Host() {
  const [draft, setDraft] = useState<ProjectDetailsDraft>(() =>
    draftFromProject(project()),
  )
  return (
    <DraftHeader
      projectId={project().id}
      draft={draft}
      onEdit={(patch) => setDraft((current) => ({ ...current, ...patch }))}
    />
  )
}

describe('DraftHeader', () => {
  it('opens on what the import produced, editable in place', () => {
    renderWithProviders(<Host />, { store: makeStore() })

    expect(screen.getByLabelText('Project name')).toHaveValue(project().name)
    expect(screen.getByLabelText('Location')).toBeInTheDocument()
    expect(screen.getByLabelText('Description')).toBeInTheDocument()
  })

  it('carries the identity and nothing else — the budget is its own step', () => {
    renderWithProviders(<Host />, { store: makeStore() })

    expect(screen.queryByLabelText('Project budget')).not.toBeInTheDocument()
  })

  it('reports every keystroke to the draft the wizard saves', async () => {
    renderWithProviders(<Host />, { store: makeStore() })

    const location = screen.getByLabelText('Location')
    await userEvent.type(location, 'X')

    expect(location).toHaveValue(`${project().location ?? ''}X`)
  })

  it('leaves the pending count to the nav, and carries no explainer', () => {
    renderWithProviders(<Host />, { store: makeStore() })

    expect(screen.queryByTestId('draft-header-pending')).not.toBeInTheDocument()
    expect(screen.queryByText(/Lennix/)).not.toBeInTheDocument()
  })
})
