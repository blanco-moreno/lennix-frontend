import { screen } from '@testing-library/react'

import { PATHS } from '@/constants'
import { makeStore } from '@/stores'
import { FIXTURE_DIVERTED_JOB_ID } from '@/tests/fixtures'
import { renderWithProviders } from '@/tests/render-with-providers'

import { ImportAssistedMappingView } from './import-assisted-mapping-view'

describe('ImportAssistedMappingView', () => {
  it('opens the diverted import named in the route', async () => {
    renderWithProviders(<ImportAssistedMappingView />, {
      store: makeStore(),
      path: PATHS.IMPORT_ASSISTED_MAPPING,
      route: `/imports/${FIXTURE_DIVERTED_JOB_ID}/mapping`,
    })

    expect(await screen.findByTestId('assisted-mapping')).toBeInTheDocument()
  })
})
