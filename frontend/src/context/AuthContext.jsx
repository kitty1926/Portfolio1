import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, setAuthToken } from '../lib/api';

const AuthContext = createContext(null);
const TOKEN_KEY = 'folio_token';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setAuthToken(token);
    if (!token) { setProfile(null); setLoading(false); return; }
    api.getProfile()
      .then(setProfile)
      .catch(() => { logout(); })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const login = useCallback(async (email, password) => {
    const data = await api.login({ email, password });
    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
  }, []);

  const register = useCallback(async (payload) => {
    const data = await api.register(payload);
    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setAuthToken(null);
    setToken(null);
    setProfile(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    const p = await api.getProfile();
    setProfile(p);
    return p;
  }, []);

  return (
    <AuthContext.Provider value={{ token, profile, loading, login, register, logout, refreshProfile, setProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
