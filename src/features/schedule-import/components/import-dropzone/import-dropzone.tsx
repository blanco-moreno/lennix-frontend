/**
 * One drag-drop, and that is the whole first step.
 *
 * No wizard around it: no form, no questions, no "next". `.xlsm` joins `.xlsx` and
 * `.csv` because macro-enabled workbooks are ordinary in AEC and the backend
 * has always accepted them.
 */

import { Box, Flex, Stack, chakra } from '@chakra-ui/react'
import { AlertCircle, FileText, Upload, X } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useDropzone, type FileRejection } from 'react-dropzone'
import { useIntl } from 'react-intl'

import { Alert, Button, Card, Heading, Text } from '@/components'

import { importDropzoneMessages as m } from './import-dropzone-messages'

const ACCEPTED_TYPES = {
  'text/csv': ['.csv'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [
    '.xlsx',
  ],
  'application/vnd.ms-excel.sheet.macroEnabled.12': ['.xlsm'],
}

/** Mirrors the backend upload cap (BK-UP, default 20 MB). */
export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024
const MAX_UPLOAD_MB = MAX_UPLOAD_BYTES / (1024 * 1024)

export interface ImportDropzoneProps {
  file: File | null
  onFileSelected: (file: File) => void
  onFileCleared: () => void
  disabled?: boolean
}

export function ImportDropzone({
  file,
  onFileSelected,
  onFileCleared,
  disabled = false,
}: ImportDropzoneProps) {
  const intl = useIntl()
  const [rejection, setRejection] = useState<string | null>(null)

  const onDrop = useCallback(
    (accepted: File[], rejected: FileRejection[]) => {
      if (rejected.length > 0) {
        const tooLarge = rejected.some((entry) =>
          entry.errors.some((error) => error.code === 'file-too-large'),
        )
        setRejection(
          tooLarge
            ? intl.formatMessage(m.fileTooLarge, { size: MAX_UPLOAD_MB })
            : intl.formatMessage(m.formatUnsupported),
        )
        return
      }
      const chosen = accepted[0]
      if (!chosen) return
      setRejection(null)
      onFileSelected(chosen)
    },
    [intl, onFileSelected],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxFiles: 1,
    maxSize: MAX_UPLOAD_BYTES,
    disabled,
  })

  return (
    <Stack gap={4}>
      <Card
        {...getRootProps()}
        cursor={disabled ? 'default' : 'pointer'}
        rounded="2xl"
        borderWidth="2px"
        borderStyle="dashed"
        borderColor={isDragActive ? 'complementary' : 'border'}
        bg={isDragActive ? 'complementary/5' : 'bg.subtle'}
        opacity={disabled ? 0.6 : undefined}
        pointerEvents={disabled ? 'none' : undefined}
        transition="border-color 0.2s, background-color 0.2s"
        _hover={
          disabled
            ? undefined
            : { borderColor: 'complementary', bg: 'complementary/5' }
        }
      >
        <input
          {...getInputProps()}
          aria-label={intl.formatMessage(m.selectFile)}
        />
        {/* The one action of the screen, sized like it: a drop target you
            cannot miss from across a desk. */}
        <Stack
          gap="section"
          px={{ base: 6, md: 12 }}
          py={{ base: 10, md: 16 }}
          minH={{ base: '18rem', md: '22rem' }}
          justify="center"
          textAlign="center"
          align="center"
        >
          <Flex
            boxSize={{ base: 16, md: 20 }}
            align="center"
            justify="center"
            rounded="full"
            bg="complementary/10"
          >
            <Box
              as={Upload}
              boxSize={{ base: 8, md: 10 }}
              color="complementary"
            />
          </Flex>
          <Stack gap={2} align="center">
            <Heading size="h3" color="primary">
              {intl.formatMessage(
                isDragActive ? m.dropzoneActive : m.dropzoneIdle,
              )}
            </Heading>
            <Text color="muted">
              {intl.formatMessage(m.formatsHint, { size: MAX_UPLOAD_MB })}
            </Text>
          </Stack>
          <Button type="button" size="lg" disabled={disabled}>
            <Box as={FileText} boxSize={5} mr={2} />
            {intl.formatMessage(m.selectFile)}
          </Button>
        </Stack>
      </Card>

      {file && (
        <Flex
          align="center"
          justify="space-between"
          wrap="wrap"
          rounded="xl"
          borderWidth="1px"
          borderColor="border"
          bg="bg.panel"
          px={5}
          py={4}
          gap={2}
        >
          <Flex align="center" gap={4} minW={0}>
            <Box as={FileText} boxSize={6} color="complementary" />
            <Box minW={0}>
              <Text weight="semibold" color="primary">
                {file.name}
              </Text>
              <Text size="sm" color="muted">
                {intl.formatMessage(m.fileSize, {
                  size: (file.size / 1024).toFixed(1),
                })}
              </Text>
            </Box>
          </Flex>
          <chakra.button
            type="button"
            aria-label={intl.formatMessage(m.removeFile)}
            onClick={(event) => {
              event.stopPropagation()
              setRejection(null)
              onFileCleared()
            }}
            rounded="md"
            p={1}
            color="fg.subtle"
            _hover={{ bg: 'bg.muted', color: 'fg.muted' }}
          >
            <Box as={X} boxSize={4} />
          </chakra.button>
        </Flex>
      )}

      {rejection && (
        <Alert variant="error" icon={AlertCircle}>
          {rejection}
        </Alert>
      )}
    </Stack>
  )
}
