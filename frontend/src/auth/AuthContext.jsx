import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api/client";
import {
  firebaseLoginWithGoogle,
  firebaseLogout,
  isFirebaseClientConfigured
} from "./firebaseClient";

const AUTH_MODE = import.meta.env.VITE_AUTH_MODE || "local";
const SOCIAL_AUTH_ENABLED = AUTH_MODE === "firebase" && isFirebaseClientConfigured();
const TOKEN_KEY = "summit-prep-token";
const USER_KEY = "summit-prep-user";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY) || "");
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  const saveSession = (nextToken, nextUser) => {
    setToken(nextToken);
    setUser(nextUser);
    localStorage.setItem(TOKEN_KEY, nextToken);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
  };

  const clearSession = () => {
    setToken("");
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  const refreshProfile = async (sessionToken = token) => {
    if (!sessionToken) {
      clearSession();
      return null;
    }

    const { user: profile } = await api.get("/auth/me", sessionToken);
    saveSession(sessionToken, profile);
    return profile;
  };

  const completeSocialSignIn = async (firebaseSession) => {
    const { user: profile } = await api.get("/auth/me", firebaseSession.token);
    saveSession(firebaseSession.token, profile);
    return profile;
  };

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const profile = await api.get("/auth/me", token);
        if (active) {
          saveSession(token, profile.user);
        }
      } catch {
        if (active) {
          clearSession();
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    bootstrap();

    return () => {
      active = false;
    };
  }, [token]);

  const register = async (values) => {
    const result = await api.post("/auth/register", values);
    saveSession(result.token, result.user);
    return result.user;
  };

  const login = async (values) => {
    const result = await api.post("/auth/login", values);
    saveSession(result.token, result.user);
    return result.user;
  };

  const signInWithGoogle = async () => {
    if (!SOCIAL_AUTH_ENABLED) {
      throw new Error("Google sign-in is not configured for this environment yet.");
    }

    const firebaseSession = await firebaseLoginWithGoogle();
    return completeSocialSignIn(firebaseSession);
  };

  const loginAsDemo = () =>
    login({
      email: "demo@summitprep.dev",
      password: "demo1234"
    });

  const logout = async () => {
    try {
      if (token) {
        await api.post("/auth/logout", {}, token);
      }
    } catch {
      // Clearing local session is enough if the backend token is already gone.
    }

    try {
      if (SOCIAL_AUTH_ENABLED) {
        await firebaseLogout();
      }
    } catch {
      // Clearing the local session keeps the UI consistent even if Firebase is already signed out.
    } finally {
      clearSession();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        authMode: SOCIAL_AUTH_ENABLED ? "hybrid" : "local",
        socialAuthEnabled: SOCIAL_AUTH_ENABLED,
        token,
        user,
        loading,
        register,
        login,
        signInWithGoogle,
        loginAsDemo,
        logout,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
