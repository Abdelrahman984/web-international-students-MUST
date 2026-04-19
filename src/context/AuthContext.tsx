import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ROLES } from '../constants/roles';
import {
  login as loginRequest,
  register as registerRequest,
  getCurrentAccessToken,
  logout as logoutRequest,
  me,
  type RegisterPayload,
  type StrapiUser,
} from '../services/auth';
import { supabase } from '../services/supabase';

interface AuthContextValue {
  user: StrapiUser | null;
  token: string | null;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<StrapiUser>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isCollegeMember: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<StrapiUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = () => {
    setToken(null);
    setUser(null);
  };

  const clearSessionAndPurgeLocalSupabase = async () => {
    clearSession();

    try {
      await supabase.auth.signOut({ scope: 'local' });
    } catch (error) {
      console.warn('Failed to clear local Supabase session cache.', error);
    }
  };

  const withTimeout = async <T,>(promise: Promise<T>, timeoutMs: number, timeoutMessage: string): Promise<T> => {
    return await new Promise<T>((resolve, reject) => {
      const timerId = window.setTimeout(() => {
        reject(new Error(timeoutMessage));
      }, timeoutMs);

      promise
        .then((value) => {
          window.clearTimeout(timerId);
          resolve(value);
        })
        .catch((error) => {
          window.clearTimeout(timerId);
          reject(error);
        });
    });
  };

  const refreshUser = async () => {
    const freshUser = await me(token || '');
    setUser(freshUser);
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const initialToken = await withTimeout(
          getCurrentAccessToken(),
          8000,
          'Timed out restoring auth session from local storage.',
        );
        setToken(initialToken);

        if (initialToken) {
          const freshUser = await withTimeout(
            me(initialToken),
            10000,
            'Timed out loading current user profile.',
          );
          setUser(freshUser);
        } else {
          clearSession();
        }
      } catch (error) {
        console.warn('Auth initialization failed. Clearing local session cache.', error);
        await clearSessionAndPurgeLocalSupabase();
      } finally {
        setIsLoading(false);
      }
    };

    void initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextToken = session?.access_token || null;
      setToken(nextToken);

      if (!nextToken) {
        setUser(null);
        return;
      }

      void (async () => {
        try {
          const freshUser = await withTimeout(
            me(nextToken),
            10000,
            'Timed out refreshing user after auth state change.',
          );
          setUser(freshUser);
        } catch (error) {
          console.warn('Auth state refresh failed. Clearing local session cache.', error);
          await clearSessionAndPurgeLocalSupabase();
        }
      })();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (identifier: string, password: string): Promise<StrapiUser> => {
    setIsLoading(true);
    try {
      const auth = await loginRequest(identifier, password);
      setToken(auth.jwt);
      setUser(auth.user);
      return auth.user;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterPayload) => {
    setIsLoading(true);
    try {
      const auth = await registerRequest(payload);
      setToken(auth.jwt);
      setUser(auth.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutRequest();
    } catch (error) {
      console.warn('Supabase signOut failed, clearing local session anyway.', error);
    } finally {
      clearSession();
    }
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isLoading,
      login,
      register,
      logout,
      isAdmin: user?.role?.type === ROLES.ADMIN,
      isCollegeMember: user?.role?.type === 'college-member',
      refreshUser,
    }),
    [user, token, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
