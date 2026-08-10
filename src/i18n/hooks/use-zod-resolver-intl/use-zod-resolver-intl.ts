import { zodResolver } from '@hookform/resolvers/zod'
import type { FieldValues, Resolver } from 'react-hook-form'
import { useIntl, type MessageDescriptor } from 'react-intl'
import type { ZodType } from 'zod'

/**
 * Wrap zodResolver so the form receives translated error messages. Zod schemas
 * store the i18n message key as `message`; this hook looks it up in the catalog.
 */
export function useZodResolverIntl<TValues extends FieldValues>(
  schema: ZodType<TValues, any, any>,
  catalog: Record<string, MessageDescriptor>,
): Resolver<TValues> {
  const intl = useIntl()
  // The zodResolver overloads narrow more than we can statically prove for
  // a generic schema; defer to the runtime contract.
  const base = zodResolver(schema as any) as Resolver<TValues>

  return async (values, context, options) => {
    const result = await base(values, context, options)
    const errors = result.errors as ZodErrorTree | undefined
    if (!errors || Object.keys(errors).length === 0) {
      return result
    }
    const translated = translateErrors(errors, catalog, intl)
    return {
      ...result,
      errors: translated,
    } as Awaited<ReturnType<Resolver<TValues>>>
  }
}

type ZodErrorTree = Record<string, unknown>

function translateErrors(
  errors: ZodErrorTree,
  catalog: Record<string, MessageDescriptor>,
  intl: ReturnType<typeof useIntl>,
): ZodErrorTree {
  const translated: ZodErrorTree = {}
  for (const [field, value] of Object.entries(errors)) {
    if (isFieldError(value)) {
      const descriptor =
        typeof value.message === 'string' ? catalog[value.message] : undefined
      translated[field] = descriptor
        ? { ...value, message: intl.formatMessage(descriptor) }
        : value
    } else if (value && typeof value === 'object') {
      translated[field] = translateErrors(value as ZodErrorTree, catalog, intl)
    } else {
      translated[field] = value
    }
  }
  return translated
}

interface FieldError {
  type?: string
  message?: string
}

function isFieldError(value: unknown): value is FieldError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'message' in value &&
    !('root' in value)
  )
}
