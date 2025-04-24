import { Client, Databases, IndexType } from "node-appwrite";
import {
  databaseId,
  conversationCollectionId,
  messageCollectionId,
  preferenceCollectionId,
} from "./config";

// Define attribute and schema interfaces for strong typing
interface Attribute {
  type: "string" | "enum" | "number" | "boolean" | "datetime";
  key: string;
  required: boolean;
  array: boolean;
  size?: number;
  default?: string | number | boolean | null;
  elements?: string[];
  min?: number;
  max?: number;
}

interface IndexSchema {
  key: string;
  type: IndexType;
  attributes: string[];
  orders: ("ASC" | "DESC")[];
}

interface CollectionSchema {
  collectionId: string;
  name: string;
  permissions: string[];
  attributes: Attribute[];
  indexes: IndexSchema[];
}

// Collection schemas with explicit collectionId fields
const COLLECTION_SCHEMAS: Record<string, CollectionSchema> = {
  conversations: {
    collectionId: conversationCollectionId,
    name: "conversations",
    permissions: ['read("any")', 'write("users")'],
    attributes: [
      {
        type: "string",
        key: "user_id",
        required: true,
        array: false,
        size: 36,
      },
      { type: "string", key: "name", required: true, array: false, size: 255 },
      {type: "string", key: "destination", required: true, array: false, size: 255 },
      { type: "datetime", key: "created_at", required: true, array: false },
      { type: "datetime", key: "updated_at", required: true, array: false },
    ],
    indexes: [
      {
        key: "idx_userId",
        type: IndexType.Key,
        attributes: ["user_id"],
        orders: ["ASC"],
      },
    ],
  },
  messages: {
    collectionId: messageCollectionId,
    name: "messages",
    permissions: ['read("any")', 'write("users")'],
    attributes: [
      {
        type: "string",
        key: "conversation_id",
        required: true,
        array: false,
        size: 36,
      },
      {
        type: "enum",
        key: "role",
        required: true,
        array: false,
        elements: ["user", "assistant"],
      },
      {
        type: "string",
        key: "content",
        required: true,
        array: false,
        size: 100000,
      },
      { type: "datetime", key: "created_at", required: true, array: false },
    ],
    indexes: [
      {
        key: "idx_convId",
        type: IndexType.Key,
        attributes: ["conversation_id"],
        orders: ["ASC"],
      },
    ],
  },
  preferences: {
    collectionId: preferenceCollectionId,
    name: "preferences",
    permissions: ['read("any")', 'write("users")'],
    attributes: [
      {
        type: "string",
        key: "conversation_id",
        required: true,
        array: false,
        size: 36,
      },
      {
        type: "string",
        key: "destination",
        required: false,
        array: false,
        size: 255,
        default: null,
      },
      {
        type: "string",
        key: "budget",
        required: false,
        array: false,
        size: 255,
        default: null,
      },
      {
        type: "string",
        key: "dates",
        required: false,
        array: false,
        size: 255,
        default: null,
      },
      {
        type: "string",
        key: "num_travelers",
        required: false,
        array: false,
        size: 100,
        default: null,
      },
      {
        type: "string",
        key: "interests",
        required: false,
        array: false,
        size: 1000,
        default: null,
      },
      {
        type: "string",
        key: "accommodation_preference",
        required: false,
        array: false,
        size: 255,
        default: null,
      },
      {
        type: "string",
        key: "pace_preference",
        required: false,
        array: false,
        size: 255,
        default: null,
      },
      {
        type: "string",
        key: "transport_preference",
        required: false,
        array: false,
        size: 255,
        default: null,
      },
      {
        type: "string",
        key: "must_see_places",
        required: false,
        array: false,
        size: 1000,
        default: null,
      },
      {
        type: "datetime",
        key: "updated_at",
        required: false,
        array: false,
        default: null,
      },
    ],
    indexes: [
      {
        key: "idx_prefConv",
        type: IndexType.Key,
        attributes: ["conversation_id"],
        orders: ["ASC"],
      },
    ],
  },
};

const createServerClient = (): Client => {
  return new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);
};

/**
 * Initializes Appwrite database and collections if they don't exist
 */
export const initializeDatabase = async (): Promise<boolean> => {
  try {
    const client = createServerClient();
    const databases = new Databases(client);

    // First, list all databases to check if our database already exists
    let databaseExists = false;
    try {
      const { databases: dbList } = await databases.list();
      databaseExists = dbList.some((db) => db.$id === databaseId);

      if (databaseExists) {
        console.log("Database already exists");
      } else {
        // Only attempt to create if we confirmed it doesn't exist
        console.log("Creating database...");
        await databases.create(databaseId, "TravelHub Database");
        console.log("Database created");
      }
    } catch (error) {
      console.error("Database check/create failed:", error);
      // Try to continue with existing database even if we can't create a new one
      console.log(
        "Attempting to continue with existing database if available..."
      );
    }

    // Loop through each schema
    for (const schema of Object.values(COLLECTION_SCHEMAS)) {
      const { collectionId, name, permissions, attributes, indexes } = schema;
      try {
        await databases.getCollection(databaseId, collectionId);
        console.log(`${name} collection exists`);
      } catch {
        console.log(`Creating ${name} collection...`);
        await databases.createCollection(
          databaseId,
          collectionId,
          name,
          permissions,
          false,
          true
        );

        // Create attributes
        for (const attr of attributes) {
          switch (attr.type) {
            case "string":
              await databases.createStringAttribute(
                databaseId,
                collectionId,
                attr.key,
                attr.size ?? 255,
                attr.required,
                typeof attr.default === "string" ? attr.default : undefined,
                attr.array,
                false
              );
              break;
            case "enum":
              await databases.createEnumAttribute(
                databaseId,
                collectionId,
                attr.key,
                attr.elements || [],
                attr.required,
                typeof attr.default === "string" ? attr.default : undefined,
                attr.array
              );
              break;
            case "number":
              await databases.createIntegerAttribute(
                databaseId,
                collectionId,
                attr.key,
                attr.required,
                attr.min ?? undefined,
                attr.max ?? undefined,
                typeof attr.default === "number" ? attr.default : undefined,
                attr.array
              );
              break;
            case "boolean":
              await databases.createBooleanAttribute(
                databaseId,
                collectionId,
                attr.key,
                attr.required,
                attr.default as boolean,
                attr.array
              );
              break;
            case "datetime":
              await databases.createDatetimeAttribute(
                databaseId,
                collectionId,
                attr.key,
                attr.required,
                typeof attr.default === "string" ? attr.default : undefined,
                attr.array
              );
              break;
          }
        }

        // Create indexes
        for (const idx of indexes) {
          await databases.createIndex(
            databaseId,
            collectionId,
            idx.key,
            idx.type,
            idx.attributes,
            idx.orders
          );
        }

        console.log(`${name} initialized`);
      }
    }

    console.log("All collections initialized successfully");
    return true;
  } catch (error) {
    console.error("Failed to initialize database:", error);
    return false;
  }
};

export const DB_CONSTANTS = {
  COLLECTIONS: {
    CONVERSATION: conversationCollectionId,
    MESSAGE: messageCollectionId,
    PREFERENCE: preferenceCollectionId,
  },
  DATABASE_ID: databaseId,
};
