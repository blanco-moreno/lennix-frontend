import type {
  BudgetVariance,
  CostReport,
  ExpenseItem,
  ProjectExpense,
} from '@/types'
import type {
  BudgetVarianceResponseDTO,
  CostReportResponseDTO,
  ExpenseResponseDTO,
  ProjectExpenseResponseDTO,
} from '@/types/dto/expense-dto'
import { parseMoney, toIndirectCategory } from '@/utils'

export function mapExpenseResponseDTOToExpenseItem(
  dto: ExpenseResponseDTO,
): ExpenseItem {
  return {
    id: dto.id,
    projectId: dto.project_id ?? null,
    subtaskId: dto.subtask_id ?? null,
    description: dto.description,
    amount: parseMoney(dto.amount),
    category: dto.category,
    indirectCategory: toIndirectCategory(dto.indirect_category),
    expenseDate: dto.expense_date,
    documentType: dto.document_type ?? null,
    documentNumber: dto.document_number ?? null,
    attachmentFilename: dto.attachment_filename ?? null,
    attachmentSizeBytes: dto.attachment_size_bytes ?? null,
    attachmentContentType: dto.attachment_content_type ?? null,
    hasAttachment: dto.has_attachment ?? false,
    createdBy: dto.created_by,
    createdAt: dto.created_at,
  }
}

export function mapProjectExpenseResponseDTOToProjectExpense(
  dto: ProjectExpenseResponseDTO,
): ProjectExpense {
  return {
    ...mapExpenseResponseDTOToExpenseItem(dto),
    taskId: dto.task_id ?? null,
    taskTitle: dto.task_title ?? null,
    subtaskTitle: dto.subtask_title ?? null,
  }
}

export function mapBudgetVarianceResponseDTOToBudgetVariance(
  dto: BudgetVarianceResponseDTO,
): BudgetVariance {
  return {
    entityId: dto.entity_id,
    entityName: dto.entity_name,
    entityType: dto.entity_type,
    budget: dto.budget !== null ? parseMoney(dto.budget) : null,
    spent: parseMoney(dto.spent),
    remaining: parseMoney(dto.remaining),
    variance: parseMoney(dto.variance),
    variancePercentage: dto.variance_percentage,
    isOverBudget: dto.is_over_budget,
  }
}

export function mapCostReportResponseDTOToCostReport(
  dto: CostReportResponseDTO,
): CostReport {
  return {
    projectId: dto.project_id,
    budget: dto.budget !== null ? parseMoney(dto.budget) : null,
    allocated: parseMoney(dto.allocated),
    unallocated: parseMoney(dto.unallocated),
    spent: parseMoney(dto.spent),
    remaining: parseMoney(dto.remaining),
    isOverBudget: dto.is_over_budget,
    utilizationPercentage: dto.utilization_percentage,
    categoryBreakdown: Object.fromEntries(
      Object.entries(dto.category_breakdown).map(([k, v]) => [
        k,
        parseMoney(v),
      ]),
    ),
    taskVariances: dto.task_variances.map(
      mapBudgetVarianceResponseDTOToBudgetVariance,
    ),
  }
}

export function mapProjectExpenseArrayToProjectExpenses(
  dto: ProjectExpenseResponseDTO[],
): ProjectExpense[] {
  return dto.map(mapProjectExpenseResponseDTOToProjectExpense)
}
