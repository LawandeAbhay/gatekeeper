import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getStoredSession, clearSession } from '../api/client';
import { loginApi, logoutApi } from '../api/auth';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => getStoredSession());
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    function handleSessionExpired() {
      setSession(null);
      toast('Session expired', 'Please sign in again to continue.', true);
    }

    window.addEventListener('gatekeeper:session-expired', handleSessionExpired);
    return () => window.removeEventListener('gatekeeper:session-expired', handleSessionExpired);
  }, [toast]);

  const login = useCallback(async (username, password) => {
    setLoading(true);
    try {
      const newSession = await loginApi(username, password);
      setSession(newSession);
      return newSession;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback((showMessage = true) => {
    logoutApi();
    setSession(null);
    if (showMessage) {
      toast('Signed out', 'Your browser session has been cleared.');
    }
  }, [toast]);

  const value = {
    session,
    isAuthenticated: Boolean(session?.token),
    username: session?.username || null,
    role: session?.role || null,
    organizationId: session?.organizationId || null,
    isPlatformAdmin: session?.role === 'PLATFORM_ADMIN',
    isTenantAdmin: session?.role === 'TENANT_ADMIN',
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
