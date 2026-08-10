import { ErrorBoundary, getErrorMessage } from 'react-error-boundary'
import { Toaster } from 'react-hot-toast'
import { Provider } from 'react-redux'
import { RouterProvider } from 'react-router'

import { AppIntlProvider } from '@/i18n/components/intl-provider'
import { router } from '@/router/router'
import { ThemeProvider } from '@/theme/provider'

import { store } from './stores'

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <ErrorBoundary
          fallbackRender={({ error, resetErrorBoundary }) => (
            <div role="alert">
              <p>Something went wrong:</p>
              <pre>{getErrorMessage(error)}</pre>
              <button onClick={resetErrorBoundary}>Try again</button>
            </div>
          )}
        >
          <AppIntlProvider>
            <RouterProvider router={router} />
          </AppIntlProvider>
        </ErrorBoundary>
      </ThemeProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '0.625rem',
            fontSize: '0.875rem',
          },
          success: {
            iconTheme: {
              primary: '#16a34a',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#dc2626',
              secondary: '#ffffff',
            },
            duration: 5000,
          },
        }}
      />
    </Provider>
  )
}
