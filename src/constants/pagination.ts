/**
 * One pagination policy, everywhere: **steps of 5 up to
 * 20**, matching `MAX_PAGE_SIZE` in `app/shared/pagination.py`. A surface that
 * offers more than the server accepts turns its own selector into a 422.
 */
export const DEFAULT_PAGE_SIZE_OPTIONS = [5, 10, 15, 20] as const

/**
 * The first step of that scale, and what every list surface opens on.
 *
 * Typed `number`, not the literal: a surface holds this in `useState`, and a
 * literal type would make the state itself un-widenable — the selector could
 * never move off 5.
 */
export const DEFAULT_PAGE_SIZE: number = DEFAULT_PAGE_SIZE_OPTIONS[0]

/** The backend's hard page ceiling (`MAX_PAGE_SIZE` in `app/shared/pagination.py`). */
export const MAX_PAGE_SIZE: number = DEFAULT_PAGE_SIZE_OPTIONS[3]
