import type {
  TaskDependency,
  DependencyChain,
  DependencyNode,
  DependencyNodeTask,
} from '@/types'
import type {
  TaskDependencyResponseDTO,
  DependencyChainResponseDTO,
  DependencyNodeTaskDTO,
} from '@/types/dto/dependency-dto'

function mapDependencyNodeTaskDTO(
  dto: DependencyNodeTaskDTO,
): DependencyNodeTask {
  return {
    id: dto.id,
    title: dto.title,
    status: dto.status,
    priority: dto.priority,
    progress: dto.progress,
    startDate: dto.start_date,
    dueDate: dto.due_date,
    delayReason: dto.delay_reason,
    delayDays: dto.delay_days,
    isBlocked: dto.is_blocked,
    forceStarted: dto.force_started,
  }
}

function mapDependencyNodeDTO(
  dto: DependencyChainResponseDTO['inter_phase'][number],
): DependencyNode {
  return {
    id: dto.id,
    task: mapDependencyNodeTaskDTO(dto.task),
    // A broken edge keeps its successor and loses its predecessor — that null
    // is the state the re-link affordance acts on, not a mapping gap.
    dependsOn: dto.depends_on ? mapDependencyNodeTaskDTO(dto.depends_on) : null,
    relationshipType: dto.relationship_type,
    lagDays: dto.lag_days,
    isBroken: dto.is_broken,
  }
}

export function mapTaskDependencyResponseDTOToTaskDependency(
  dto: TaskDependencyResponseDTO,
): TaskDependency {
  return {
    id: dto.id,
    taskId: dto.task_id,
    dependsOnId: dto.depends_on_id,
    dependencyType: dto.dependency_type,
    relationshipType: dto.relationship_type,
    lagDays: dto.lag_days,
    createdAt: dto.created_at,
  }
}

export function mapDependencyChainResponseDTOToDependencyChain(
  dto: DependencyChainResponseDTO,
): DependencyChain {
  const intraPhase: Record<string, DependencyNode[]> = {}
  for (const [key, nodes] of Object.entries(dto.intra_phase)) {
    intraPhase[key] = nodes.map(mapDependencyNodeDTO)
  }
  return {
    interPhase: dto.inter_phase.map(mapDependencyNodeDTO),
    intraPhase,
  }
}
