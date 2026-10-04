/** PDM relationship types. Predecessor → successor. */
export type RelationshipType = 'FS' | 'SS' | 'FF' | 'SF'

/** Who drew an edge: parsed from a P6 / MS Project export, or by a person. */
export type DependencySource = 'project_import' | 'manual'

export interface TaskDependency {
  id: number
  taskId: string
  dependsOnId: string
  dependencyType: string
  relationshipType: RelationshipType
  lagDays: number
  createdAt: string
}

export interface DependencyNodeTask {
  id: string
  title: string
  status: string
  priority: string
  progress: number
  startDate: string | null
  dueDate: string | null
  delayReason: string | null
  delayDays: number
  isBlocked: boolean
  forceStarted: boolean
}

export interface DependencyNode {
  id: string
  task: DependencyNodeTask
  /** Null when the predecessor is gone entirely — the edge points nowhere. */
  dependsOn: DependencyNodeTask | null
  relationshipType: RelationshipType
  lagDays: number
  /** Predecessor soft-deleted or dangling; a re-link is the only fix. */
  isBroken: boolean
}

export interface DependencyChain {
  interPhase: DependencyNode[]
  intraPhase: Record<string, DependencyNode[]>
}
