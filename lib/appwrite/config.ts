import { Client, Account, ID, Databases, Storage, Query } from "appwrite";

// Appwrite Configuration
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!) // Your Appwrite API endpoint
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!); // Your project ID

// Create Account, Database, Storage instances
const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);

// Database and Collection IDs
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const conversationCollectionId =
  process.env.NEXT_PUBLIC_APPWRITE_CONVERSATION_COLLECTION_ID!;
const messageCollectionId =
  process.env.NEXT_PUBLIC_APPWRITE_MESSAGE_COLLECTION_ID!;
const preferenceCollectionId =
  process.env.NEXT_PUBLIC_APPWRITE_PREFERENCE_COLLECTION_ID!;

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
