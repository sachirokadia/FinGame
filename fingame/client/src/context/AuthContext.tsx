import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authAPI, userAPI, type LoginCredentials, type RegisterCredentials } from "../api";

interface UserProfile {
  id: string;
  email: string;
  name: string;
  level: number;
  xp: number;
  streak: number;
  xpInCurrentLevel: number;
  xpForNextLevel: number;
  tourCompleted?: boolean;
  monthlyBudget: number;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  authError: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  completeTour: () => Promise<void>;
  updateBudget: (monthlyBudget: number) => Promise<void>;
  showXPToast: (xp: number, message?: string) => void;
  xpToast: { visible: boolean; xp: number; message?: string } | null;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("fingame_token"));
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [xpToast, setXpToast] = useState<{ visible: boolean; xp: number; message?: string } | null>(null);

  const clearAuthError = () => setAuthError(null);

  const showXPToast = (xp: number, message?: string) => {
    setXpToast({ visible: true, xp, message });
    setTimeout(() => {
      setXpToast((prev) => prev ? { ...prev, visible: false } : null);
    }, 2500);
  };

  const logout = () => {
    localStorage.removeItem("fingame_token");
    setToken(null);
    setUser(null);
    setLoading(false);
    setAuthError(null);
  };

  const refreshProfile = async () => {
    try {
      const storedToken = localStorage.getItem("fingame_token");
      if (storedToken) {
        const response = await userAPI.getProfile();
        setUser(response.data);
        setAuthError(null);
      } else {
        setUser(null);
      }
    } catch {
      setAuthError("Session expired. Please log in again.");
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshProfile();
  }, [token]);

  const login = async (credentials: LoginCredentials) => {
    setLoading(true);
    setAuthError(null);
    try {
      const response = await authAPI.login(credentials);
      const { token: receivedToken } = response.data;
      localStorage.setItem("fingame_token", receivedToken);
      setToken(receivedToken);
      await refreshProfile();
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    setLoading(true);
    setAuthError(null);
    try {
      const response = await authAPI.register(credentials);
      const { token: receivedToken } = response.data;
      localStorage.setItem("fingame_token", receivedToken);
      setToken(receivedToken);
      await refreshProfile();
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const completeTour = async () => {
    try {
      await userAPI.completeTour();
      setUser((prev) => (prev ? { ...prev, tourCompleted: true } : null));
    } catch {
      setAuthError("Could not save tour progress. You can continue using the app.");
    }
  };

  const updateBudget = async (monthlyBudget: number) => {
    try {
      await userAPI.updateBudget(monthlyBudget);
      setUser((prev) => (prev ? { ...prev, monthlyBudget } : null));
    } catch {
      throw new Error("Failed to update budget. Please try again.");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        authError,
        login,
        register,
        logout,
        refreshProfile,
        completeTour,
        updateBudget,
        showXPToast,
        xpToast,
        clearAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
