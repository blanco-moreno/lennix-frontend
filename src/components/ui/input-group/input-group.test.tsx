import { screen } from '@testing-library/react'
import { Search, X } from 'lucide-react'

import { renderWithProviders } from '@/tests/render-with-providers'

import { Input } from '../input'

import { InputGroup } from './input-group'

describe('InputGroup', () => {
  it('renders its input child', () => {
    renderWithProviders(
      <InputGroup>
        <Input aria-label="Search projects" />
      </InputGroup>,
    )
    expect(
      screen.getByRole('textbox', { name: 'Search projects' }),
    ).toBeInTheDocument()
  })

  it('renders the leading icon when startIcon is given', () => {
    const { container } = renderWithProviders(
      <InputGroup startIcon={<Search data-testid="start-icon" />}>
        <Input aria-label="Search" />
      </InputGroup>,
    )
    expect(screen.getByTestId('start-icon')).toBeInTheDocument()
    expect(container.querySelectorAll('svg')).toHaveLength(1)
  })

  it('renders the trailing element when endIcon is given', () => {
    renderWithProviders(
      <InputGroup
        endIcon={
          <button type="button" aria-label="Clear">
            <X />
          </button>
        }
      >
        <Input aria-label="Search" />
      </InputGroup>,
    )
    expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument()
  })

  it('renders no icon containers without icons', () => {
    const { container } = renderWithProviders(
      <InputGroup>
        <Input aria-label="Bare" />
      </InputGroup>,
    )
    expect(container.querySelector('svg')).not.toBeInTheDocument()
  })
})
