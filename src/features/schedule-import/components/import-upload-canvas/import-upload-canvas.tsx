/**
 * The import entry point — upload, then land on the result:
 *   201                        → the draft's review canvas
 *   422 needs_assisted_mapping → assisted mapping, with the job carrying the report
 *   422 needs_normalization    → an honest dead end, nothing imported
 *   400 plan_draft_limit       → the named plan limit, with a way out
 */

import { Box, Flex, Stack } from '@chakra-ui/react'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router'

import { Alert, Button, Heading, Text } from '@/components'
import { PlanUsageMeter } from '@/features'
import { buildAssistedMappingPath, buildDraftReviewPath } from '@/router'
import type { ApiError } from '@/services'
import { useGetMeQuery } from '@/services/auth'
import {
  readAssistedMappingDivert,
  readPlanQuotaFailure,
  useUploadScheduleFileMutation,
} from '@/services/schedule-import'
import type { PlanQuotaFailure } from '@/types'

import { ImportDropzone, importDropzoneMessages } from '../import-dropzone'
import { PlanQuotaNotice } from '../plan-quota-notice'

import { importUploadCanvasMessages as m } from './import-upload-canvas-messages'

type UploadFailure = 'unreadable' | 'too_large' | 'generic'

export function ImportUploadCanvas() {
  const intl = useIntl()
  const navigate = useNavigate()
  const { data: me } = useGetMeQuery()
  const organizationId = me?.organizationId ?? ''
  const [uploadScheduleFile, { isLoading }] = useUploadScheduleFileMutation()

  const [file, setFile] = useState<File | null>(null)
  const [failure, setFailure] = useState<UploadFailure | null>(null)
  const [quotaFailure, setQuotaFailure] = useState<PlanQuotaFailure | null>(
    null,
  )

  const reset = () => {
    setFile(null)
    setFailure(null)
    setQuotaFailure(null)
  }

  const handleFileSelected = async (chosen: File) => {
    setFile(chosen)
    setFailure(null)
    setQuotaFailure(null)
    if (!organizationId) return

    const formData = new FormData()
    formData.append('organization_id', organizationId)
    formData.append('file', chosen)

    try {
      const result = await uploadScheduleFile(formData).unwrap()
      navigate(buildDraftReviewPath(result.projectId))
    } catch (error) {
      // The quality floor diverts here rather than landing a draft: the job
      // carries the parse report assisted mapping needs, since there is no draft.
      const divert = readAssistedMappingDivert(error)
      if (divert) {
        navigate(buildAssistedMappingPath(divert.importJobId))
        return
      }
      const quota = readPlanQuotaFailure(error)
      if (quota) {
        setQuotaFailure(quota)
        return
      }
      const apiError = error as ApiError
      if (apiError.status === 422) {
        setFailure('unreadable')
        return
      }
      if (apiError.status === 413) {
        setFailure('too_large')
        return
      }
      // 403 already surfaces globally — don't double-report it.
      setFailure(apiError.status === 403 ? null : 'generic')
    }
  }

  return (
    <Stack gap={{ base: 6, md: 10 }} maxW="5xl" mx="auto" w="full">
      {/* The hero of the product: the promise, then the target. One icon —
          the dropzone carries the other. */}
      <Stack gap="tight" align="center" textAlign="center" maxW="2xl" mx="auto">
        <Heading size="h1" color="primary">
          {intl.formatMessage(importDropzoneMessages.title)}
        </Heading>
        <Text size="lg" color="muted">
          {intl.formatMessage(importDropzoneMessages.subtitle)}
        </Text>
      </Stack>

      <PlanUsageMeter resource="ai" />

      {isLoading ? (
        <Flex
          direction="column"
          align="center"
          justify="center"
          gap={4}
          minH={{ base: '18rem', md: '22rem' }}
          rounded="2xl"
          borderWidth="2px"
          borderStyle="dashed"
          borderColor="border"
          bg="bg.subtle"
        >
          <Box
            as={Loader2}
            boxSize={10}
            color="complementary"
            animation="spin 1s linear infinite"
          />
          <Text size="lg" color="muted">
            {intl.formatMessage(m.reading, { fileName: file?.name ?? '' })}
          </Text>
        </Flex>
      ) : (
        <ImportDropzone
          file={file}
          onFileSelected={handleFileSelected}
          onFileCleared={reset}
        />
      )}

      {quotaFailure && <PlanQuotaNotice failure={quotaFailure} />}

      {failure && (
        <Alert variant="error" icon={AlertTriangle}>
          <Stack gap={2} align="flex-start">
            {failure === 'unreadable' ? (
              <>
                <Text weight="medium" size="sm">
                  {intl.formatMessage(m.unreadableTitle)}
                </Text>
                <Text size="sm">{intl.formatMessage(m.unreadableBody)}</Text>
              </>
            ) : (
              <Text size="sm">
                {intl.formatMessage(
                  failure === 'too_large' ? m.tooLarge : m.uploadFailed,
                )}
              </Text>
            )}
            <Button variant="outline" size="sm" onClick={reset}>
              {intl.formatMessage(m.tryAnother)}
            </Button>
          </Stack>
        </Alert>
      )}
    </Stack>
  )
}
