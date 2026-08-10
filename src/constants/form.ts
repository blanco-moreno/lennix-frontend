/**
 * Sentinel for "no assignee" in assignee selects — Chakra's Select cannot
 * carry an empty-string item value, so this token stands in and is mapped
 * to null (or an omitted field) at the wire.
 */
export const UNASSIGNED = '__none__'
