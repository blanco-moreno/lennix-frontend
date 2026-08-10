import { ChakraProvider } from '@chakra-ui/react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { IntlProvider } from 'react-intl'
import { vi } from 'vitest'

import { renderWithProviders } from '@/tests/render-with-providers'
import { system } from '@/theme/theme'

import { DateInput } from './date-input'

describe('DateInput', () => {
  it('shows the placeholder when no date is set', () => {
    renderWithProviders(<DateInput value={undefined} onValueChange={vi.fn()} />)
    expect(screen.getByText('Select date')).toBeInTheDocument()
  })

  it('shows the current value on the trigger', () => {
    renderWithProviders(
      <DateInput value="2026-08-15" onValueChange={vi.fn()} />,
    )
    expect(screen.getByRole('button')).toHaveTextContent(/2026/)
  })

  it('emits the picked day as an ISO date', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    renderWithProviders(
      <DateInput value="2026-08-15" onValueChange={onValueChange} />,
    )
    await user.click(screen.getByRole('button'))
    await user.click(
      await screen.findByRole('button', { name: /August 20, 2026/ }),
    )
    expect(onValueChange).toHaveBeenCalledWith('2026-08-20')
  })

  it('navigates to the previous month from the grid header', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <DateInput value="2026-08-15" onValueChange={vi.fn()} />,
    )
    await user.click(screen.getByRole('button'))
    expect((await screen.findAllByText('August 2026')).length).toBeGreaterThan(
      0,
    )
    await user.click(
      screen.getByRole('button', { name: 'Switch to previous month' }),
    )
    expect((await screen.findAllByText('July 2026')).length).toBeGreaterThan(0)
    // Days of July are now offered.
    expect(
      screen.getByRole('button', { name: /July 15, 2026/ }),
    ).toBeInTheDocument()
  })

  it('jumps months through the month view', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <DateInput value="2026-08-15" onValueChange={vi.fn()} />,
    )
    await user.click(screen.getByRole('button'))
    // The header label switches the day view to the month grid.
    const [viewTrigger] = await screen.findAllByText('August 2026')
    await user.click(viewTrigger)
    const [feb] = await screen.findAllByText('Feb')
    await user.click(feb)
    expect(
      (await screen.findAllByText('February 2026')).length,
    ).toBeGreaterThan(0)
    expect(
      await screen.findByRole('button', { name: /February 10, 2026/ }),
    ).toBeInTheDocument()
  })

  it('jumps years through the year view', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <DateInput value="2026-08-15" onValueChange={vi.fn()} />,
    )
    await user.click(screen.getByRole('button'))
    const [viewTrigger] = await screen.findAllByText('August 2026')
    await user.click(viewTrigger)
    // The month view's header opens the year grid for the surrounding decade.
    const [yearTrigger] = await screen.findAllByText('2026')
    await user.click(yearTrigger)
    const [year2024] = await screen.findAllByText('2024')
    await user.click(year2024)
    const [feb] = await screen.findAllByText('Feb')
    await user.click(feb)
    expect(
      await screen.findByRole('button', { name: /February 10, 2024/ }),
    ).toBeInTheDocument()
  })

  it('writes the day in the reader’s language, and still emits ISO', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    // Zag's own default is 'en-US', so this is the assertion that would catch
    // the picker drifting back into being an English island.
    render(
      <IntlProvider locale="es" defaultLocale="es" messages={{}}>
        <ChakraProvider value={system}>
          <DateInput value="2026-08-15" onValueChange={onValueChange} />
        </ChakraProvider>
      </IntlProvider>,
    )

    expect(screen.getByRole('button')).toHaveTextContent('15 ago 2026')
    expect(screen.getByRole('button')).not.toHaveTextContent('Aug 15')

    await user.click(screen.getByRole('button'))
    // The calendar's own chrome follows the same locale...
    expect(
      (await screen.findAllByText(/agosto de 2026/)).length,
    ).toBeGreaterThan(0)
    // ...while the value leaving the component stays ISO 8601.
    await user.click(
      await screen.findByRole('button', { name: /20 de agosto/ }),
    )
    expect(onValueChange).toHaveBeenCalledWith('2026-08-20')
  })

  it('disables the trigger when the input is disabled', () => {
    renderWithProviders(
      <DateInput value={undefined} onValueChange={vi.fn()} disabled />,
    )
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
