import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi, TOKEN_KEY } from '../services/api.js';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!localStorage.getItem(TOKEN_KEY));

  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) return;
    authApi.me().then((d) => setUser(d.user)).catch(() => localStorage.removeItem(TOKEN_KEY)).finally(() => setLoading(false));
  }, []);

  const start = useCallback((data) => { localStorage.setItem(TOKEN_KEY, data.token); setUser(data.user); }, []);
  const login = async (creds) => start(await authApi.login(creds));
  const register = async (info) => start(await authApi.register(info));
  const logout = () => { localStorage.removeItem(TOKEN_KEY); setUser(null); };

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}
