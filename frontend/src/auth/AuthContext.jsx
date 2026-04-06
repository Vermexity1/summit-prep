import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api/client";
import {
  firebaseLogin,
  firebaseLoginWithGoogle,
  firebaseLogout,
  firebaseRegister
} from "./firebaseClient";

const AUTH_MODE = import.meta.env.VITE_AUTH_MODE || "local";
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
    // Local auth is the zero-config path. Firebase can be turned on through env vars later.
    if (AUTH_MODE === "firebase") {
      const firebaseSession = await firebaseRegister(values);
      const { user: profile } = await api.get("/auth/me", firebaseSession.token);
      saveSession(firebaseSession.token, profile);
      return profile;
    }

    const result = await api.post("/auth/register", values);
    saveSession(result.token, result.user);
    return result.user;
  };

  const login = async (values) => {
    if (AUTH_MODE === "firebase") {
      const firebaseSession = await firebaseLogin(values);
      const { user: profile } = await api.get("/auth/me", firebaseSession.token);
      saveSession(firebaseSession.token, profile);
      return profile;
    }

    const result = await api.post("/auth/login", values);
    saveSession(result.token, result.user);
    return result.user;
  };

  const signInWithGoogle = async () => {
    if (AUTH_MODE !== "firebase") {
      throw new Error("Google sign-in is available only when Firebase auth mode is enabled.");
    }

    const firebaseSession = await firebaseLoginWithGoogle();
    const { user: profile } = await api.get("/auth/me", firebaseSession.token);
    saveSession(firebaseSession.token, profile);
    return profile;
  };

  const loginAsDemo = () =>
    login({
      email: "demo@summitprep.dev",
      password: "demo1234"
    });

  const logout = async () => {
    try {
      if (AUTH_MODE === "firebase") {
        await firebaseLogout();
      } else if (token) {
        await api.post("/auth/logout", {}, token);
      }
    } catch {
      // Clearing local session is enough for demo mode.
    } finally {
      clearSession();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        authMode: AUTH_MODE,
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
