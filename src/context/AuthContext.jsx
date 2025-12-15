import React, { createContext, useContext, useEffect, useState } from "react";
import backend from "../api/backendClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() =>
    localStorage.getItem("authToken")
  );
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let active = true;

    async function validate() {
      setLoading(true);
      try {
        const profile = await backend.get("/Auth/me", { silent: true });
        if (!active) return;
        setUser(profile);
        localStorage.setItem("user", JSON.stringify(profile));
      } catch {
        if (!active) return;
        localStorage.clear();
        setToken(null);
        setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    }

    validate();
    return () => {
      active = false;
    };
  }, [token]);

  async function login(identifier, password) {
    const res = await backend.post("/Auth/login", {
      username: identifier,
      password,
    });

    localStorage.setItem("authToken", res.token);
    localStorage.setItem("user", JSON.stringify(res.user));
    setToken(res.token);
    setUser(res.user);
  }

  async function register(payload) {
    return backend.post("/Auth/register", payload);
  }

  function logout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isLoggedIn: !!user,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
