import { Box, Flex, Stack } from '@chakra-ui/react'
import { AlertCircle, Pencil, Plus, ShieldAlert, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import {
  Alert,
  Badge,
  Button,
  Card,
  EmptyState,
  Heading,
  Skeleton,
  Text,
} from '@/components'
import { useDelayReasonLabel, usePermission } from '@/hooks'
import { useIntlToast } from '@/i18n'
import { useGetDelayAnalysisQuery } from '@/services/analytics'
import {
  useDeleteRiskMutation,
  useListRiskSuggestionsQuery,
  useListRisksQuery,
} from '@/services/risk'
import { riskSeverity, type Risk } from '@/types'

import { RiskFormDrawer } from './components/risk-form-drawer'
import { RiskMatrix, type RiskMatrixCell } from './components/risk-matrix'
import { RiskSuggestions } from './components/risk-suggestions'
import {
  LEVEL_LABEL,
  SEVERITY_BADGE,
  STATUS_LABEL,
  STRATEGY_LABEL,
} from './constants'
import { riskRegisterMessages as m } from './risk-register-messages'

interface RiskRegisterProps {
  projectId: string
  projectName: string
}

/**
 * The project risk register — the Riesgos tab's content, with the delay-cause
 * distribution (answered nowhere else) beneath it.
 */
export function RiskRegister({ projectId, projectName }: RiskRegisterProps) {
  const intl = useIntl()
  const toast = useIntlToast()
  const delayReasonLabel = useDelayReasonLabel()
  // Role-scoped access, second half — create/edit/delete had no permission
  // check of their own; every role that can view the register could also
  // write to it. View stays open via `project.tabs.risks.view`.
  const canManageRisks = usePermission('project.risks.manage')

  const [cell, setCell] = useState<RiskMatrixCell | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Risk | null>(null)
  const [suggestedTitle, setSuggestedTitle] = useState<string | undefined>()

  const {
    data: risks = [],
    isLoading,
    error,
  } = useListRisksQuery({ projectId })
  const { data: suggestions = [] } = useListRiskSuggestionsQuery(projectId)
  const { data: delayAnalysis } = useGetDelayAnalysisQuery(projectId)
  const [deleteRisk] = useDeleteRiskMutation()

  const visible = cell
    ? risks.filter(
        (risk) =>
          risk.probability === cell.probability && risk.impact === cell.impact,
      )
    : risks

  const delayByReason = delayAnalysis?.delayByReason ?? {}

  const openCreate = (title?: string) => {
    setEditing(null)
    setSuggestedTitle(title)
    setFormOpen(true)
  }

  const openEdit = (risk: Risk) => {
    setEditing(risk)
    setSuggestedTitle(undefined)
    setFormOpen(true)
  }

  const handleDelete = async (risk: Risk) => {
    try {
      await deleteRisk({ projectId, riskId: risk.id }).unwrap()
      toast.success(m.deleteSuccess)
    } catch {
      toast.error(m.deleteError)
    }
  }

  return (
    <Stack gap="section">
      <Flex align="start" justify="space-between" gap={4} wrap="wrap">
        <Stack gap={1}>
          <Heading size="h2" color="primary">
            <FormattedMessage {...m.title} />
          </Heading>
          <Text size="sm" color="muted">
            <FormattedMessage {...m.subtitle} />
          </Text>
        </Stack>
        {canManageRisks && (
          <Button onClick={() => openCreate()}>
            <Box as={Plus} boxSize={4} mr={2} />
            <FormattedMessage {...m.addRisk} />
          </Button>
        )}
      </Flex>

      {error ? (
        <Alert variant="error" icon={AlertCircle}>
          {intl.formatMessage(m.loadError)}
        </Alert>
      ) : isLoading ? (
        <>
          <Card>
            <Skeleton h="16rem" rounded="lg" />
          </Card>
          <Stack gap="tight">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} h={16} rounded="lg" />
            ))}
          </Stack>
        </>
      ) : (
        <>
          <Card>
            <RiskMatrix risks={risks} selected={cell} onSelect={setCell} />
          </Card>

          {canManageRisks && suggestions.length > 0 && (
            <RiskSuggestions
              suggestions={suggestions}
              onRegister={openCreate}
            />
          )}

          <Card>
            <Flex
              align="center"
              justify="space-between"
              gap="tight"
              wrap="wrap"
            >
              <Heading size="h3" weight="medium" color="primary">
                <FormattedMessage {...m.listTitle} />
              </Heading>
              {cell && (
                <Flex align="center" gap={2}>
                  <Text size="xs" color="muted">
                    <FormattedMessage
                      {...m.cellFilterHint}
                      values={{
                        probability: intl.formatMessage(
                          LEVEL_LABEL[cell.probability],
                        ),
                        impact: intl.formatMessage(LEVEL_LABEL[cell.impact]),
                      }}
                    />
                  </Text>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setCell(null)}
                  >
                    <FormattedMessage {...m.clearCellFilter} />
                  </Button>
                </Flex>
              )}
            </Flex>

            {visible.length === 0 ? (
              <EmptyState
                icon={ShieldAlert}
                title={intl.formatMessage(m.emptyTitle)}
                description={intl.formatMessage(m.emptyBody)}
              />
            ) : (
              <Stack gap="tight">
                {visible.map((risk) => (
                  <Flex
                    key={risk.id}
                    align="start"
                    justify="space-between"
                    wrap="wrap"
                    gap={4}
                    rounded="lg"
                    borderWidth="1px"
                    borderColor="border"
                    p="cardSm"
                  >
                    <Box minW={0} flex={1}>
                      <Flex align="center" gap={2} mb={1} wrap="wrap">
                        <Text weight="semibold">{risk.title}</Text>
                        <Badge
                          variant={SEVERITY_BADGE[riskSeverity(risk.score)]}
                        >
                          {intl.formatMessage(LEVEL_LABEL[risk.probability])}
                          {' × '}
                          {intl.formatMessage(LEVEL_LABEL[risk.impact])}
                        </Badge>
                        <Badge variant="gray">
                          {intl.formatMessage(STATUS_LABEL[risk.status])}
                        </Badge>
                        {risk.responseStrategy && (
                          <Badge variant="info">
                            {intl.formatMessage(
                              STRATEGY_LABEL[risk.responseStrategy],
                            )}
                          </Badge>
                        )}
                        {risk.category && (
                          <Badge variant="secondary">{risk.category}</Badge>
                        )}
                      </Flex>
                      {risk.description && (
                        <Text size="sm" color="muted" whiteSpace="pre-line">
                          {risk.description}
                        </Text>
                      )}
                      {risk.mitigation && (
                        <Box mt={2} rounded="md" bg="bg.subtle" p={2}>
                          <Text size="xs" color="muted">
                            <FormattedMessage {...m.fieldMitigation} />
                          </Text>
                          <Text size="sm" whiteSpace="pre-line">
                            {risk.mitigation}
                          </Text>
                        </Box>
                      )}
                    </Box>
                    {canManageRisks && (
                      <Stack flexShrink={0} gap={2}>
                        <Button
                          size="sm"
                          variant="outline"
                          aria-label={intl.formatMessage(m.editRisk)}
                          onClick={() => openEdit(risk)}
                        >
                          <Box as={Pencil} boxSize={4} />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          aria-label={intl.formatMessage(m.deleteRisk)}
                          onClick={() => void handleDelete(risk)}
                        >
                          <Box as={Trash2} boxSize={4} />
                        </Button>
                      </Stack>
                    )}
                  </Flex>
                ))}
              </Stack>
            )}
          </Card>
        </>
      )}

      {Object.keys(delayByReason).length > 0 && (
        <Card>
          <Stack gap={1}>
            <Heading size="h3" weight="medium" color="primary">
              <FormattedMessage {...m.delayCausesTitle} />
            </Heading>
            <Text size="sm" color="muted">
              <FormattedMessage {...m.delayCausesBody} />
            </Text>
          </Stack>
          <Stack gap="tight">
            {Object.entries(delayByReason).map(([reason, count]) => (
              <Flex
                key={reason}
                align="center"
                justify="space-between"
                wrap="wrap"
                rounded="lg"
                borderWidth="1px"
                borderColor="border"
                p="cardSm"
                gap={2}
              >
                <Text size="sm" weight="medium">
                  {delayReasonLabel(reason)}
                </Text>
                <Badge variant="critical-soft">
                  <FormattedMessage {...m.tasksCountBadge} values={{ count }} />
                </Badge>
              </Flex>
            ))}
          </Stack>
        </Card>
      )}

      <RiskFormDrawer
        projectId={projectId}
        projectName={projectName}
        risk={editing}
        initialTitle={suggestedTitle}
        open={formOpen}
        onOpenChange={setFormOpen}
      />
    </Stack>
  )
}
