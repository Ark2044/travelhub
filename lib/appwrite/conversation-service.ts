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
  created_at?: Date;
}

export interface Message {
  id?: string;
  conversation_id: string;
  content: string;
  is_user: boolean;
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
}

export const conversationService = {
  // Create new conversation
  async create(destination: string): Promise<string> {
    const conversation = await databases.createDocument(
      databaseId,
      conversationCollectionId,
      ID.unique(),
      {
        destination,
        created_at: new Date(),
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
    const message = await databases.createDocument(
      databaseId,
      messageCollectionId,
      ID.unique(),
      {
        conversation_id,
        content,
        is_user,
        created_at: new Date(),
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
    const preference = await databases.createDocument(
      databaseId,
      preferenceCollectionId,
      ID.unique(),
      {
        conversation_id,
        ...preferences,
      }
    );
    return preference.$id;
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
