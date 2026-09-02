import React, { createContext, ReactNode, useEffect, useState } from "react";
import { User, LoginPayload } from "../utils/types";
import * as authService from "../services/auth/authService";
import { getAuthToken } from "../services/api/client";

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAuthenticated: false,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

type Props = { children: ReactNode };

export function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Auto-login on mount: check for stored token and fetch profile
  useEffect(() => {
    (async () => {
      try {
        const token = await getAuthToken();
        if (token) {
          const profile = await authService.getProfile();
          setUser({ ...profile, id: profile.id || (profile as any)._id });
        }
      } catch (error) {
        console.warn("Auto-login failed:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (payload: LoginPayload) => {
    const result = await authService.login(payload);
    const u = result.user;
    setUser({ ...u, id: u.id || (u as any)._id });
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}