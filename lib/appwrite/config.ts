import { Client, Account, ID, Databases, Storage, Query } from "appwrite";

// Appwrite Configuration
const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1") // Your Appwrite API endpoint
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID as string); // Your project ID

// Create Account, Database, Storage instances
const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);

// Database and Collection IDs
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID as string;
const conversationCollectionId = process.env
  .NEXT_PUBLIC_APPWRITE_CONVERSATION_COLLECTION_ID as string;
const messageCollectionId = process.env
  .NEXT_PUBLIC_APPWRITE_MESSAGE_COLLECTION_ID as string;
const preferenceCollectionId = process.env
  .NEXT_PUBLIC_APPWRITE_PREFERENCE_COLLECTION_ID as string;

export {
  client,
  account,
  databases,
  storage,
  ID,
  Query,
  databaseId,
  conversationCollectionId,
  messageCollectionId,
  preferenceCollectionId,
};
