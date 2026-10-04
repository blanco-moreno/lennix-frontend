import { http, HttpResponse } from 'msw'

import {
  FIXTURE_DIVERTED_JOB_ID,
  seedDivertedImportJobStatusDTO,
  seedImportExecuteDTO,
  seedImportJobStatusDTO,
  seedImportReviewStateDTO,
  seedImportUploadDTO,
  seedP8ImportReviewStateDTO,
} from '@/tests/fixtures'
import { SEED_IDS } from '@/tests/seed'

export const importUploadHandler = http.post('*/v1/schedule/import', () => {
  return HttpResponse.json(seedImportUploadDTO(), { status: 201 })
})

/**
 * The import-job status backbone. The diverted job id resolves to the
 * Lane F outcome so a test can exercise assisted mapping without a second
 * handler; every other id resolves to the job that landed the seeded draft.
 */
export const importJobStatusHandler = http.get(
  '*/v1/schedule/import/jobs/:jobId',
  ({ params }) => {
    return HttpResponse.json(
      params.jobId === FIXTURE_DIVERTED_JOB_ID
        ? seedDivertedImportJobStatusDTO()
        : seedImportJobStatusDTO(),
    )
  },
)

/**
 * The resumable review state. The MS Project draft answers with its parsed
 * edges; every other id with the hand-made Gantt.
 */
export const importReviewStateHandler = http.get(
  '*/v1/schedule/review/:projectId',
  ({ params }) => {
    return HttpResponse.json(
      params.projectId === SEED_IDS.PROJECT_DRAFT_VIADUCTO_ID
        ? seedP8ImportReviewStateDTO()
        : seedImportReviewStateDTO(),
    )
  },
)

/** The advisory step memory. Echoes what it was told; it decides nothing. */
export const importReviewStepHandler = http.patch(
  '*/v1/schedule/review/:projectId/step',
  async ({ params, request }) => {
    const body = (await request.json()) as { step: string }
    return HttpResponse.json({
      project_id: params.projectId,
      review_step: body.step,
    })
  },
)

/**
 * The budget split. `allocated` comes back `0` for a draft — the real backend
 * only counts live tasks — which is exactly why the surface never renders it.
 */
export const importTaskBudgetsHandler = http.patch(
  '*/v1/schedule/review/:projectId/task-budgets',
  async ({ params, request }) => {
    const body = (await request.json()) as {
      task_budgets: { task_id: string; budget: number }[]
    }
    return HttpResponse.json({
      project_id: params.projectId,
      project_budget: seedImportReviewStateDTO().project.budget,
      allocated: 0,
      tasks: body.task_budgets.map((entry) => ({
        id: entry.task_id,
        budget: entry.budget,
      })),
    })
  },
)

export const importExecuteHandler = http.post(
  '*/v1/schedule/review/:projectId/activate',
  () => {
    return HttpResponse.json(seedImportExecuteDTO())
  },
)

export const projectImportHandlers = [
  importUploadHandler,
  importJobStatusHandler,
  importReviewStateHandler,
  importReviewStepHandler,
  importTaskBudgetsHandler,
  importExecuteHandler,
]
