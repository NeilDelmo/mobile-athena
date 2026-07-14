import { createContext, use, useCallback, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

import { apiRequest, setApiAccessToken } from '@/services/api-client';
import {
  clearStoredSessionToken,
  getStoredSessionToken,
  storeSessionToken,
} from '@/services/session-storage';

export type AuthUserRole =
  | 'faculty'
  | 'research_head'
  | 'research_coordinator'
  | 'vcrdes'
  | 'admin';

export type AuthUser = {
  id: number;
  universityId: string | null;
  email: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  role: AuthUserRole;
  department: string | null;
};

type LoginResponse = {
  token: string;
  user: AuthUser;
};

type AuthContextValue = {
  user: AuthUser | null;
  isRestoring: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      const token = await getStoredSessionToken();

      if (!token) {
        if (active) setIsRestoring(false);
        return;
      }

      setApiAccessToken(token);

      try {
        const result = await apiRequest<{ user: AuthUser }>('/auth/me');
        if (active) setUser(result.user);
      } catch {
        setApiAccessToken(null);
        await clearStoredSessionToken();
      } finally {
        if (active) setIsRestoring(false);
      }
    }

    restoreSession();
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: { email, password },
      authenticated: false,
    });
    setApiAccessToken(result.token);
    await storeSessionToken(result.token);
    setUser(result.user);
    return result.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiRequest<void>('/auth/logout', { method: 'POST' });
    } catch {
      // Local sign-out must still succeed if the API server has stopped.
    }

    setApiAccessToken(null);
    await clearStoredSessionToken();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isRestoring, login, logout }),
    [isRestoring, login, logout, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = use(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}

export function getAuthDestination(user: AuthUser) {
  return user.role === 'faculty' ? '/faculty' : '/research-head';
}
