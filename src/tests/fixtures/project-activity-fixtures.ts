/**
 * `GET /v1/projects/:id/activity` — the project Historial.
 *
 * The generated manifest does not carry these rows: the backend seed
 * (`app/seeds/lennix_pro/16_project_activity.py`) stamps every `occurred_at`
 * relative to `datetime.now()`, so there is no stable seed fact to mirror. What
 * *is* a seed fact — which project, which activity, which user — is resolved
 * through `seed-lookup` exactly like every other fixture; the rest is declared
 * here as `FIXTURE_*`, a test concern rather than a seed fact.
 */

import { SEED_IDS } from '@/tests/seed'
import { PROJECT_ACTIVITY_ACTIONS, type ProjectActivityAction } from '@/types'
import type { ProjectActivityResponseDTO } from '@/types/dto/project-dto'

import { seedTask, seedUserName } from './seed-lookup'

/** The instant the newest row happened. Rows step backwards from here. */
export const FIXTURE_ACTIVITY_LATEST_AT = '2026-07-24T15:30:00Z'
const FIXTURE_ACTIVITY_EARLIER_AT = '2026-07-24T09:05:00Z'
/** The previous calendar day, so the timeline has more than one date heading. */
export const FIXTURE_ACTIVITY_PREVIOUS_DAY_AT = '2026-07-23T18:40:00Z'

/** Activity ids mirror the seed's `21000000-0000-{seq}-0000-...` scheme. */
const activityId = (seq: number) =>
  `21000000-0000-${String(seq).padStart(4, '0')}-0000-000000000000`

function row(
  seq: number,
  action: ProjectActivityAction,
  fields: Omit<ProjectActivityResponseDTO, 'id' | 'action'>,
): ProjectActivityResponseDTO {
  return { id: activityId(seq), action, ...fields }
}

/**
 * Torre Residencial Norte's record, mirroring the shape the backend seed
 * writes: a completion, a progress report, a cascade with **no actor**, and a
 * dependency edit — a change that notifies nobody and that the old
 * notification-backed Historial lost entirely.
 */
export function seedProjectActivityListDTO(): ProjectActivityResponseDTO[] {
  return [
    row(1, 'task.completed', {
      occurred_at: FIXTURE_ACTIVITY_LATEST_AT,
      actor_id: SEED_IDS.USER_MIGUEL_ID,
      actor_name: seedUserName(SEED_IDS.USER_MIGUEL_ID),
      entity_type: 'task',
      entity_id: SEED_IDS.P1_TASK_FOUNDATION,
      entity_name: seedTask(SEED_IDS.P1_TASK_FOUNDATION).title,
      old_value: 'in_progress',
      new_value: 'done',
    }),
    // Cascades have no human actor — the system unblocked it.
    row(3, 'task.unblocked', {
      occurred_at: FIXTURE_ACTIVITY_EARLIER_AT,
      actor_id: null,
      actor_name: null,
      entity_type: 'task',
      entity_id: SEED_IDS.P1_TASK_STRUCTURE,
      entity_name: seedTask(SEED_IDS.P1_TASK_STRUCTURE).title,
      old_value: null,
      new_value: 'false',
    }),
    row(2, 'subtask.progress_updated', {
      occurred_at: FIXTURE_ACTIVITY_PREVIOUS_DAY_AT,
      actor_id: SEED_IDS.USER_ROBERTO_ID,
      actor_name: seedUserName(SEED_IDS.USER_ROBERTO_ID),
      entity_type: 'subtask',
      entity_id: SEED_IDS.P1_SUB_EXCAVATION,
      entity_name: seedTask(SEED_IDS.P1_SUB_EXCAVATION).title,
      old_value: '60',
      new_value: '100',
    }),
    // Notifies nobody — the Historial records it anyway.
    row(4, 'dependency.created', {
      occurred_at: FIXTURE_ACTIVITY_PREVIOUS_DAY_AT,
      actor_id: SEED_IDS.USER_MIGUEL_ID,
      actor_name: seedUserName(SEED_IDS.USER_MIGUEL_ID),
      entity_type: 'dependency',
      entity_id: '1',
      entity_name: seedTask(SEED_IDS.P1_TASK_STRUCTURE).title,
      old_value: seedTask(SEED_IDS.P1_TASK_FOUNDATION).title,
      new_value: 'inter_phase',
    }),
  ]
}

/**
 * One row per member of the backend's action enum — what the exhaustiveness
 * test reads, so a key without a real sentence fails loudly instead of
 * rendering blank.
 */
export function seedEveryProjectActivityActionDTO(): ProjectActivityResponseDTO[] {
  return PROJECT_ACTIVITY_ACTIONS.map((action, index) => {
    const entityType = action.startsWith('subtask')
      ? 'subtask'
      : action.startsWith('dependency')
        ? 'dependency'
        : action.startsWith('expense')
          ? 'expense'
          : action.startsWith('risk')
            ? 'risk'
            : action.startsWith('project')
              ? 'project'
              : 'task'
    return row(100 + index, action, {
      occurred_at: FIXTURE_ACTIVITY_LATEST_AT,
      actor_id: SEED_IDS.USER_MIGUEL_ID,
      actor_name: seedUserName(SEED_IDS.USER_MIGUEL_ID),
      entity_type: entityType,
      entity_id: SEED_IDS.P1_TASK_FOUNDATION,
      entity_name: seedTask(SEED_IDS.P1_TASK_FOUNDATION).title,
      // Plausible for every family: a status key, a percentage, a date range,
      // a predecessor name, an amount, and — for an approval decision — the
      // name of whoever asked all arrive in `old_value` depending on
      // action. `force_start.requested` carries none: there the actor already
      // *is* the requester.
      old_value: action.endsWith('.status_changed')
        ? 'todo'
        : action.endsWith('.rescheduled')
          ? '2026-03-01 → 2026-05-30'
          : action.startsWith('dependency')
            ? seedTask(SEED_IDS.P1_TASK_STRUCTURE).title
            : action.startsWith('budget_approval.')
              ? '120000.00'
              : action === 'force_start.requested'
                ? null
                : action.startsWith('force_start.')
                  ? seedUserName(SEED_IDS.USER_FERNANDO_ID)
                  : '60',
      new_value: action.endsWith('.status_changed')
        ? 'in_progress'
        : action.endsWith('.rescheduled')
          ? '2026-03-15 → 2026-06-20'
          : action === 'dependency.updated'
            ? 'FS +2d'
            : action === 'expense.recorded'
              ? '1500.00'
              : action.startsWith('budget_approval.')
                ? '150000.00'
                : action.startsWith('force_start.')
                  ? null
                  : '100',
    })
  })
}

/** Wraps rows in the backend's `Page` envelope. */
export function seedProjectActivityPageDTO(
  items: ProjectActivityResponseDTO[] = seedProjectActivityListDTO(),
  overrides: { total?: number; page?: number; pageSize?: number } = {},
) {
  const pageSize = overrides.pageSize ?? 25
  const total = overrides.total ?? items.length
  return {
    items,
    total,
    page: overrides.page ?? 1,
    page_size: pageSize,
    total_pages: Math.max(1, Math.ceil(total / pageSize)),
  }
}
