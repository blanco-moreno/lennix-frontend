import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderWithProviders } from '@/tests/render-with-providers'

import { FormField } from './form-field'

describe('FormField', () => {
  it('renders a label associated with its control', () => {
    renderWithProviders(
      <FormField htmlFor="field-name" label="Name">
        <input id="field-name" />
      </FormField>,
    )

    expect(screen.getByRole('textbox', { name: 'Name' })).toBeInTheDocument()
    expect(screen.getByText('Name')).toHaveAttribute('for', 'field-name')
  })

  it('renders no error text when there is no error', () => {
    renderWithProviders(
      <FormField htmlFor="field-a" label="A">
        <input id="field-a" />
      </FormField>,
    )

    expect(screen.queryByText('Required')).not.toBeInTheDocument()
  })

  it('renders the error message under the control', () => {
    renderWithProviders(
      <FormField htmlFor="field-b" label="B" error="Required">
        <input id="field-b" />
      </FormField>,
    )

    expect(screen.getByText('Required')).toBeInTheDocument()
  })

  it('omits the for attribute when htmlFor is not given', () => {
    renderWithProviders(
      <FormField label="Date">
        <input aria-label="date control" />
      </FormField>,
    )

    expect(screen.getByText('Date')).not.toHaveAttribute('for')
  })
})
