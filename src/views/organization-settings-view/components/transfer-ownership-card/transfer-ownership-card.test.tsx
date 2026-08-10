import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import type { ReactElement } from 'react'
import { IntlProvider } from 'react-intl'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router'

import { DEFAULT_LOCALE } from '@/i18n'
import { server } from '@/mocks/server'
import { mapOrganizationResponseDTOToOrganization } from '@/services/organization'
import { makeStore } from '@/stores'
import {
  seedOrganizationDTO,
  seedOrganizationMemberListDTO,
} from '@/tests/fixtures'
import { SEED_IDS } from '@/tests/seed'
import { ThemeProvider } from '@/theme/provider'

import enMessages from '../../../../../lang/en.json'

import { TransferOwnershipCard } from './transfer-ownership-card'

const ORGANIZATION = mapOrganizationResponseDTOToOrganization(
  seedOrganizationDTO(),
)

const OWNER_ID = SEED_IDS.USER_CARLOS_ID
const ANA_ID = SEED_IDS.USER_ANA_ID

function renderCard(ui: ReactElement) {
  const store = makeStore()
  return render(
    <Provider store={store}>
      <ThemeProvider>
        <IntlProvider
          locale={DEFAULT_LOCALE}
          defaultLocale={DEFAULT_LOCALE}
          messages={enMessages}
        >
          <MemoryRouter>{ui}</MemoryRouter>
        </IntlProvider>
      </ThemeProvider>
    </Provider>,
  )
}

describe('TransferOwnershipCard', () => {
  it('offers every member except the current owner', async () => {
    server.use(
      http.get('*/v1/organizations/:id/members', () =>
        HttpResponse.json(seedOrganizationMemberListDTO()),
      ),
    )

    renderCard(<TransferOwnershipCard organization={ORGANIZATION} />)

    const picker = await screen.findByLabelText('New owner')
    await userEvent.click(picker)

    expect(await screen.findByText(/Ana Martinez/)).toBeInTheDocument()
    expect(screen.getByText(/Miguel Santos/)).toBeInTheDocument()
    // The owner is filtered out — the backend rejects a self-transfer. Match
    // on the email, which only ever appears inside an option label (the
    // "current owner" line above shows the name alone).
    expect(
      screen.queryByText(/carlos\.rodriguez@lennix-test\.com/),
    ).not.toBeInTheDocument()
  })

  it('posts the selected member as the new owner after confirmation', async () => {
    server.use(
      http.get('*/v1/organizations/:id/members', () =>
        HttpResponse.json(seedOrganizationMemberListDTO()),
      ),
    )
    let sentUserId: string | null = null
    server.use(
      http.post(
        '*/v1/organizations/:id/transfer-ownership',
        async ({ request }) => {
          const body = (await request.json()) as { user_id: string }
          sentUserId = body.user_id
          return HttpResponse.json(
            seedOrganizationDTO({ owner_id: body.user_id }),
          )
        },
      ),
    )

    renderCard(<TransferOwnershipCard organization={ORGANIZATION} />)

    await userEvent.click(await screen.findByLabelText('New owner'))
    await userEvent.click(await screen.findByText(/Ana Martinez/))
    await userEvent.click(
      screen.getByRole('button', { name: 'Transfer ownership' }),
    )
    await userEvent.click(
      await screen.findByRole('button', { name: 'Yes, transfer' }),
    )

    await waitFor(() => expect(sentUserId).toBe(ANA_ID))
  })

  it('tells the owner there is nobody to transfer to when alone', async () => {
    server.use(
      http.get('*/v1/organizations/:id/members', () =>
        HttpResponse.json(
          seedOrganizationMemberListDTO().filter(
            (member) => member.user_id === OWNER_ID,
          ),
        ),
      ),
    )

    renderCard(<TransferOwnershipCard organization={ORGANIZATION} />)

    expect(
      await screen.findByText(
        'There is nobody to transfer to — invite another member first.',
      ),
    ).toBeInTheDocument()
    expect(screen.queryByLabelText('New owner')).not.toBeInTheDocument()
  })
})
