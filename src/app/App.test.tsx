import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { App } from './App';
import { AuthProvider } from '../shared/auth/Auth';
import { I18nProvider } from '../shared/i18n';
import { server } from '../test/setup';
import { facilityId } from '../test/mocks/handlers';
function mount(roles: number) {
  server.use(
    http.get('/api/v1/session', () =>
      HttpResponse.json({
        userId: 'demo.radiologist',
        organizationId: 'demo',
        canProvision: false,
        hasRecentMfa: false,
        facilities: [{ id: facilityId, name: 'Synthetic facility', roles }],
      }),
    ),
  );
  const queries = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } },
  });
  const router = createMemoryRouter([
    {
      path: '*',
      element: (
        <AuthProvider>
          <App />
        </AuthProvider>
      ),
    },
  ]);
  render(
    <QueryClientProvider client={queries}>
      <I18nProvider>
        <RouterProvider router={router} />
      </I18nProvider>
    </QueryClientProvider>,
  );
  return userEvent.setup();
}
describe('permission-aware workspace', () => {
  it('keeps the chosen patient when picker search results change', async () => {
    const user = mount(15);
    await user.click(screen.getByRole('button', { name: 'Explore demo workspace' }));
    await user.click(await screen.findByRole('button', { name: 'New imaging order' }));
    const option = await screen.findByRole('option', { name: /Demo Alex Morgan/ });
    const selected = option.getAttribute('value')!;
    await user.selectOptions(
      screen.getByLabelText('Registered patient', { exact: true }),
      selected,
    );
    await user.type(screen.getByLabelText('Find patient by name or ID'), 'Sam');
    await screen.findByText('Page 1 - 1 matches');
    await screen.findByRole('option', { name: /Demo Sam Taylor/ });
    expect(screen.getByLabelText('Registered patient', { exact: true })).toHaveValue(selected);
  });
  it('shows technician worklist without privileged navigation or claiming', async () => {
    const user = mount(4);
    await user.click(screen.getByRole('button', { name: 'Explore demo workspace' }));
    await screen.findByRole('heading', { name: 'A clearer view of your day.' });
    expect(screen.queryByRole('link', { name: 'Administration' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Report templates' })).not.toBeInTheDocument();
    await user.click(
      await screen.findByRole('button', { name: 'Open study: Chest Demo Alex Morgan' }),
    );
    expect(screen.queryByRole('button', { name: 'Claim study' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Review & sign' })).not.toBeInTheDocument();
  });
  it('clears the workspace on explicit logout', async () => {
    const user = mount(15);
    await user.click(screen.getByRole('button', { name: 'Explore demo workspace' }));
    await screen.findByRole('heading', { name: 'A clearer view of your day.' });
    await user.click(screen.getByRole('button', { name: 'Sign out' }));
    expect(
      await screen.findByRole('heading', { name: 'Welcome to your workspace' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('Demo Alex Morgan')).not.toBeInTheDocument();
  });
});
