import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { mapSubtaskDTOToSubtask } from '@/services/task'
import { makeStore } from '@/stores'
import { seedSubtaskDTO, seedUser } from '@/tests/fixtures'
import {
  LOCATION_TEST_ID,
  SEARCH_TEST_ID,
  renderWithProviders,
} from '@/tests/render-with-providers'
import { SEED_IDS } from '@/tests/seed'
import type { SubtaskResponseDTO } from '@/types/dto/subtask-dto'
import { formatPercent } from '@/utils'

import { SubtaskRow } from './subtask-row'

function seedRowSubtask(overrides?: Partial<SubtaskResponseDTO>) {
  return mapSubtaskDTOToSubtask(
    seedSubtaskDTO(SEED_IDS.P1_SUB_EXCAVATION, overrides),
  )
}

function renderRow(subtask = seedRowSubtask()) {
  renderWithProviders(
    <SubtaskRow subtask={subtask} projectId={SEED_IDS.PROJECT_TORRE_ID} />,
    { store: makeStore(), route: '/tasks' },
  )
  return subtask
}

describe('SubtaskRow', () => {
  it('shows the subactivity with its progress', () => {
    const subtask = renderRow()

    expect(screen.getByText(subtask.title)).toBeInTheDocument()
    expect(
      screen.getAllByText(formatPercent(subtask.progress)).length,
    ).toBeGreaterThan(0)
  })

  it('opens its parent phase with itself selected — the title is a door', async () => {
    const subtask = renderRow()

    await userEvent.click(screen.getByText(subtask.title))

    await waitFor(() => {
      expect(screen.getByTestId(LOCATION_TEST_ID)).toHaveTextContent(
        `/projects/${SEED_IDS.PROJECT_TORRE_ID}/tasks/${subtask.parentId}`,
      )
    })
    expect(screen.getByTestId(SEARCH_TEST_ID)).toHaveTextContent(
      `subtask=${subtask.id}`,
    )
  })

  it('says so rather than leaving the responsable column blank', () => {
    renderRow(seedRowSubtask({ assignee_id: null, assignee_name: null }))

    expect(screen.getByText('Unassigned')).toBeInTheDocument()
  })

  it('badges a blocked subactivity', () => {
    renderRow(seedRowSubtask({ is_blocked: true }))

    expect(screen.getByText('Blocked')).toBeInTheDocument()
  })

  it('badges a critical-path subactivity', () => {
    renderRow(seedRowSubtask({ is_critical_path: true }))

    expect(screen.getByText('Critical Path')).toBeInTheDocument()
  })

  it('names the assignee when the row has one', () => {
    const ana = seedUser(SEED_IDS.USER_ANA_ID)
    renderRow(
      seedRowSubtask({
        assignee_id: ana.userId,
        assignee_name: `${ana.firstName} ${ana.lastName}`,
      }),
    )

    expect(
      screen.getByText(`${ana.firstName} ${ana.lastName}`),
    ).toBeInTheDocument()
  })
})
