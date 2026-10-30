import {
  seedDivertedImportJobStatusDTO,
  seedImportAssistedMappingErrorDTO,
  seedImportJobStatusDTO,
  seedImportReviewStateDTO,
  seedImportUploadDTO,
  seedP8ImportReviewStateDTO,
  FIXTURE_DIVERTED_JOB_ID,
} from '@/tests/fixtures'
import { SEED_IDS, SEED_SCHEDULE_IMPORT } from '@/tests/seed'

import {
  mapImportJobStatusDTO,
  mapImportUploadResponseDTO,
  mapLedgerEntry,
  mapScheduleReviewStateDTO,
  readAssistedMappingDivert,
  readImportFailureCode,
  readPlanQuotaFailure,
} from './schedule-import-mappers'

describe('mapScheduleReviewStateDTO', () => {
  it('reads where the file’s costs came from, and what the budget owes them', () => {
    const dto = seedImportReviewStateDTO()
    const state = mapScheduleReviewStateDTO({
      ...dto,
      file_budget: 'applied',
      report: { ...dto.report, cost_source: 'budgeted', costs_unread: 3 },
    })

    expect(state.fileBudget).toBe('applied')
    expect(state.report.costSource).toBe('budgeted')
    expect(state.report.costsUnread).toBe(3)
  })

  it('reads a draft from before costs as one the file left to the review', () => {
    const dto = seedImportReviewStateDTO()
    const state = mapScheduleReviewStateDTO({
      ...dto,
      file_budget: undefined,
      report: { ...dto.report, cost_source: 'invented' },
    })

    expect(state.fileBudget).toBe('none')
    expect(state.report.costSource).toBeNull()
    expect(state.report.costsUnread).toBe(0)
  })

  it('maps the seeded draft with its trust outputs', () => {
    const state = mapScheduleReviewStateDTO(seedImportReviewStateDTO())

    expect(state.project.isDraft).toBe(true)
    expect(state.tasks.length).toBeGreaterThan(0)
    expect(state.scheduleImport?.sourceFilename).toBe(
      SEED_SCHEDULE_IMPORT.sourceFilename,
    )
    expect(state.report.rowsImported).toBeGreaterThan(0)
    expect(state.ledger[0].consequence).toBe('high')
    expect(state.quality.threshold).toBeGreaterThan(0)
  })

  it('joins prose the seed manifest split into fragments', () => {
    const state = mapScheduleReviewStateDTO(seedImportReviewStateDTO())

    // `sheet_reason` and a ledger `detail` reach the fixture as string arrays
    // (the seed manifest generator splits Python implicit concatenation); the mapper has
    // to hand components one sentence either way.
    expect(state.report.sheetReason).toContain('CARTA GANTT')
    expect(state.report.sheetReason).not.toContain(',')
    expect(typeof state.ledger[0].detail).toBe('string')
  })

  it('hides the D33 mirror subtask from the review surface', () => {
    const dto = seedImportReviewStateDTO()
    dto.tasks[0].subtasks.push({
      ...dto.tasks[0].subtasks[0],
      id: '00000000-0000-0000-0000-0000000000aa',
      title: 'mirror',
      system_generated: true,
    })

    const state = mapScheduleReviewStateDTO(dto)

    expect(state.tasks[0].subtasks.map((s) => s.title)).not.toContain('mirror')
  })

  it('reads the relationships the file stated that were not imported', () => {
    const { report, dependencies } = mapScheduleReviewStateDTO(
      seedP8ImportReviewStateDTO(),
    )

    expect(report.skippedEdges.map((edge) => edge.reason)).toEqual([
      'unconvertible_lag',
      'unresolved_reference',
    ])
    expect(report.skippedEdges[0]).toMatchObject({
      sheet: 'Task_Table',
      row: 8,
      text: '3FC+2 díast',
    })
    expect(report.skippedEdgesTotal).toBe(2)
    // The parsed edges keep their provenance and their PDM shape.
    expect(dependencies.every((edge) => edge.source === 'project_import')).toBe(
      true,
    )
    expect(dependencies.map((edge) => edge.relationshipType)).toContain('SS')
  })

  it('reads a contract older than 2.2 as nothing skipped', () => {
    const { report } = mapScheduleReviewStateDTO(seedImportReviewStateDTO())

    expect(report.skippedEdges).toEqual([])
    expect(report.skippedEdgesTotal).toBe(0)
  })

  it('keeps a date column settled by weekday names (contract 2.3)', () => {
    const dto = seedImportReviewStateDTO()
    const [assumption] = dto.report.date_assumptions as Record<
      string,
      unknown
    >[]
    const state = mapScheduleReviewStateDTO({
      ...dto,
      report: {
        ...dto.report,
        date_assumptions: [{ ...assumption, settled_by_code: 'weekday_names' }],
      },
    })

    expect(state.report.dateAssumptions[0].settledByCode).toBe('weekday_names')
  })

  it('survives a report shape it does not know', () => {
    const dto = seedImportReviewStateDTO()
    // ms-ai owns the report shape and may add to it without a bk deploy.
    const state = mapScheduleReviewStateDTO({
      ...dto,
      report: { rows_imported: 'not a number', brand_new_field: [1, 2] },
      ledger: 'not a list' as never,
      quality: null as never,
    })

    expect(state.report.rowsImported).toBe(0)
    expect(state.ledger).toEqual([])
    expect(state.quality.reasons).toEqual([])
  })

  it('reads the currency the file names and the one the draft is in (2.6)', () => {
    const dto = seedImportReviewStateDTO()
    const state = mapScheduleReviewStateDTO({
      ...dto,
      file_budget: 'foreign_currency',
      project: { ...dto.project, currency: 'CLP' },
      report: { ...dto.report, cost_currency: 'CLF' },
    })

    expect(state.fileBudget).toBe('foreign_currency')
    expect(state.report.costCurrency).toBe('CLF')
    expect(state.project.currency).toBe('CLP')
  })

  it('reads a draft from before currencies as USD, naming none for the file', () => {
    const dto = seedImportReviewStateDTO()
    const state = mapScheduleReviewStateDTO({
      ...dto,
      project: { ...dto.project, currency: undefined },
      report: { ...dto.report, cost_currency: 'EUR' },
    })

    expect(state.project.currency).toBe('USD')
    expect(state.report.costCurrency).toBeNull()
  })
})

