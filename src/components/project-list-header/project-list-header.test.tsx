import { screen } from '@testing-library/react'

import { renderWithProviders } from '@/tests/render-with-providers'

import { ProjectListHeader } from './project-list-header'

describe('ProjectListHeader', () => {
  it('labels the columns in the order the rows lay them out', () => {
    renderWithProviders(<ProjectListHeader />)

    const labels = screen
      .getAllByText(/^(Project|Progress|Status|Deadline|Budget)$/)
      .map((node) => node.textContent)

    expect(labels).toEqual([
      'Project',
      'Progress',
      'Status',
      'Deadline',
      'Budget',
    ])
  })

  it('relabels the two per-listing tracks for drafts', () => {
    renderWithProviders(<ProjectListHeader context="drafts" />)

    const labels = screen
      .getAllByText(/^(Project|Review|Status|Waiting|Budget)$/)
      .map((node) => node.textContent)

    expect(labels).toEqual(['Project', 'Review', 'Status', 'Waiting', 'Budget'])
  })

  it('leaves the accessibility tree while its table is still loading', () => {
    // A `columnheader` outside a `table` is an axe-critical violation.
    renderWithProviders(<ProjectListHeader presentational />)

    expect(screen.queryAllByRole('columnheader')).toHaveLength(0)
  })
})
