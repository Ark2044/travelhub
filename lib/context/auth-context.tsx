"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Models } from "appwrite";

import {
  getCurrentUser,
  createUserAccount,
  signInAccount,
  signOutAccount,
  LoginUserAccount,
  CreateUserAccount,
} from "../appwrite/auth-service";

interface AuthContextType {
  user: Models.User<Models.Preferences> | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: React.Dispatch<
    React.SetStateAction<Models.User<Models.Preferences> | null>
  >;
  checkAuthStatus: () => Promise<boolean>;
  login: (credentials: LoginUserAccount) => Promise<void>;
  signup: (userData: CreateUserAccount) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  const checkAuthStatus = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      const currentAccount = await getCurrentUser();

      if (currentAccount) {
        setUser(currentAccount);
        setIsAuthenticated(true);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error checking auth status:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginUserAccount) => {
    try {
      setIsLoading(true);
      const session = await signInAccount(credentials);

      if (session) {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setIsAuthenticated(true);
          router.push("/");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: CreateUserAccount) => {
    try {
      setIsLoading(true);
      const session = await createUserAccount(userData);

      if (session) {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setIsAuthenticated(true);
          router.push("/");
        }
      }
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await signOutAccount();
      setUser(null);
      setIsAuthenticated(false);
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    setUser,
    checkAuthStatus,
    login,
    signup,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
