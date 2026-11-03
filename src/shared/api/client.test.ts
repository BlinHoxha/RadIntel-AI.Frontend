import { describe, expect, it, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../test/setup';
import { ApiError, changeContext, clearCredentials, request, setCredentials } from './client';
describe('API boundary', () => {
  it('rejects requests without credentials', async () => {
    clearCredentials();
    await expect(request('session')).rejects.toMatchObject({ status: 401 });
  });
  it.each([403, 404, 409, 422, 429, 500, 503])(
    'redacts server detail for status %s',
    async (status) => {
      setCredentials('synthetic-demo', () => {});
      server.use(
        http.get('/api/v1/session', () =>
          HttpResponse.json({ detail: 'PRIVATE PATIENT TEXT' }, { status }),
        ),
      );
      const error = await request('session').catch((e) => e as ApiError);
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).status).toBe(status);
      expect((error as Error).message).not.toContain('PRIVATE');
    },
  );
  it('expires on 401', async () => {
    const expire = vi.fn();
    setCredentials('invalid', expire);
    await expect(request('session')).rejects.toMatchObject({ status: 401 });
    expect(expire).toHaveBeenCalledOnce();
  });
  it('rejects a late response after changing facility context', async () => {
    setCredentials('synthetic-demo', () => {});
    let resolve!: () => void;
    const ready = new Promise<void>((r) => {
      resolve = r;
    });
    server.use(
      http.get('/api/v1/session', async () => {
        changeContext();
        resolve();
        return HttpResponse.json({ facilities: [] });
      }),
    );
    const pending = request('session');
    await ready;
    await expect(pending).rejects.toMatchObject({ status: 401 });
  });
  it('never retries a clinical mutation automatically', async () => {
    let calls = 0;
    setCredentials('synthetic-demo', () => {});
    server.use(
      http.post('/api/v1/sign', () => {
        calls++;
        return HttpResponse.json({}, { status: 500 });
      }),
    );
    await expect(request('sign', 'POST', {})).rejects.toThrow();
    expect(calls).toBe(1);
  });
});
