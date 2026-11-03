import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReportConflictReview, type ConflictSnapshot } from './ReportConflictReview';
import type { Content } from '../../shared/api/types';
const local: Content = {
  examination: 'Local exam',
  findings: 'Local observations',
  impression: 'Local impression',
  language: 'en',
};
const server: ConflictSnapshot = {
  version: 2,
  token: 'current',
  status: 'Draft',
  authorId: 'synthetic-author',
  content: { ...local, findings: 'Server observations', impression: 'Server impression' },
};
function mount(
  snapshot: ConflictSnapshot | null = server,
  currentToken = 'current',
  error: unknown = null,
) {
  const actions = { onLoad: vi.fn(), onUseSection: vi.fn(), onKeep: vi.fn(), onReplace: vi.fn() };
  render(
    <ReportConflictReview
      local={local}
      baseVersion={1}
      snapshot={snapshot}
      currentToken={currentToken}
      busy={false}
      error={error}
      {...actions}
    />,
  );
  return actions;
}
describe('explicit report conflict review', () => {
  it('shows both versions and takes a section only after an explicit choice', async () => {
    const actions = mount();
    const user = userEvent.setup();
    expect(screen.getByLabelText('Your findings')).toHaveTextContent('Local observations');
    expect(screen.getByLabelText('Server findings')).toHaveTextContent('Server observations');
    expect(actions.onUseSection).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Use server findings' }));
    expect(actions.onUseSection).toHaveBeenCalledWith('findings', 'Server observations');
    expect(actions.onKeep).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Use server examination' })).toBeDisabled();
  });
  it('keeps and replaces text through separate explicit actions', async () => {
    const actions = mount();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Continue with my reviewed text' }));
    expect(actions.onKeep).toHaveBeenCalledOnce();
    expect(actions.onReplace).not.toHaveBeenCalled();
    await user.click(
      screen.getByRole('button', { name: 'Replace my unsaved text with server revision' }),
    );
    expect(actions.onReplace).toHaveBeenCalledOnce();
  });
  it('requires a successful load before offering reconciliation', async () => {
    const actions = mount(null, 'current', new Error('Could not reach the service.'));
    expect(screen.getByRole('alert')).toHaveTextContent('Could not reach the service.');
    expect(
      screen.queryByRole('button', { name: 'Continue with my reviewed text' }),
    ).not.toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Reload server version' }));
    expect(actions.onLoad).toHaveBeenCalledOnce();
  });
  it('blocks merging a signed server report', () => {
    mount({ ...server, status: 'Signed' });
    expect(screen.getByRole('button', { name: 'Continue with my reviewed text' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Use server findings' })).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Replace my unsaved text with server revision' }),
    ).toBeEnabled();
    expect(screen.getByRole('status')).toHaveTextContent('server report is signed');
  });
  it('does not resolve with a snapshot from an obsolete concurrency token', () => {
    mount(server, 'newer');
    expect(screen.getByRole('button', { name: 'Continue with my reviewed text' })).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Replace my unsaved text with server revision' }),
    ).toBeDisabled();
  });
});
