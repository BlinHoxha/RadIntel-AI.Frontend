import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, demoMode } from './shared/auth/Auth';
import { I18nProvider } from './shared/i18n';
import { App } from './app/App';
import './app/styles.css';
async function start() {
  if (demoMode) {
    const { worker } = await import('./test/mocks/browser');
    await worker.start({ onUnhandledRequest: 'bypass', quiet: true });
  }
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: 15_000, gcTime: 0, refetchOnWindowFocus: false },
      mutations: { retry: false },
    },
  });
  const router = createBrowserRouter([
    {
      path: '*',
      element: (
        <AuthProvider>
          <App />
        </AuthProvider>
      ),
    },
  ]);
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <I18nProvider>
          <RouterProvider router={router} />
        </I18nProvider>
      </QueryClientProvider>
    </React.StrictMode>,
  );
}
void start().catch(() => {
  document.getElementById('root')!.textContent =
    'The workspace could not start. Reload or contact your administrator.';
});
