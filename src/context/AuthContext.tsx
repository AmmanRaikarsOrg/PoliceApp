import React, {
  createContext,
  ReactNode,
  useState,
} from "react";

type AuthContextValue = {
  user: unknown | null;
  isAuthenticated: boolean;
  login: (user: unknown) => void;
  logout: () => void;
};

export const AuthContext =
  createContext<AuthContextValue>({
    user: null,
    isAuthenticated: false,
    login: () => {},
    logout: () => {},
  });

type Props = {
  children: ReactNode;
};

export function AuthProvider({
  children,
}: Props) {
  const [user, setUser] =
    useState<unknown | null>(null);

  const login = (loggedInUser: unknown) => {
    setUser(loggedInUser);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}