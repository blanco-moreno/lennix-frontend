import {
  authHandlers,
  organizationHandlers,
  projectHandlers,
  taskHandlers,
  expenseHandlers,
  analyticsHandlers,
  projectImportHandlers,
  riskHandlers,
  forceStartHandlers,
  budgetApprovalHandlers,
} from './handlers/index'

export const handlers = [
  ...authHandlers,
  ...organizationHandlers,
  ...projectHandlers,
  ...taskHandlers,
  ...expenseHandlers,
  ...analyticsHandlers,
  ...projectImportHandlers,
  ...riskHandlers,
  ...forceStartHandlers,
  ...budgetApprovalHandlers,
]
