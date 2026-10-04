/**
 * The `lennix_pro` seed, mirrored for the frontend.
 *
 * `lennix-pro-seed.generated.ts` is derived from `lennix-ms-bk`'s seed modules
 * by `pnpm seed:sync` and guarded by `seed-sync.test.ts`. Fixtures in
 * `src/tests/fixtures/` turn these facts into API DTOs; MSW serves those
 * fixtures. Nothing in the test suite should invent demo data of its own.
 */
export {
  SEED_BROKEN_DEPENDENCY,
  SEED_DEPENDENCIES,
  SEED_EXPENSES,
  SEED_FORCE_START,
  SEED_IDS,
  SEED_IMPORT_JOB,
  SEED_ORGANIZATION,
  SEED_PLANS,
  SEED_PROJECTS,
  SEED_ROLES,
  SEED_P8_SCHEDULE_IMPORT,
  SEED_SCHEDULE_IMPORT,
  SEED_TASKS,
  SEED_USERS,
  type SeedContractEdge,
  type SeedContractRow,
  type SeedDemoTask,
  type SeedExpense,
  type SeedPlan,
  type SeedProject,
  type SeedScheduleImport,
  type SeedTask,
  type SeedUser,
  SEED_SUBTASK_NOTES,
} from './lennix-pro-seed.generated'
