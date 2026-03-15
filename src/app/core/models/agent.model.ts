export interface Agent {
  code: string;
  name: string;
  description: string | null;
  systemPrompt: string | null;
  modelId: number | null;
}

export interface AgentModel {
  modelId: number;
  modelName: string;
  apiKey: string;
  urlGateway: string;
}

export interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  messageId?: string;
  createdDate?: string;
  isToolCall?: boolean;
  toolName?: string;
}

export interface ChatRequest {
  agentCode: string;
  conversationId?: string;
  messageId?: string;
  userId?: string;
  messages: { role: string; content: string }[];
}

export interface ChatResponse {
  response: string | { tool: string; input: Record<string, unknown> };
  conversationId: string;
  metadata?: { waitingForUser?: boolean };
}
