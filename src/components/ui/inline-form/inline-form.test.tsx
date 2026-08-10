import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

import { renderWithProviders } from '@/tests/render-with-providers'

import { InlineForm } from './inline-form'

describe('InlineForm', () => {
  it('renders nothing while closed', () => {
    renderWithProviders(
      <InlineForm open={false} onOpenChange={vi.fn()} title="Hidden">
        <p>Invisible body</p>
      </InlineForm>,
    )
    expect(screen.queryByText('Invisible body')).not.toBeInTheDocument()
  })

  it('renders in place — never as a dialog over the record', () => {
    renderWithProviders(
      <InlineForm
        open
        onOpenChange={vi.fn()}
        title="Edit activity"
        description="Change the fields and save"
        footer={<button type="button">Save changes</button>}
      >
        <p>Form body</p>
      </InlineForm>,
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByText('Edit activity')).toBeInTheDocument()
    expect(screen.getByText('Change the fields and save')).toBeInTheDocument()
    expect(screen.getByText('Form body')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Save changes' }),
    ).toBeInTheDocument()
  })

  it('brings itself into view and takes focus when it opens', () => {
    const scrollIntoView = vi.fn()
    Element.prototype.scrollIntoView = scrollIntoView

    renderWithProviders(
      <InlineForm open onOpenChange={vi.fn()} title="Edit activity">
        <p>Form body</p>
      </InlineForm>,
    )

    expect(scrollIntoView).toHaveBeenCalled()
    expect(screen.getByText('Edit activity').closest('[tabindex="-1"]')).toBe(
      document.activeElement,
    )
  })

  it('submits the form when a submit handler is given', async () => {
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault())
    renderWithProviders(
      <InlineForm
        open
        onOpenChange={vi.fn()}
        title="Edit activity"
        onSubmit={onSubmit}
        footer={<button type="submit">Save</button>}
      >
        <p>Form body</p>
      </InlineForm>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })
})
