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
import { createPersistStorage } from "../utils";

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

          const currentAccount = await getCurrentUser();

          if (currentAccount) {
            set((state) => {
              state.user = currentAccount;
              state.isAuthenticated = true;
              state.isLoading = false;
            });
            return true;
          }

          set((state) => {
            state.isLoading = false;
          });

          return false;
        } catch (error) {
          console.error("Error checking auth status:", error);
          set((state) => {
            state.isLoading = false;
          });
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
              return true;
            }
          }

          set((state) => {
            state.isLoading = false;
          });

          return false;
        } catch (error) {
          console.error("Login error:", error);
          set((state) => {
            state.isLoading = false;
          });
          return false;
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

          set((state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.isLoading = false;
          });

          return true;
        } catch (error) {
          console.error("Logout error:", error);
          set((state) => {
            state.isLoading = false;
          });
          return false;
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
