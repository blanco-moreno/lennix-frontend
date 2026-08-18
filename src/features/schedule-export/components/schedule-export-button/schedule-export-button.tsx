/**
 * "Export XLSX" — the schedule leaves the product the way it came in.
 *
 * Lives in `features/` because it owns its request: it calls the export
 * mutation, hands the browser the file under the name the backend chose, and
 * turns a refusal into a translated toast. Parents pass an id, nothing else.
 * No success toast: the browser's own download UI is the confirmation.
 */

import { Download } from 'lucide-react'
import toast from 'react-hot-toast'
import { useIntl } from 'react-intl'

import { Button, type ButtonProps } from '@/components'
import { useExportProjectScheduleMutation } from '@/services/project'
import { downloadBlob } from '@/utils'

import { scheduleExportButtonMessages as m } from './schedule-export-button-messages'

export interface ScheduleExportButtonProps extends Omit<
  ButtonProps,
  'onClick' | 'children'
> {
  projectId: string
}

export function ScheduleExportButton({
  projectId,
  ...props
}: ScheduleExportButtonProps) {
  const intl = useIntl()
  const [exportSchedule, { isLoading }] = useExportProjectScheduleMutation()

  const handleClick = async () => {
    try {
      const { blob, filename } = await exportSchedule(projectId).unwrap()
      downloadBlob(blob, filename)
    } catch {
      toast.error(intl.formatMessage(m.error), { id: m.error.id })
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      {...props}
      onClick={handleClick}
      disabled={isLoading}
      data-testid="schedule-export-button"
    >
      <Download aria-hidden size={16} />
      {intl.formatMessage(isLoading ? m.pending : m.label)}
    </Button>
  )
}
