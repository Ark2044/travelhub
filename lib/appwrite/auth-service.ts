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

    throw error;
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
    throw error;
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
    throw error;
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
    throw error;
  }
}
