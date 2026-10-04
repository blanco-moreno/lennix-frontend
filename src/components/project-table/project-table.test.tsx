import { screen } from '@testing-library/react'

import { renderWithProviders } from '@/tests/render-with-providers'

import { ProjectTable } from './project-table'

// The loaded listing is covered where it is used (`/projects`, Borradores and
// the dashboard's attention list). What only lives here is the loading state.
describe('ProjectTable', () => {
  it('draws its own rows under the real header, and does not claim to be the table yet', () => {
    const { container } = renderWithProviders(
      <ProjectTable
        projects={[]}
        isLoading
        skeletonRows={4}
        ariaLabel="Projects"
        onRowClick={() => undefined}
      />,
    )

    // Answering to the table's accessible name while the rows are bars would
    // tell a screen reader the obras are on screen.
    expect(
      screen.queryByRole('table', { name: 'Projects' }),
    ).not.toBeInTheDocument()
    // The four bars plus the header: none of them is a row of anything yet.
    expect(
      container.querySelectorAll('[role="row"][aria-hidden="true"]'),
    ).toHaveLength(5)
  })
})
