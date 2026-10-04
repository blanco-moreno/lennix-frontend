import { FormattedMessage, type MessageDescriptor } from 'react-intl'

import { commonMessages } from '../../common-messages'
import { Button } from '../button'

export interface ModalFormFooterProps {
  /** Cancel button copy. Defaults to the shared "Cancel". */
  cancelLabel?: MessageDescriptor
  /** Submit button copy while idle. */
  submitLabel: MessageDescriptor
  /** Submit button copy while `isLoading`. Defaults to the shared "Saving...". */
  savingLabel?: MessageDescriptor
  isLoading: boolean
  /** Extra submit-disabling condition on top of `isLoading` (e.g. `!isValid`). */
  submitDisabled?: boolean
  onCancel: () => void
  /**
   * The form the submit button belongs to, for a footer rendered outside it —
   * a drawer whose body also holds controls that must not submit the fields.
   */
  formId?: string
}

/**
 * The classic-modal footer: a cancel button and a submit button that swaps its
 * label for a saving notice while the mutation runs. Rendered as a fragment so
 * it drops into `Modal`'s `footer` slot unchanged.
 */
export function ModalFormFooter({
  cancelLabel = commonMessages.cancel,
  submitLabel,
  savingLabel = commonMessages.saving,
  isLoading,
  submitDisabled = false,
  onCancel,
  formId,
}: ModalFormFooterProps) {
  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isLoading}
      >
        <FormattedMessage {...cancelLabel} />
      </Button>
      <Button
        type="submit"
        form={formId}
        disabled={isLoading || submitDisabled}
      >
        {isLoading ? (
          <FormattedMessage {...savingLabel} />
        ) : (
          <FormattedMessage {...submitLabel} />
        )}
      </Button>
    </>
  )
}
