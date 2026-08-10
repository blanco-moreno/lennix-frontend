import toast from 'react-hot-toast'
import { useIntl, type MessageDescriptor } from 'react-intl'

type ToastValues = Record<string, string | number | boolean | null | undefined>

/**
 * Toast wrapper that translates the descriptor before handing the
 * string to react-hot-toast. Use everywhere instead of `toast.success`/
 * `toast.error` so the toast copy is centralised in *-messages files.
 */
export function useIntlToast() {
  const intl = useIntl()
  return {
    success: (descriptor: MessageDescriptor, values?: ToastValues) =>
      toast.success(intl.formatMessage(descriptor, values), {
        id: descriptor.id,
      }),
    error: (descriptor: MessageDescriptor, values?: ToastValues) =>
      toast.error(intl.formatMessage(descriptor, values), {
        id: descriptor.id,
      }),
  }
}
