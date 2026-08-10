/** `/v1/expenses` responses for the seeded expenses. */

import { SEED_EXPENSES, type SeedExpense } from '@/tests/seed'
import type {
  BudgetVarianceResponseDTO,
  CostReportResponseDTO,
  ExpenseResponseDTO,
  ProjectExpenseResponseDTO,
} from '@/types/dto/expense-dto'

import { seedProject, FIXTURE_CREATED_AT, seedTask } from './seed-lookup'

function expensesOf(projectId: string): SeedExpense[] {
  return SEED_EXPENSES.filter(
    (expense) => seedTask(expense.subtaskId).projectId === projectId,
  )
}

function toExpenseDTO(expense: SeedExpense): ExpenseResponseDTO {
  return {
    id: expense.id,
    subtask_id: expense.subtaskId,
    description: expense.description,
    amount: Number(expense.amount).toFixed(2),
    // The generated seed mirror types this as `string`; the values come from
    // the enum-validated backend seed, so the narrowing is safe.
    category: expense.category as ExpenseResponseDTO['category'],
    expense_date: expense.expenseDate,
    created_by: expense.createdBy,
    created_at: FIXTURE_CREATED_AT,
  }
}

/** Adds the parent-task context the project-scoped listing joins in. */
function toProjectExpenseDTO(expense: SeedExpense): ProjectExpenseResponseDTO {
  const subtask = seedTask(expense.subtaskId)
  if (subtask.parentId === null)
    throw new Error(`expense ${expense.id} is not attached to a subtask`)
  return {
    ...toExpenseDTO(expense),
    task_id: subtask.parentId,
    task_title: seedTask(subtask.parentId).title,
    subtask_title: subtask.title,
  }
}

export function seedExpenseDTO(expenseId: string): ExpenseResponseDTO {
  const expense = SEED_EXPENSES.find((candidate) => candidate.id === expenseId)
  if (!expense) throw new Error(`expense ${expenseId} is not in the seed`)
  return toExpenseDTO(expense)
}

export function seedProjectExpenseListDTO(
  projectId: string,
): ProjectExpenseResponseDTO[] {
  return expensesOf(projectId).map(toProjectExpenseDTO)
}

export function seedSubtaskExpenseListDTO(
  subtaskId: string,
): ExpenseResponseDTO[] {
  return SEED_EXPENSES.filter((expense) => expense.subtaskId === subtaskId).map(
    toExpenseDTO,
  )
}

/** `GET /v1/expenses/tasks/:id/variance` for a seeded parent task. */
export function seedBudgetVarianceDTO(
  taskId: string,
): BudgetVarianceResponseDTO {
  const task = seedTask(taskId)
  const budget = Number(task.budget ?? 0)
  const spent = Number(task.spent)
  const variance = budget - spent
  return {
    entity_id: task.id,
    entity_name: task.title,
    entity_type: task.parentId === null ? 'task' : 'subtask',
    budget: task.budget === null ? null : budget.toFixed(2),
    spent: spent.toFixed(2),
    remaining: variance.toFixed(2),
    variance: variance.toFixed(2),
    variance_percentage:
      budget > 0 ? Number(((variance / budget) * 100).toFixed(2)) : 0,
    is_over_budget: spent > budget,
  }
}

/** `GET /v1/expenses/projects/:id/cost-report` — totals from the seeded rows. */
export function seedCostReportDTO(projectId: string): CostReportResponseDTO {
  const project = seedProject(projectId)
  const budget = Number(project.budget ?? 0)
  const allocated = Number(project.allocated)
  const spent = Number(project.spent)

  const categoryBreakdown: Record<string, string> = {}
  for (const expense of expensesOf(projectId)) {
    const current = Number(categoryBreakdown[expense.category] ?? 0)
    categoryBreakdown[expense.category] = (
      current + Number(expense.amount)
    ).toFixed(2)
  }

  return {
    project_id: project.id,
    budget: project.budget === null ? null : budget.toFixed(2),
    allocated: allocated.toFixed(2),
    unallocated: (budget - allocated).toFixed(2),
    spent: spent.toFixed(2),
    remaining: (budget - spent).toFixed(2),
    is_over_budget: project.isOverBudget,
    utilization_percentage:
      budget > 0 ? Number(((spent / budget) * 100).toFixed(2)) : 0,
    category_breakdown: categoryBreakdown,
    task_variances: seedParentTaskIds(projectId).map(seedBudgetVarianceDTO),
  }
}

function seedParentTaskIds(projectId: string): string[] {
  return SEED_EXPENSES.filter(
    (expense) => seedTask(expense.subtaskId).projectId === projectId,
  )
    .map((expense) => seedTask(expense.subtaskId).parentId)
    .filter((parentId): parentId is string => parentId !== null)
    .filter((parentId, index, all) => all.indexOf(parentId) === index)
}
