import {
  DEFAULT_SEED_PROJECT_ID,
  seedBudgetVarianceDTO,
  seedCostReportDTO,
  seedExpenseDTO,
  seedProjectExpenseListDTO,
  seedSubtaskExpenseListDTO,
} from '@/tests/fixtures'
import { SEED_EXPENSES, SEED_IDS } from '@/tests/seed'

import {
  mapBudgetVarianceResponseDTOToBudgetVariance,
  mapCostReportResponseDTOToCostReport,
  mapExpenseResponseDTOToExpenseItem,
  mapProjectExpenseArrayToProjectExpenses,
  mapProjectExpenseResponseDTOToProjectExpense,
} from './expense-mapper'

const FIRST_SEED_EXPENSE_ID = SEED_EXPENSES[0].id

describe('mapExpenseResponseDTOToExpenseItem', () => {
  it('maps the first seeded expense field by field', () => {
    const dto = seedExpenseDTO(FIRST_SEED_EXPENSE_ID)

    const item = mapExpenseResponseDTOToExpenseItem(dto)

    expect(item.id).toBe(FIRST_SEED_EXPENSE_ID)
    expect(item.subtaskId).toBe(SEED_IDS.P1_SUB_EXCAVATION)
    expect(item.description).toBe('Mano de obra excavacion')
    // '28000.00' on the wire → the number 28000 in the domain.
    expect(item.amount).toBe(28000)
    expect(item.category).toBe('labor')
    expect(item.expenseDate).toBe(dto.expense_date)
    expect(item.createdBy).toBe(dto.created_by)
    expect(item.createdAt).toBe(dto.created_at)
  })
})

describe('mapProjectExpenseResponseDTOToProjectExpense', () => {
  it('adds the joined task context on top of the expense shape', () => {
    const dtos = seedProjectExpenseListDTO(DEFAULT_SEED_PROJECT_ID)
    expect(dtos.length).toBeGreaterThan(0)
    const dto = dtos[0]

    const expense = mapProjectExpenseResponseDTOToProjectExpense(dto)

    expect(expense.id).toBe(dto.id)
    expect(expense.amount).toBe(Number(dto.amount))
    expect(expense.taskId).toBe(dto.task_id)
    expect(expense.taskTitle).toBe(dto.task_title)
    expect(expense.subtaskTitle).toBe(dto.subtask_title)
  })

  it('maps the project listing one to one', () => {
    const dtos = seedProjectExpenseListDTO(DEFAULT_SEED_PROJECT_ID)

    const expenses = mapProjectExpenseArrayToProjectExpenses(dtos)

    expect(expenses).toHaveLength(dtos.length)
    expect(expenses.map((expense) => expense.id)).toEqual(
      dtos.map((dto) => dto.id),
    )
  })
})

describe('mapBudgetVarianceResponseDTOToBudgetVariance', () => {
  it('parses every money string on the seeded Cimentacion variance', () => {
    const dto = seedBudgetVarianceDTO(SEED_IDS.P1_TASK_FOUNDATION)

    const variance = mapBudgetVarianceResponseDTOToBudgetVariance(dto)

    expect(variance.entityId).toBe(SEED_IDS.P1_TASK_FOUNDATION)
    expect(variance.entityName).toBe(dto.entity_name)
    expect(variance.entityType).toBe('task')
    expect(variance.budget).toBe(Number(dto.budget))
    expect(variance.spent).toBe(Number(dto.spent))
    expect(variance.remaining).toBe(Number(dto.remaining))
    expect(variance.variance).toBe(Number(dto.variance))
    expect(variance.variancePercentage).toBe(dto.variance_percentage)
    expect(variance.isOverBudget).toBe(dto.is_over_budget)
  })

  it('keeps a null budget null (target had no budget set)', () => {
    const dto = {
      ...seedBudgetVarianceDTO(SEED_IDS.P1_TASK_FOUNDATION),
      budget: null,
    }

    expect(mapBudgetVarianceResponseDTOToBudgetVariance(dto).budget).toBeNull()
  })
})

describe('mapCostReportResponseDTOToCostReport', () => {
  it('maps the seeded cost report with numeric category totals', () => {
    const dto = seedCostReportDTO(DEFAULT_SEED_PROJECT_ID)

    const report = mapCostReportResponseDTOToCostReport(dto)

    expect(report.projectId).toBe(DEFAULT_SEED_PROJECT_ID)
    expect(report.budget).toBe(850000)
    expect(report.allocated).toBe(Number(dto.allocated))
    expect(report.unallocated).toBe(Number(dto.unallocated))
    expect(report.spent).toBe(Number(dto.spent))
    expect(report.remaining).toBe(Number(dto.remaining))
    expect(report.isOverBudget).toBe(dto.is_over_budget)
    expect(report.utilizationPercentage).toBe(dto.utilization_percentage)

    // Every category survives, and its string total becomes a number.
    expect(Object.keys(report.categoryBreakdown).sort()).toEqual(
      Object.keys(dto.category_breakdown).sort(),
    )
    for (const [category, total] of Object.entries(dto.category_breakdown)) {
      expect(report.categoryBreakdown[category]).toBe(Number(total))
    }

    expect(report.taskVariances).toHaveLength(dto.task_variances.length)
    expect(report.taskVariances.length).toBeGreaterThan(0)
    expect(report.taskVariances[0].entityId).toBe(
      dto.task_variances[0].entity_id,
    )
    expect(report.taskVariances[0].spent).toBe(
      Number(dto.task_variances[0].spent),
    )
  })

  it('keeps a null project budget null', () => {
    const dto = { ...seedCostReportDTO(DEFAULT_SEED_PROJECT_ID), budget: null }

    expect(mapCostReportResponseDTOToCostReport(dto).budget).toBeNull()
  })
})

describe('subtask expense listing', () => {
  it('serves the excavation subtask its two seeded expenses', () => {
    const dtos = seedSubtaskExpenseListDTO(SEED_IDS.P1_SUB_EXCAVATION)
    expect(dtos.length).toBeGreaterThan(0)

    const items = dtos.map(mapExpenseResponseDTOToExpenseItem)

    items.forEach((item) => {
      expect(item.subtaskId).toBe(SEED_IDS.P1_SUB_EXCAVATION)
      expect(Number.isFinite(item.amount)).toBe(true)
    })
  })
})
