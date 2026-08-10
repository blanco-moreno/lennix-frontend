import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Building2 } from 'lucide-react'

import { makeStore } from '@/stores'
import { renderWithProviders } from '@/tests/render-with-providers'

import { Sidebar } from './sidebar'

const groups = [
  {
    id: 'groupWorks',
    label: 'Works',
    items: [
      { id: 'projects', label: 'Projects', icon: Building2, path: '/projects' },
    ],
  },
  {
    id: 'groupManagement',
    label: 'Management',
    items: [
      {
        id: 'approvals',
        label: 'Approvals',
        icon: Building2,
        path: '/approvals',
        badge: 3,
      },
    ],
  },
]

function renderSidebar(collapsed = false) {
  renderWithProviders(
    <Sidebar navigationGroups={groups} collapsed={collapsed} />,
    { store: makeStore(), route: '/projects' },
  )
}

describe('Sidebar', () => {
  // The desktop aside is `display: none` until `md`, and jsdom never matches a
  // media query — so everything it renders is queried with `hidden: true`.
  it('renders the grouped navigation', () => {
    renderSidebar()

    expect(
      screen.getByRole('button', { name: /projects/i, hidden: true }),
    ).toBeInTheDocument()
    expect(screen.getByTestId('nav-group-groupWorks')).toHaveTextContent(
      'Works',
    )
  })

  it('drops labels and group headers when collapsed, keeping the destinations', () => {
    renderSidebar(true)

    // The rail is icon-only, so the accessible name comes from the tooltip
    // trigger rather than from visible text — but every destination survives.
    expect(screen.queryByTestId('nav-group-groupWorks')).toBeNull()
    expect(screen.queryByText('Projects')).toBeNull()
    expect(
      screen.getAllByRole('button', { hidden: true }).length,
    ).toBeGreaterThanOrEqual(2)
  })

  it('shows the pending count beside the item that carries one', () => {
    renderSidebar()

    expect(screen.getByTestId('nav-badge-approvals')).toHaveTextContent('3')
    // Absent, not zero, on items without one.
    expect(screen.queryByTestId('nav-badge-projects')).toBeNull()
  })

  it('serves the same destinations from the mobile drawer and closes it on navigation', async () => {
    const onOpenChange = vi.fn()
    renderWithProviders(
      <Sidebar navigationGroups={groups} open onOpenChange={onOpenChange} />,
      { store: makeStore(), route: '/projects' },
    )

    const drawer = await screen.findByRole('dialog')
    await userEvent.click(
      within(drawer).getByRole('button', { name: /projects/i }),
    )

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})
