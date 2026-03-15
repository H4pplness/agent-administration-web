import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Agent, AgentModel, ChatRequest, ChatResponse } from '../models/agent.model';
import { API_BASE_URL } from '../config/api.config';

interface AgentPayload {
  code: string;
  name: string;
  description: string | null;
  systemPrompt: string | null;
  modelId: number | null;
}

interface ModelPayload {
  modelName: string;
  apiKey: string;
  urlGateway: string;
}

@Injectable({ providedIn: 'root' })
export class AgentService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = API_BASE_URL;

  getAgents(): Observable<Agent[]> {
    return this.http.get<Agent[]>(`${this.apiBase}/agents`);
  }

  getAgent(code: string): Observable<Agent> {
    return this.http.get<Agent>(`${this.apiBase}/agents/${encodeURIComponent(code)}`);
  }

  createAgent(data: { name: string; modelId?: number | null }): Observable<Agent> {
    const payload: AgentPayload = {
      code: this.generateCode(data.name),
      name: data.name.trim(),
      description: null,
      systemPrompt: null,
      modelId: data.modelId ?? null,
    };
    return this.http.post<Agent>(`${this.apiBase}/agents`, payload);
  }

  updateAgent(code: string, data: Partial<Agent>): Observable<Agent> {
    const payload: Partial<AgentPayload> = {};

    if (data.name !== undefined) payload.name = data.name.trim();
    if (data.description !== undefined) payload.description = data.description?.trim() || null;
    if (data.systemPrompt !== undefined) payload.systemPrompt = data.systemPrompt?.trim() || null;
    if (data.modelId !== undefined) payload.modelId = data.modelId ?? null;

    return this.http.put<Agent>(`${this.apiBase}/agents/${encodeURIComponent(code)}`, payload);
  }

  deleteAgent(code: string): Observable<void> {
    return this.http.delete<void>(`${this.apiBase}/agents/${encodeURIComponent(code)}`);
  }

  getModels(): Observable<AgentModel[]> {
    return this.http.get<AgentModel[]>(`${this.apiBase}/models`);
  }

  getModel(modelId: number): Observable<AgentModel> {
    return this.http.get<AgentModel>(`${this.apiBase}/models/${modelId}`);
  }

  createModel(data: ModelPayload): Observable<AgentModel> {
    return this.http.post<AgentModel>(`${this.apiBase}/models`, data);
  }

  updateModel(modelId: number, data: ModelPayload): Observable<AgentModel> {
    return this.http.put<AgentModel>(`${this.apiBase}/models/${modelId}`, data);
  }

  deleteModel(modelId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiBase}/models/${modelId}`);
  }

  chat(req: ChatRequest): Observable<ChatResponse> {
    return this.http
      .post(`${this.apiBase}/agents/chat`, req, { responseType: 'text' })
      .pipe(
        map(response => ({
          response,
          conversationId: req.conversationId ?? '',
          metadata: {},
        }))
      );
  }

  private generateCode(name: string): string {
    const base = name
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40);

    const suffix = Date.now().toString(36).slice(-6);
    return `${base || 'agent'}-${suffix}`;
  }
}
