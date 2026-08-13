import React from 'react'
import ReactDOM from 'react-dom/client'

import App from './App'
import { initRum } from './rum'

/**
 * The e2e build — and only it — serves its API from a service worker.
 *
 * Vite replaces `import.meta.env.VITE_E2E_MOCKS` with a literal at build time,
 * so in a normal or production build the branch folds to `false` and the
 * dynamic import is dropped: msw ships in no bundle a user can reach.
 */
async function bootstrap(): Promise<void> {
  if (import.meta.env.VITE_E2E_MOCKS === 'true') {
    const { worker } = await import('./mocks/browser')
    await worker.start({ onUnhandledRequest: 'warn', quiet: true })
  } else {
    // Not under e2e mocks, where the beacon would only spam the worker.
    initRum()
  }
  const root = ReactDOM.createRoot(document.getElementById('root')!)
  root.render(<App />)
}

void bootstrap()