describe('mapImportJobStatusDTO', () => {
  it('maps the job that landed the seeded draft', () => {
    const job = mapImportJobStatusDTO(seedImportJobStatusDTO())

    expect(job.status).toBe('draft_ready')
    expect(job.terminal).toBe(true)
    expect(job.projectId).not.toBeNull()
  })

  it('carries report and ledger on a diverted job (Lane F has no draft)', () => {
    const job = mapImportJobStatusDTO(seedDivertedImportJobStatusDTO())

    expect(job.status).toBe('needs_assisted_mapping')
    expect(job.projectId).toBeNull()
    expect(job.report.rowsScanned).toBeGreaterThan(0)
    expect(job.ledger.length).toBeGreaterThan(0)
  })

  it('treats an unknown status as failed rather than as a schedule', () => {
    const job = mapImportJobStatusDTO({
      ...seedImportJobStatusDTO(),
      status: 'teleported' as never,
    })

    expect(job.status).toBe('failed')
  })
})

describe('mapImportUploadResponseDTO', () => {
  it('keeps the job handle the FE branches on', () => {
    const result = mapImportUploadResponseDTO(seedImportUploadDTO())

    expect(result.importJobId).toBeTruthy()
    expect(result.previousImport).toBeNull()
  })

  it('normalizes the optional handles to null when omitted', () => {
    const dto = seedImportUploadDTO()
    delete dto.import_id
    delete dto.import_job_id
    delete dto.outcome

    const result = mapImportUploadResponseDTO(dto)

    expect(result.importId).toBeNull()
    expect(result.importJobId).toBeNull()
    expect(result.outcome).toBeNull()
    expect(result.projectId).toBe(dto.project_id)
    expect(result.fileName).toBe(dto.filename)
  })

  it('maps a re-import warning with its conflicts (6.3)', () => {
    const dto = seedImportUploadDTO()
    dto.previous_import = {
      import_id: SEED_SCHEDULE_IMPORT.id,
      project_id: SEED_SCHEDULE_IMPORT.projectId,
      project_name: 'Ampliacion Bodega Logistica',
      source_filename: SEED_SCHEDULE_IMPORT.sourceFilename,
      is_draft: true,
      overlap: 0.9,
      conflicts: [
        {
          task_id: SEED_IDS.P1_TASK_FOUNDATION,
          ref: '1',
          title: 'Cimentacion',
          field: 'due_date',
          imported_value: '2026-02-05',
          current_value: '2026-03-01',
        },
      ],
    }

    const previous = mapImportUploadResponseDTO(dto).previousImport

    expect(previous?.importId).toBe(SEED_SCHEDULE_IMPORT.id)
    expect(previous?.projectId).toBe(SEED_SCHEDULE_IMPORT.projectId)
    expect(previous?.sourceFilename).toBe(SEED_SCHEDULE_IMPORT.sourceFilename)
    expect(previous?.isDraft).toBe(true)
    expect(previous?.overlap).toBe(0.9)
    expect(previous?.conflicts).toEqual([
      {
        taskId: SEED_IDS.P1_TASK_FOUNDATION,
        ref: '1',
        title: 'Cimentacion',
        field: 'due_date',
        importedValue: '2026-02-05',
        currentValue: '2026-03-01',
      },
    ])
  })
})

