import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import { authApi, getAuthToken, type User as ApiUser } from "../lib/api";

type UserRole = "user" | "pharmacy" | "admin" | null;

interface User {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; role: UserRole; error?: string }>;
  register: (email: string, password: string, name: string, phone?: string) => Promise<{ success: boolean; role: UserRole; error?: string }>;
  logout: () => void;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mapApiRole = (role: ApiUser["role"]): UserRole => {
  switch (role) {
    case "ADMIN":
      return "admin";
    case "PHARMACY":
      return "pharmacy";
    case "USER":
    default:
      return "user";
  }
};

const mapApiUserToUser = (apiUser: ApiUser): User => ({
  id: apiUser.id,
  email: apiUser.email,
  name: apiUser.name,
  phone: apiUser.phone,
  role: mapApiRole(apiUser.role),
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await authApi.getCurrentUser();
      if (response.data?.user) {
        setUser(mapApiUserToUser(response.data.user));
      } else {
        authApi.logout();
        setUser(null);
      }
    } catch {
      authApi.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; role: UserRole; error?: string }> => {
    try {
      const response = await authApi.login(email, password);
      if (response.data?.user) {
        const mappedUser = mapApiUserToUser(response.data.user);
        setUser(mappedUser);
        return { success: true, role: mappedUser.role };
      }
      return { success: false, role: null, error: "Login failed" };
    } catch (err) {
      const error = err as Error;
      return { success: false, role: null, error: error.message || "Login failed" };
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    phone?: string
  ): Promise<{ success: boolean; role: UserRole; error?: string }> => {
    try {
      const response = await authApi.register({ email, password, name, phone });
      if (response.data?.user) {
        const mappedUser = mapApiUserToUser(response.data.user);
        setUser(mappedUser);
        return { success: true, role: mappedUser.role };
      }
      return { success: false, role: null, error: "Registration failed" };
    } catch (err) {
      const error = err as Error;
      return { success: false, role: null, error: error.message || "Registration failed" };
    }
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        isLoading,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
