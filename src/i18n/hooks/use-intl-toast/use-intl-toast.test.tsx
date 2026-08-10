import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import toast, { Toaster } from 'react-hot-toast'

import { renderWithProviders } from '@/tests/render-with-providers'

import enMessages from '../../../../lang/en.json'
import { languageSwitcherMessages } from '../../components/language-switcher/language-switcher-messages'
import { apiErrorMessages } from '../use-format-api-error'

import { useIntlToast } from './use-intl-toast'

function Harness() {
  const intlToast = useIntlToast()
  return (
    <>
      <Toaster />
      <button
        type="button"
        onClick={() =>
          intlToast.success(languageSwitcherMessages.buttonTooltip, {
            label: 'English',
          })
        }
      >
        fire success
      </button>
      <button
        type="button"
        onClick={() => intlToast.error(apiErrorMessages.forbidden)}
      >
        fire error
      </button>
    </>
  )
}

describe('useIntlToast', () => {
  // jsdom ships no matchMedia; <Toaster/> queries prefers-reduced-motion.
  beforeAll(() => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    }))
  })
  afterAll(() => vi.unstubAllGlobals())

  afterEach(() => act(() => toast.remove()))

  it('shows a success toast with the translated, value-interpolated copy', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Harness />)

    await user.click(screen.getByRole('button', { name: 'fire success' }))

    // "Language: {label}" from the en catalog, with the value filled in.
    expect(await screen.findByText('Language: English')).toBeInTheDocument()
  })

  it('shows an error toast with the translated copy', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Harness />)

    await user.click(screen.getByRole('button', { name: 'fire error' }))

    expect(
      await screen.findByText(enMessages['apiError.forbidden']),
    ).toBeInTheDocument()
  })

  it('dedupes by descriptor id: repeating the same toast never stacks', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Harness />)

    await user.click(screen.getByRole('button', { name: 'fire success' }))
    await user.click(screen.getByRole('button', { name: 'fire success' }))

    await screen.findByText('Language: English')
    expect(screen.getAllByText('Language: English')).toHaveLength(1)
  })
})
