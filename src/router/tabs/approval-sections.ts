/**
 * The approvals home's sections; the open section lives in the URL (`?section=`).
 * The resolver takes the sections the user can open and lands a stale link on
 * their first one instead of an empty pane.
 */

export const APPROVAL_SECTIONS = ['budget', 'force-start'] as const

export type ApprovalSection = (typeof APPROVAL_SECTIONS)[number]

export const APPROVAL_SECTION_PARAM = 'section'

export function resolveApprovalSection(
  value: string | null | undefined,
  available: readonly ApprovalSection[],
): ApprovalSection | undefined {
  return available.find((section) => section === value) ?? available[0]
}
