import { http, HttpResponse } from 'msw'

import { pageOf } from '@/tests/fixtures'

/**
 * The budget half of the approvals bandeja.
 *
 * The `lennix_pro` seed carries no budget-approval rows — an approval is a
 * runtime event, not seeded state — so the honest answer is an empty page. The
 * handler exists because without it the bandeja's own request escapes to the
 * network: an empty section is data, an unhandled request is a broken screen.
 */
export const listBudgetApprovalsHandler = http.get(
  '*/v1/budget-approvals',
  () => {
    return HttpResponse.json(pageOf([]))
  },
)

export const budgetApprovalHandlers = [listBudgetApprovalsHandler]
