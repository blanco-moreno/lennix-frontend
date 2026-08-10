import { screen } from '@testing-library/react'

import { makeStore } from '@/stores'
import { BROKEN_DEPENDENT_TASK } from '@/tests/fixtures/seed-lookup'
import { renderWithProviders } from '@/tests/render-with-providers'

import { BlockedReason } from './blocked-reason'

const dependent = BROKEN_DEPENDENT_TASK

const options = () => ({ store: makeStore(), route: '/' })

describe('BlockedReason', () => {
  it('names the dead link only for a row whose edge the API flags broken', async () => {
    renderWithProviders(
      <BlockedReason
        projectId={dependent.projectId}
        taskId={dependent.id}
        isBlocked
      />,
      options(),
    )

    expect(
      await screen.findByText(/dependency that no longer exists/i),
    ).toBeInTheDocument()
    // The copy asks for a re-link, so the note has to carry the way to the one
    // surface that can do one, with the row already selected.
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      expect.stringContaining(`task=${dependent.id}`),
    )
  })

  it('says nothing about a broken edge for a row that has none', async () => {
    // The dead link belongs to the dependent, not to every blocked row in the
    // obra: inferring "broken" from an empty blocker list claims it of rows
    // whose edges are intact. Both notes read the same graph, so the known one
    // proves it arrived before the absence is asserted.
    renderWithProviders(
      <>
        <BlockedReason
          projectId={dependent.projectId}
          taskId={dependent.id}
          isBlocked
        />
        <BlockedReason
          projectId={dependent.projectId}
          taskId="00000000-0000-0000-0000-00000000dead"
          isBlocked
        />
      </>,
      options(),
    )

    expect(
      await screen.findAllByText(/dependency that no longer exists/i),
    ).toHaveLength(1)
  })

  it('renders nothing for a row that is not blocked', () => {
    renderWithProviders(
      <BlockedReason
        projectId={dependent.projectId}
        taskId={dependent.id}
        isBlocked={false}
      />,
      options(),
    )

    expect(
      screen.queryByText(/dependency that no longer exists/i),
    ).not.toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})
