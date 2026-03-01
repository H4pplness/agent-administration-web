export type ResourceType = 'http' | 'agent';
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
export type ParamType = 'string' | 'number' | 'boolean';

export interface QueryParamDef {
  name: string;
  type: ParamType;
  description?: string;
}

export interface HttpSchema {
  url: string;
  method: HttpMethod;
  headers?: Record<string, string>;
  queryParams?: Record<string, { type: string; description?: string }>;
}

export interface AgentSchema {
  targetAgentId: number;
  targetAgentName: string;
  capabilities?: string;
  taskTypes?: string[];
}

export interface Resource {
  id: number;
  agentId: number;
  name: string;
  type: ResourceType;
  description?: string;
  schema: HttpSchema | AgentSchema;
}
