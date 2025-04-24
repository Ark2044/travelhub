import { ID, account } from "./config";

export type CreateUserAccount = {
  email: string;
  password: string;
  name: string;
};

export type LoginUserAccount = {
  email: string;
  password: string;
};

export async function createUserAccount(user: CreateUserAccount) {
  try {
    const newAccount = await account.create(
      ID.unique(),
      user.email,
      user.password,
      user.name
    );

    if (!newAccount) throw Error;

    const session = await signInAccount({
      email: user.email,
      password: user.password,
    });

    return session;
  } catch (error: unknown) {
    console.error("Error creating user account:", error);

    // Check if error is for an existing user
    if (
      error instanceof Error &&
      error.message.includes(
        "user with the same id, email, or phone already exists"
      )
    ) {
      throw new Error(
        "An account with this email already exists. Please try logging in instead."
      );
    }

    // Password requirements error
    if (error instanceof Error && error.message.includes("password must be")) {
      throw new Error(
        "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character."
      );
    }

    // Invalid email format
    if (error instanceof Error && error.message.includes("Invalid email")) {
      throw new Error("Please enter a valid email address.");
    }

    // Generic error
    throw new Error("Failed to create account. Please try again.");
  }
}

export async function signInAccount(user: LoginUserAccount) {
  try {
    const session = await account.createEmailPasswordSession(
      user.email,
      user.password
    );
    return session;
  } catch (error) {
    console.error("Error signing in user:", error);

    if (
      error instanceof Error &&
      error.message.includes("Invalid credentials")
    ) {
      throw new Error("Invalid email or password. Please try again.");
    }

    if (error instanceof Error && error.message.includes("Rate limit")) {
      throw new Error("Too many login attempts. Please try again later.");
    }

    throw new Error("Failed to sign in. Please try again later.");
  }
}

export async function getCurrentUser() {
  try {
    // Check if we're in a browser environment before attempting to get the account
    if (typeof window === "undefined") {
      console.log("Not in browser environment, skipping auth check");
      return null;
    }

    // Try to get the current account with retry logic
    let attempts = 0;
    const maxAttempts = 2;
    let currentAccount = null;

    while (attempts < maxAttempts && !currentAccount) {
      try {
        currentAccount = await account.get();
        break;
      } catch (retryError) {
        attempts++;
        if (attempts < maxAttempts) {
          console.log(`Retrying account fetch, attempt ${attempts}`);
          await new Promise((resolve) => setTimeout(resolve, 300));
        } else {
          throw retryError;
        }
      }
    }

    if (!currentAccount) {
      console.log("No account found after attempts");
      return null;
    }

    return currentAccount;
  } catch (error) {
    // Check specifically for authentication errors
    if (
      error instanceof Error &&
      (error.message.includes("Missing credentials") ||
        error.message.includes("Invalid credentials") ||
        error.message.includes("missing scope"))
    ) {
      console.log(
        "Authentication error: User not logged in or session expired"
      );
    } else {
      console.error("Error getting current user:", error);
    }
    return null;
  }
}

export async function signOutAccount() {
  try {
    const session = await account.deleteSession("current");
    return session;
  } catch (error) {
    console.error("Error signing out user:", error);
    throw error;
  }
}

export async function sendPasswordRecovery(email: string) {
  try {
    await account.createRecovery(
      email,
      `${window.location.origin}/reset-password`
    );
    return { success: true };
  } catch (error) {
    console.error("Error sending password recovery:", error);

    // Check if user does not exist
    if (
      error instanceof Error &&
      error.message.includes("User with the requested email")
    ) {
      throw new Error("No account exists with this email address.");
    }

    throw new Error(
      "Failed to send password reset email. Please try again later."
    );
  }
}

export async function resetPassword(
  userId: string,
  secret: string,
  password: string,
  confirmPassword: string
) {
  if (password !== confirmPassword) {
    throw new Error("Passwords do not match");
  }

  try {
    return await account.updateRecovery(userId, secret, password);
  } catch (error) {
    console.error("Error resetting password:", error);

    // Invalid or expired recovery token
    if (error instanceof Error && error.message.includes("Recovery token")) {
      throw new Error("Recovery link has expired. Please request a new one.");
    }

    // Password requirements error
    if (error instanceof Error && error.message.includes("password must be")) {
      throw new Error(
        "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character."
      );
    }

    throw new Error("Failed to reset password. Please try again.");
  }
}

// Function to update user profile
export async function updateUserProfile(name: string) {
  try {
    return await account.updateName(name);
  } catch (error) {
    console.error("Error updating profile:", error);
    throw new Error("Failed to update profile. Please try again.");
  }
}
