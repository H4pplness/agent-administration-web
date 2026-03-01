export interface Agent {
  id: number;
  name: string;
  modelId: string | null;
  context: string | null;
  systemPrompt: string | null;
}

export interface AgentModel {
  id: string;
  name: string;
}

export interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  isToolCall?: boolean;
  toolName?: string;
}

export interface ChatRequest {
  agentId: number;
  conversationId?: string;
  messages: { role: string; content: string }[];
}

export interface ChatResponse {
  response: string | { tool: string; input: Record<string, unknown> };
  conversationId: string;
  metadata?: { waitingForUser?: boolean };
}
