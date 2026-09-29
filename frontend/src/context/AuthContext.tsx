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
  getCurrentUser,
  type CurrentUser,
} from "../services/authService";

interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: CurrentUser | null;
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

  const [currentUser, setCurrentUser] =
    useState<CurrentUser | null>(null);

  async function login(
    email: string,
    password: string
  ): Promise<void> {
    await loginService(email, password);

    const user = await getCurrentUser();

    setCurrentUser(user);
    setAuthenticated(true);
  }

  function logout(): void {
    logoutService();
    setCurrentUser(null);
    setAuthenticated(false);
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: authenticated,
        currentUser,
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