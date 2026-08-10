import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

import { renderWithProviders } from '@/tests/render-with-providers'

import { Combobox } from './combobox'

const options = [
  { value: 'p-1', label: 'Torre Blanca' },
  { value: 'p-2', label: 'Puente Norte' },
  { value: 'p-3', label: 'Terminal Sur' },
]

describe('Combobox', () => {
  it('shows the label of the selected value', () => {
    renderWithProviders(<Combobox id="project" value="p-2" options={options} />)
    expect(screen.getByText('Puente Norte')).toBeInTheDocument()
  })

  it('filters the given options as the user types', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Combobox id="project" options={options} />)

    await user.type(screen.getByRole('combobox'), 'torre')
    expect(await screen.findByText('Torre Blanca')).toBeInTheDocument()
    expect(screen.queryByText('Puente Norte')).not.toBeInTheDocument()
    expect(screen.queryByText('Terminal Sur')).not.toBeInTheDocument()
  })

  it('reports the picked value through onValueChange', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    renderWithProviders(
      <Combobox id="project" options={options} onValueChange={onValueChange} />,
    )
    await user.type(screen.getByRole('combobox'), 'puente')
    await user.click(await screen.findByText('Puente Norte'))
    expect(onValueChange).toHaveBeenCalledWith('p-2')
  })

  it('shows the empty state when nothing matches', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Combobox id="project" options={options} />)

    await user.type(screen.getByRole('combobox'), 'zzz')
    expect(await screen.findByText('No results found')).toBeInTheDocument()
  })

  it('does not filter client-side when onSearch delegates to the server', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <Combobox id="project" options={options} onSearch={vi.fn()} />,
    )
    // "sur" matches Terminal Sur by label but the server owns matching: all
    // handed-in options must stay visible.
    await user.type(screen.getByRole('combobox'), 'sur')
    expect(await screen.findByText('Terminal Sur')).toBeInTheDocument()
    expect(screen.getByText('Torre Blanca')).toBeInTheDocument()
    expect(screen.getByText('Puente Norte')).toBeInTheDocument()
  })

  it('calls onSearch with the settled term', async () => {
    const user = userEvent.setup()
    const onSearch = vi.fn()
    renderWithProviders(
      <Combobox id="project" options={options} onSearch={onSearch} />,
    )
    await user.type(screen.getByRole('combobox'), 'torre')
    await waitFor(() => expect(onSearch).toHaveBeenCalledWith('torre'))
  })

  it('keeps showing the selected label when the option drops out of the results', async () => {
    const { rerender } = renderWithProviders(
      <Combobox
        id="project"
        value="p-1"
        options={options}
        onSearch={vi.fn()}
      />,
    )
    expect(screen.getByText('Torre Blanca')).toBeInTheDocument()
    // A narrower server result no longer contains the picked project.
    rerender(
      <Combobox
        id="project"
        value="p-1"
        options={[{ value: 'p-3', label: 'Terminal Sur' }]}
        onSearch={vi.fn()}
      />,
    )
    expect(screen.getByText('Torre Blanca')).toBeInTheDocument()
  })
})
