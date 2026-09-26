import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

import {
  login as loginService,
  logout as logoutService,
  isAuthenticated,
} from "../services/authService";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [authenticated, setAuthenticated] = useState(
    isAuthenticated()
  );

  async function login(
    email: string,
    password: string
  ): Promise<void> {
    await loginService(email, password);
    setAuthenticated(true);
  }

  function logout(): void {
    logoutService();
    setAuthenticated(false);
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: authenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside an AuthProvider"
    );
  }

  return context;
}