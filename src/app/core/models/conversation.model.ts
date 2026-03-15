export interface Conversation {
  conversationId: string;
  userId: string;
  title: string | null;
  createdDate: string;
  updatedDate: string;
}

export interface ConversationMessage {
  messageId: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'tool';
  content: string;
  createdDate: string;
  updatedDate: string;
}

export interface UpsertConversationRequest {
  conversationId: string;
  userId: string;
  title?: string;
}
