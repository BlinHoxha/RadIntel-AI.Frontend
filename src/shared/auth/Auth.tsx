import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  changeContext,
  clearCredentials,
  configureDevelopmentAuthentication,
  request,
  setCredentials,
} from '../api/client';
import {
  developmentBridgeEnabled,
  type ClientConfiguration,
  type DevelopmentIdentity,
} from './development';
import type { Session } from '../api/types';
export const demoMode = import.meta.env.VITE_DEMO_MODE !== 'false';
interface Auth {
  session: Session | null;
  facilityId: string;
  connect: (token: string, identity?: DevelopmentIdentity) => Promise<void>;
  development: ClientConfiguration | null;
  configurationError: string;
  configurationLoading: boolean;
  disconnect: () => void;
  chooseFacility: (id: string) => void;
  roles: number;
}
const Context = createContext<Auth>(null!);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [facilityId, setFacilityId] = useState('');
  const [development, setDevelopment] = useState<ClientConfiguration | null>(null);
  const [configurationError, setConfigurationError] = useState('');
  const [configurationLoading, setConfigurationLoading] = useState(
    !demoMode && import.meta.env.VITE_ENABLE_DEVELOPMENT_AUTH === 'true',
  );
  const queries = useQueryClient();
  const disconnect = useCallback(() => {
    clearCredentials();
    setSession(null);
    setFacilityId('');
    void queries.cancelQueries();
    queries.clear();
  }, [queries]);
  useEffect(() => {
    if (demoMode || import.meta.env.VITE_ENABLE_DEVELOPMENT_AUTH !== 'true') return;
    if (!developmentBridgeEnabled()) {
      setConfigurationError(
        'Development authentication requires a loopback Vite development session.',
      );
      setConfigurationLoading(false);
      return;
    }
    const abort = new AbortController();
    void fetch('/client-config', { cache: 'no-store', signal: abort.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error('Could not read backend authentication configuration.');
        const config = (await response.json()) as ClientConfiguration;
        if (
          typeof config.developmentAuthentication !== 'boolean' ||
          typeof config.simulatedMfaAllowed !== 'boolean'
        )
          throw new Error('Backend authentication configuration is incompatible.');
        if (abort.signal.aborted) return;
        configureDevelopmentAuthentication(config);
        setDevelopment(config.developmentAuthentication ? config : null);
      })
      .catch(() => {
        if (!abort.signal.aborted)
          setConfigurationError(
            'Could not verify backend authentication configuration. Check the API and restart the frontend.',
          );
      })
      .finally(() => {
        if (!abort.signal.aborted) setConfigurationLoading(false);
      });
    return () => abort.abort();
  }, []);
  const connect = async (token: string, identity?: DevelopmentIdentity) => {
    if (configurationLoading || configurationError)
      throw new Error('Backend authentication configuration is not ready.');
    if (development && !identity) throw new Error('Enter your local development identity.');
    setCredentials(token, disconnect, identity);
    try {
      const value = await request<Session>('session');
      setSession(value);
      setFacilityId(value.facilities[0]?.id || '');
    } catch (error) {
      disconnect();
      throw error;
    }
  };
  useEffect(() => {
    if (!session) return;
    let timer: ReturnType<typeof setTimeout>;
    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(disconnect, 15 * 60 * 1000);
    };
    reset();
    const events = ['pointerdown', 'keydown', 'touchstart'] as const;
    events.forEach((event) => window.addEventListener(event, reset));
    return () => {
      clearTimeout(timer);
      events.forEach((event) => window.removeEventListener(event, reset));
    };
  }, [session, disconnect]);
  return (
    <Context.Provider
      value={{
        session,
        facilityId,
        connect,
        development,
        configurationError,
        configurationLoading,
        disconnect,
        chooseFacility: (id) => {
          changeContext();
          void queries.cancelQueries();
          queries.clear();
          setFacilityId(id);
        },
        roles: session?.facilities.find((f) => f.id === facilityId)?.roles || 0,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export const useAuth = () => useContext(Context);
