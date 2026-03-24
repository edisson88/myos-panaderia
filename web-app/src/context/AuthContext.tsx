import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  loginRequest,
  meRequest,
  type AuthUser,
  type LoginInput,
} from "../services/auth.service";

const TOKEN_STORAGE_KEY = "auth_token";
const USER_STORAGE_KEY = "auth_user";

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginInput) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

function parseStoredUser(raw: string | null): AuthUser | null {
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_STORAGE_KEY),
  );
  const [user, setUser] = useState<AuthUser | null>(() =>
    parseStoredUser(localStorage.getItem(USER_STORAGE_KEY)),
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const persistSession = useCallback((newToken: string, newUser: AuthUser) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, newToken);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    let active = true;

    const bootstrapAuth = async () => {
      if (!token) {
        if (active) {
          setIsLoading(false);
        }
        return;
      }

      try {
        const profile = await meRequest(token);
        if (!active) {
          return;
        }
        setUser(profile);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profile));
      } catch {
        if (!active) {
          return;
        }
        clearSession();
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void bootstrapAuth();

    return () => {
      active = false;
    };
  }, [token, clearSession]);

  const login = useCallback(
    async (credentials: LoginInput) => {
      setError(null);
      setIsLoading(true);

      try {
        const response = await loginRequest(credentials);
        persistSession(response.access_token, response.user);
      } catch (err) {
        const message = err instanceof Error ? err.message : "No se pudo iniciar sesion";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [persistSession],
  );

  const logout = useCallback(() => {
    clearSession();
    setError(null);
  }, [clearSession]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isLoading,
      error,
      login,
      logout,
      clearError,
    }),
    [user, token, isLoading, error, login, logout, clearError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
