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
  } catch (error) {
    console.error("Error creating user account:", error);
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
    const currentAccount = await account.get();
    if (!currentAccount) throw Error;

    return currentAccount;
  } catch (error) {
    console.error("Error getting current user:", error);
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