describe('readPlanQuotaFailure', () => {
  it('reads the structured 400 ms-bk raises at the plan ceiling', () => {
    const failure = readPlanQuotaFailure({
      status: 400,
      data: {
        detail: {
          code: 'plan_project_limit_exceeded',
          message: 'Plan limit exceeded: maximum 10 projects allowed',
          limit: 10,
          current: 10,
        },
      },
    })

    expect(failure).toEqual({
      code: 'plan_project_limit_exceeded',
      limit: 10,
      current: 10,
      message: 'Plan limit exceeded: maximum 10 projects allowed',
    })
  })

  it('reads a ceiling with no numeric limit as null, not 0', () => {
    const failure = readPlanQuotaFailure({
      status: 400,
      data: {
        detail: { code: 'plan_draft_limit_exceeded', message: 'ceiling' },
      },
    })

    expect(failure?.code).toBe('plan_draft_limit_exceeded')
    expect(failure?.limit).toBeNull()
    expect(failure?.current).toBe(0)
  })

  it('ignores any other failure so the caller keeps its generic path', () => {
    expect(readPlanQuotaFailure({ status: 500, data: {} })).toBeNull()
    expect(
      readPlanQuotaFailure({ status: 400, data: { detail: 'plain string' } }),
    ).toBeNull()
  })
})

describe('readImportFailureCode', () => {
  it('reads a known code off a 422', () => {
    expect(
      readImportFailureCode({
        status: 422,
        data: {
          detail: { code: 'invalid_file_signature', import_job_id: 'x' },
        },
      }),
    ).toBe('invalid_file_signature')
  })

  it.each([
    {
      name: 'a 400 carrying a known code',
      error: {
        status: 400,
        data: { detail: { code: 'invalid_file_signature' } },
      },
    },
    {
      name: 'an unknown code',
      error: {
        status: 422,
        data: { detail: { code: 'needs_assisted_mapping' } },
      },
    },
    {
      name: 'a string detail',
      error: { status: 422, data: { detail: 'Unprocessable' } },
    },
    { name: 'no data at all', error: { status: 422 } },
  ])('is null for $name', ({ error }) => {
    expect(readImportFailureCode(error)).toBeNull()
  })
})

describe('readAssistedMappingDivert', () => {
  it('reads the 422 that routes to Lane F', () => {
    const divert = readAssistedMappingDivert({
      status: 422,
      data: { detail: seedImportAssistedMappingErrorDTO() },
    })

    expect(divert?.importJobId).toBe(FIXTURE_DIVERTED_JOB_ID)
  })

  it('ignores the other 422 (a file that needs normalization)', () => {
    expect(
      readAssistedMappingDivert({
        status: 422,
        data: { detail: { code: 'needs_normalization', message: 'nope' } },
      }),
    ).toBeNull()
  })
})

describe('mapLedgerEntry', () => {
  it('keeps the llm_mapping cause a rescue contract carries', () => {
    // Unknown causes fall back to date_format — which is exactly what a
    // model-rescued ledger entry must never degrade into.
    const entry = mapLedgerEntry({
      cause: 'llm_mapping',
      scope: 'sheet',
      consequence: 'high',
      chosen: 'model_mapped',
      alternative_value: null,
      alternative_action: 'none',
      affected_rows: 9,
    })

    expect(entry.cause).toBe('llm_mapping')
  })
})
