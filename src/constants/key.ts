/**
 * Every browser-storage key the app writes, in one place. A key's value must
 * never change once shipped — stored data under the old name would silently
 * stop being read. The auth token keys are written to localStorage *or*
 * sessionStorage depending on "remember me" (see `auth-slice.ts`).
 */
export const LOCAL_STORAGE_KEYS = {
  USER: 'user',
  REMEMBER_ME: 'rememberMe',
  LAST_VISITED_ROUTE: 'lastVisitedRoute',
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  REMEMBERED_EMAIL: 'rememberedEmail',
  LOCALE: 'lennix.locale',
  REVIEW_JOURNAL: 'lennix.review-journal.v1',
} as const
