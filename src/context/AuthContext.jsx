import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import * as authService from "../services/auth.service";
import { clearTokens, getRefreshToken, setTokens } from "../services/tokenStorage";
import { useTheme } from "./ThemeContext";

const AuthContext = createContext(null);

// `user` is the shape returned by GET /auth/me: { id_user, email,
// email_verified, status, person, user_configuration, roles, permissions }.
// `hasPermission` checks the GLOBAL system-role permissions on that object —
// it is NOT what gates per-home OWNER-only actions (create/delete home,
// thresholds, devices, members). Those are gated by each home's own `role`
// field (from useHomes/home.service), since a user can be OWNER of one home
// and MEMBER of another at the same time. See mock/README.md.
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // Set only when hydration failed because the server was unreachable (not
  // because the session was actually rejected). Tokens are deliberately
  // kept in that case — see hydrate() below — so ProtectedRoute can offer a
  // retry instead of silently discarding a still-possibly-valid session.
  const [hydrateError, setHydrateError] = useState(null);
  const { setThemeId } = useTheme();
  const { i18n } = useTranslation();

  // Server is the source of truth for theme/language once a session is
  // known; localStorage (ThemeContext, i18n's `lng` init) only exists to
  // paint instantly before this resolves, avoiding a flash — see
  // Fase 3/Settings notes in the plan.
  const applyUserConfiguration = useCallback(
    (configuration) => {
      if (!configuration) return;
      if (configuration.color_theme) setThemeId(configuration.color_theme);
      if (configuration.language && configuration.language !== i18n.language) {
        i18n.changeLanguage(configuration.language);
        localStorage.setItem("lang", configuration.language);
      }
    },
    [setThemeId, i18n],
  );

  const hydrate = useCallback(async () => {
    if (!getRefreshToken()) {
      setUser(null);
      setHydrateError(null);
      setLoading(false);
      return;
    }
    try {
      const profile = await authService.me();
      setUser(profile);
      setHydrateError(null);
      applyUserConfiguration(profile.user_configuration);
    } catch (err) {
      if (err.code === "NETWORK_ERROR") {
        // Can't tell if the session is still valid — assume it is and let
        // the user retry once the server is back, instead of bouncing them
        // to /login and losing a perfectly good session over a network blip.
        setHydrateError(err);
      } else {
        setUser(null);
        setHydrateError(null);
        clearTokens();
      }
    } finally {
      setLoading(false);
    }
  }, [applyUserConfiguration]);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Fired by src/services/api.js when a refresh attempt fails (session
  // expired server-side). ProtectedRoute reacts to isAuthenticated turning
  // false and redirects to /login on its own — no navigation happens here.
  useEffect(() => {
    const handleSessionExpired = () => setUser(null);
    window.addEventListener("auth:logout", handleSessionExpired);
    return () => window.removeEventListener("auth:logout", handleSessionExpired);
  }, []);

  const login = useCallback(
    async (email, password) => {
      const data = await authService.login({ email, password });
      setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
      await hydrate();
      return data;
    },
    [hydrate],
  );

  const register = useCallback((payload) => authService.register(payload), []);

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken();
    try {
      if (refreshToken) await authService.logout(refreshToken);
    } catch {
      // Best effort: the session is being cleared locally regardless.
    }
    clearTokens();
    setUser(null);
  }, []);

  const refreshUser = useCallback(() => hydrate(), [hydrate]);

  const hasPermission = useCallback((code) => Boolean(user?.permissions?.includes(code)), [user]);

  const value = {
    user,
    roles: user?.roles ?? [],
    permissions: user?.permissions ?? [],
    isAuthenticated: Boolean(user),
    loading,
    hydrateError,
    login,
    register,
    logout,
    refreshUser,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};

export default AuthContext;
