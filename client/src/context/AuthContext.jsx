import { createContext, useCallback, useContext, useMemo, useState } from 'react';

export const TOKEN_KEY = 'token';

const AuthContext = createContext(null);

// A JWT has three base64url parts. The middle one holds { sub, role, exp }.
// This only READS the token for display; the API's JwtAuthGuard is what actually verifies it.
export function parseToken(token) {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

function isExpired(payload) {
  return !payload || Boolean(payload.exp && payload.exp * 1000 <= Date.now());
}

// Restore the saved JWT on refresh, dropping it if it is malformed or has expired
function loadSavedToken() {
  try {
    const saved = localStorage.getItem(TOKEN_KEY);
    if (!saved) return null;
    if (isExpired(parseToken(saved))) {
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }
    return saved;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(loadSavedToken);

  // login() keeps the JWT in localStorage so the user stays signed in after a refresh
  const login = useCallback((newToken) => {
    try {
      localStorage.setItem(TOKEN_KEY, newToken);
    } catch {
      // storage blocked: the user stays signed in for this visit only
    }
    setToken(newToken);
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      // nothing to remove
    }
    setToken(null);
  }, []);

  const user = useMemo(() => {
    const payload = token ? parseToken(token) : null;
    return payload ? { id: payload.sub, role: payload.role } : null;
  }, [token]);

  const value = useMemo(
    () => ({ token, user, isAuthenticated: Boolean(token), login, logout }),
    [token, user, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
