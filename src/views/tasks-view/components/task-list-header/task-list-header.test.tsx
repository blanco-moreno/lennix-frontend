import { screen } from '@testing-library/react'

import { renderWithProviders } from '@/tests/render-with-providers'

import { TaskListHeader } from './task-list-header'

describe('TaskListHeader', () => {
  it('names the columns the rows lay out on', () => {
    renderWithProviders(<TaskListHeader context="assignee" />)

    for (const label of ['Activity', 'Progress', 'Status', 'Due date']) {
      expect(screen.getByText(label)).toBeInTheDocument()
    }
  })

  it('labels the fifth column for the list it heads', () => {
    // The portfolio list groups by obra, so the useful fact is who is
    // responsible; the assigned queue is already one person's.
    const { unmount } = renderWithProviders(
      <TaskListHeader context="assignee" />,
    )
    expect(screen.getByText('Assignee')).toBeInTheDocument()
    expect(screen.queryByText('Project')).toBeNull()
    unmount()

    renderWithProviders(<TaskListHeader context="project" />)
    expect(screen.getByText('Project')).toBeInTheDocument()
    expect(screen.queryByText('Assignee')).toBeNull()
  })

  it('heads no actions column — the listing has none to head', () => {
    renderWithProviders(<TaskListHeader context="assignee" />)

    expect(screen.queryByRole('columnheader', { name: 'Actions' })).toBeNull()
  })

  it('leaves the accessibility tree while its table is still loading', () => {
    // A `columnheader` outside a `table` is an axe-critical violation.
    renderWithProviders(<TaskListHeader context="assignee" presentational />)

    expect(screen.queryAllByRole('columnheader')).toHaveLength(0)
  })
})
