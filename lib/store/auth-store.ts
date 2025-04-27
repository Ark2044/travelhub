import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { Models } from "appwrite";

import {
  getCurrentUser,
  createUserAccount,
  signInAccount,
  signOutAccount,
  sendPasswordRecovery,
  resetPassword,
  CreateUserAccount,
  LoginUserAccount,
} from "../appwrite/auth-service";
import { createPersistStorage, syncToCookies } from "../utils";

interface AuthState {
  user: Models.User<Models.Preferences> | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Methods
  checkAuthStatus: () => Promise<boolean>;
  login: (credentials: LoginUserAccount) => Promise<boolean>;
  signup: (userData: CreateUserAccount) => Promise<boolean>;
  logout: () => Promise<boolean>;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (params: {
    userId: string;
    secret: string;
    password: string;
    confirmPassword?: string;
  }) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    immer((set) => ({
      user: null,
      isLoading: true,
      isAuthenticated: false,

      checkAuthStatus: async () => {
        try {
          set((state) => {
            state.isLoading = true;
          });

          // First clear any previous errors
          console.log("Checking auth status...");

          const currentAccount = await getCurrentUser();

          if (currentAccount) {
            set((state) => {
              state.user = currentAccount;
              state.isAuthenticated = true;
              state.isLoading = false;
            });

            // Synchronize auth state to cookies for SSR/middleware
            syncToCookies("auth-storage", {
              state: {
                user: currentAccount,
                isAuthenticated: true,
              },
            });

            return true;
          }

          // If we reach here, user is not authenticated
          set((state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.isLoading = false;
          });

          // Clear cookies if not authenticated
          document.cookie =
            "auth-storage=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

          return false;
        } catch (error) {
          console.error("Error checking auth status:", error);

          // Reset to unauthenticated state
          set((state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.isLoading = false;
          });

          // Clear cookies
          document.cookie =
            "auth-storage=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

          return false;
        }
      },

      login: async (credentials) => {
        try {
          set((state) => {
            state.isLoading = true;
          });

          const session = await signInAccount(credentials);

          if (session) {
            // Add a small delay to ensure the session is properly established
            await new Promise((resolve) => setTimeout(resolve, 500));

            const currentUser = await getCurrentUser();
            if (currentUser) {
              set((state) => {
                state.user = currentUser;
                state.isAuthenticated = true;
                state.isLoading = false;
              });

              // Synchronize auth state to cookies for SSR/middleware
              syncToCookies("auth-storage", {
                state: {
                  user: currentUser,
                  isAuthenticated: true,
                },
              });

              return true;
            }
          }

          set((state) => {
            state.isLoading = false;
            state.isAuthenticated = false;
            state.user = null;
          });

          return false;
        } catch (error) {
          console.error("Login error:", error);
          set((state) => {
            state.isLoading = false;
            state.isAuthenticated = false;
            state.user = null;
          });
          throw error; // Re-throw for component handling
        }
      },

      signup: async (userData) => {
        try {
          set((state) => {
            state.isLoading = true;
          });

          const session = await createUserAccount(userData);

          if (session) {
            // Add a small delay to ensure the session is properly established
            await new Promise((resolve) => setTimeout(resolve, 500));

            const currentUser = await getCurrentUser();
            if (currentUser) {
              set((state) => {
                state.user = currentUser;
                state.isAuthenticated = true;
                state.isLoading = false;
              });

              // Synchronize auth state to cookies for SSR/middleware
              syncToCookies("auth-storage", {
                state: {
                  user: currentUser,
                  isAuthenticated: true,
                },
              });

              return true;
            }
          }

          set((state) => {
            state.isLoading = false;
          });

          return false;
        } catch (error) {
          console.error("Signup error:", error);
          set((state) => {
            state.isLoading = false;
          });
          throw error; // Re-throw for component handling
        }
      },

      logout: async () => {
        try {
          set((state) => {
            state.isLoading = true;
          });

          await signOutAccount();

          // Clear state
          set((state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.isLoading = false;
          });

          // Clear cookies
          document.cookie =
            "auth-storage=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

          // Clear localStorage
          localStorage.removeItem("auth-storage");

          return true;
        } catch (error) {
          console.error("Logout error:", error);

          // Even if there's an error, we'll clear the state and cookies
          set((state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.isLoading = false;
          });

          // Clear cookies
          document.cookie =
            "auth-storage=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

          // Clear localStorage
          localStorage.removeItem("auth-storage");

          return true; // Return true anyway since we've cleaned up client-side state
        }
      },

      forgotPassword: async (email) => {
        try {
          await sendPasswordRecovery(email);
          return true;
        } catch (error) {
          console.error("Password recovery error:", error);
          return false;
        }
      },

      resetPassword: async (params) => {
        try {
          const {
            userId,
            secret,
            password,
            confirmPassword = password,
          } = params;
          await resetPassword(userId, secret, password, confirmPassword);
          return true;
        } catch (error) {
          console.error("Password reset error:", error);
          throw error; // Re-throw to allow component to handle specific errors
        }
      },
    })),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => createPersistStorage()),
      // Only persist certain parts of the state to localStorage
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
