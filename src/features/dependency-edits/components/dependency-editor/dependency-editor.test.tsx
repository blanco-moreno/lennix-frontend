import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from '@/tests/render-with-providers'
import type { DependencyNode } from '@/types'

import { DependencyEditor } from './dependency-editor'

const nodeTask = (id: string, title: string) => ({
  id,
  title,
  status: 'todo',
  priority: 'medium',
  progress: 0,
  startDate: null,
  dueDate: null,
  delayReason: null,
  delayDays: 0,
  isBlocked: false,
  forceStarted: false,
})

const edge = (overrides: Partial<DependencyNode> = {}): DependencyNode => ({
  id: '1',
  task: nodeTask('b', 'Estructura'),
  dependsOn: nodeTask('a', 'Obras preliminares'),
  relationshipType: 'FS',
  lagDays: 0,
  isBroken: false,
  ...overrides,
})

const noop = () => {}

function renderEditor(
  overrides: Partial<Parameters<typeof DependencyEditor>[0]> = {},
) {
  return renderWithProviders(
    <DependencyEditor
      edges={[edge()]}
      direction="upstream"
      heading="Waits for (1)"
      emptyText="Nothing is holding this one back."
      onChangeRelationship={noop}
      onChangeLag={noop}
      onRemove={noop}
      {...overrides}
    />,
  )
}

describe('DependencyEditor', () => {
  it('shows the caller’s empty text when there are no edges', () => {
    renderEditor({
      edges: [],
      emptyText: 'Nothing is holding this one back.',
    })

    expect(
      screen.getByText('Nothing is holding this one back.'),
    ).toBeInTheDocument()
  })

  it('names the other end of the edge, per direction', () => {
    const { unmount } = renderEditor()
    // Upstream lists what this one waits for: the predecessor.
    expect(screen.getByText('Obras preliminares')).toBeInTheDocument()
    unmount()

    renderEditor({ direction: 'downstream', heading: 'Blocks (1)' })
    expect(screen.getByText('Estructura')).toBeInTheDocument()
  })

  it('compresses the whole rule into the chip and keeps controls folded', () => {
    renderEditor({ edges: [edge({ relationshipType: 'SS', lagDays: -2 })] })

    expect(screen.getByTestId('dependency-edge-chip')).toHaveTextContent(
      'SS -2d',
    )
    // Folded by default: a list, not a wall of controls.
    expect(
      screen.queryByTestId('dependency-edge-detail'),
    ).not.toBeInTheDocument()
  })

  it('opens the controls on the row and edits the type in place', async () => {
    const user = userEvent.setup()
    const onChangeRelationship = vi.fn()
    const target = edge()
    renderEditor({ edges: [target], onChangeRelationship })

    await user.click(screen.getByTestId('dependency-edge-row'))
    await user.click(screen.getByRole('button', { name: /^FF —/ }))

    expect(onChangeRelationship).toHaveBeenCalledWith(target, 'FF')
  })

  it('commits lag on blur, clamped to what the backend accepts', async () => {
    const user = userEvent.setup()
    const onChangeLag = vi.fn()
    const target = edge()
    renderEditor({ edges: [target], onChangeLag })

    await user.click(screen.getByTestId('dependency-edge-row'))
    const lag = screen.getByLabelText('Lag (days; negative starts earlier)')
    await user.clear(lag)
    await user.type(lag, '4000')
    expect(onChangeLag).not.toHaveBeenCalled()

    await user.tab()
    expect(onChangeLag).toHaveBeenCalledWith(target, 365)
  })

  it('removes from inside the opened row', async () => {
    const user = userEvent.setup()
    const onRemove = vi.fn()
    const target = edge()
    renderEditor({ edges: [target], onRemove })

    await user.click(screen.getByTestId('dependency-edge-row'))
    await user.click(screen.getByRole('button', { name: 'Remove' }))

    expect(onRemove).toHaveBeenCalledWith(target)
  })

  it('opens to the plain-language rule and nothing editable when read-only', async () => {
    const user = userEvent.setup()
    renderEditor({ readOnly: true })

    await user.click(screen.getByTestId('dependency-edge-row'))

    expect(
      screen.getByText('starts when the other finishes'),
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^FS —/ })).toBeNull()
    expect(
      screen.queryByLabelText('Lag (days; negative starts earlier)'),
    ).toBeNull()
    expect(screen.queryByRole('button', { name: 'Remove' })).toBeNull()
  })
})

describe('DependencyEditor — still reading the chain', () => {
  it('draws its own rows and says neither "none" nor a link it has not read', () => {
    renderEditor({ edges: [], isLoading: true })

    // The empty text is a claim about the schedule — it has to wait for an
    // answer.
    expect(
      screen.queryByText('Nothing is holding this one back.'),
    ).not.toBeInTheDocument()
    expect(screen.queryByTestId('dependency-edge')).not.toBeInTheDocument()
    expect(screen.getByText('Waits for (1)')).toBeInTheDocument()
  })
})
