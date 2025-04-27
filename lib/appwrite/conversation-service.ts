import {
  databases,
  databaseId,
  conversationCollectionId,
  messageCollectionId,
  preferenceCollectionId,
  ID,
  Query,
} from "./config";

export interface Conversation {
  id?: string;
  destination: string;
  name?: string; // Adding name field to the interface
  created_at?: Date;
  updated_at?: Date; // Added updated_at field
}

export interface Message {
  id?: string;
  conversation_id: string;
  content: string;
  is_user: boolean; // We'll keep this for backwards compatibility
  role?: string; // Adding role field to match database schema
  created_at?: Date;
}

export interface TravelPreference {
  id?: string;
  conversation_id: string;
  destination: string;
  budget: string;
  dates: string;
  num_travelers: string;
  interests: string;
  accommodation_preference: string;
  pace_preference: string;
  transport_preference: string;
  must_see_places: string;
  updated_at?: Date; // Added updated_at field
}

export const conversationService = {
  // Create new conversation
  async create(destination: string, user_id: string): Promise<string> {
    const now = new Date();
    const conversation = await databases.createDocument(
      databaseId,
      conversationCollectionId,
      ID.unique(),
      {
        destination,
        user_id,
        name: destination, // Adding the name attribute using destination as default
        created_at: now,
        updated_at: now, // Added updated_at field
      }
    );
    return conversation.$id;
  },

  // Get all conversations
  async listAll(): Promise<Conversation[]> {
    const response = await databases.listDocuments(
      databaseId,
      conversationCollectionId,
      [Query.orderDesc("created_at")]
    );
    return response.documents as unknown as Conversation[];
  },

  // Get conversation by ID
  async get(id: string): Promise<Conversation> {
    const conversation = await databases.getDocument(
      databaseId,
      conversationCollectionId,
      id
    );
    return conversation as unknown as Conversation;
  },

  // Add message to conversation
  async addMessage(
    conversation_id: string,
    content: string,
    is_user: boolean
  ): Promise<string> {
    const now = new Date();
    const message = await databases.createDocument(
      databaseId,
      messageCollectionId,
      ID.unique(),
      {
        conversation_id,
        content,
        role: is_user ? "user" : "assistant", // Set the required role field based on is_user
        created_at: now,
      }
    );
    return message.$id;
  },

  // Get all messages for a conversation
  async getMessages(conversation_id: string): Promise<Message[]> {
    const response = await databases.listDocuments(
      databaseId,
      messageCollectionId,
      [
        Query.equal("conversation_id", conversation_id),
        Query.orderAsc("created_at"),
      ]
    );
    return response.documents as unknown as Message[];
  },

  // Store travel preferences
  async storePreferences(
    conversation_id: string,
    preferences: Omit<TravelPreference, "id" | "conversation_id">
  ): Promise<string> {
    const now = new Date();

    // First check if there's already a preference document for this conversation
    try {
      const existingPrefs = await this.getPreferences(conversation_id);

      // If there is an existing document, update it instead of creating a new one
      if (existingPrefs && existingPrefs.id) {
        const updatedPrefs = await databases.updateDocument(
          databaseId,
          preferenceCollectionId,
          existingPrefs.id,
          {
            ...preferences,
            updated_at: now,
          }
        );
        return updatedPrefs.$id;
      }
    } catch (error) {
      console.log(
        "No existing preferences found, creating new document",
        error
      );
    }

    // Create a new document with safe parameters
    try {
      const preferenceData = {
        conversation_id,
        destination: preferences.destination, // Add the destination field
        budget: preferences.budget,
        dates: preferences.dates,
        num_travelers: preferences.num_travelers,
        interests: preferences.interests,
        accommodation_preference: preferences.accommodation_preference,
        pace_preference: preferences.pace_preference,
        transport_preference: preferences.transport_preference,
        must_see_places: preferences.must_see_places,
        updated_at: now,
      };

      const preference = await databases.createDocument(
        databaseId,
        preferenceCollectionId,
        ID.unique(),
        preferenceData
      );
      return preference.$id;
    } catch (error) {
      console.error("Error storing preferences:", error);
      throw error;
    }
  },

  // Get preferences for a conversation
  async getPreferences(
    conversation_id: string
  ): Promise<TravelPreference | null> {
    const response = await databases.listDocuments(
      databaseId,
      preferenceCollectionId,
      [Query.equal("conversation_id", conversation_id)]
    );

    if (response.documents.length === 0) {
      return null;
    }

    return response.documents[0] as unknown as TravelPreference;
  },
};
