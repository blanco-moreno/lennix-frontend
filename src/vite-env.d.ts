/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  /**
   * Where RUM beacons go. Unset: the backend's `/v1/rum/vitals`; empty: RUM
   * is off; a URL: that collector.
   */
  readonly VITE_RUM_ENDPOINT?: string
  /** `'true'` only in the e2e build, which serves its API from the MSW worker. */
  readonly VITE_E2E_MOCKS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
