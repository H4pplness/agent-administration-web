import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Agent, AgentModel, ChatRequest, ChatResponse } from '../models/agent.model';

const MOCK_MODELS: AgentModel[] = [
  { id: 'claude-opus-4-6', name: 'Claude Opus 4.6' },
  { id: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6' },
  { id: 'claude-haiku-4-5', name: 'Claude Haiku 4.5' },
];

let _nextId = 4;
let _agents: Agent[] = [
  {
    id: 1,
    name: 'Customer Support Agent',
    modelId: 'claude-sonnet-4-6',
    context: 'You are a helpful customer support agent for Acme Corp. You help users with order tracking, returns, and product info.',
    systemPrompt: null,
  },
  {
    id: 2,
    name: 'Sales Assistant',
    modelId: 'claude-haiku-4-5',
    context: 'You help customers choose the right products and process orders efficiently.',
    systemPrompt: null,
  },
  {
    id: 3,
    name: 'Data Analyst',
    modelId: 'claude-opus-4-6',
    context: 'You analyze data and provide statistical insights and visualizations.',
    systemPrompt: null,
  },
];

@Injectable({ providedIn: 'root' })
export class AgentService {
  getAgents(): Observable<Agent[]> {
    return of(_agents.map(a => ({ ...a }))).pipe(delay(200));
  }

  getAgent(id: number): Observable<Agent> {
    const agent = _agents.find(a => a.id === id);
    if (!agent) return throwError(() => new Error('Agent not found'));
    return of({ ...agent }).pipe(delay(200));
  }

  createAgent(data: { name: string; modelId?: string | null }): Observable<Agent> {
    const agent: Agent = {
      id: _nextId++,
      name: data.name,
      modelId: data.modelId ?? null,
      context: null,
      systemPrompt: null,
    };
    _agents = [..._agents, agent];
    return of({ ...agent }).pipe(delay(300));
  }

  updateAgent(id: number, data: Partial<Agent>): Observable<Agent> {
    _agents = _agents.map(a => (a.id === id ? { ...a, ...data } : a));
    const updated = _agents.find(a => a.id === id);
    if (!updated) return throwError(() => new Error('Agent not found'));
    return of({ ...updated }).pipe(delay(300));
  }

  deleteAgent(id: number): Observable<void> {
    _agents = _agents.filter(a => a.id !== id);
    return of(undefined).pipe(delay(300));
  }

  getModels(): Observable<AgentModel[]> {
    return of([...MOCK_MODELS]).pipe(delay(200));
  }

  chat(req: ChatRequest): Observable<ChatResponse> {
    const lastMsg = req.messages[req.messages.length - 1]?.content ?? '';
    const convId = req.conversationId ?? String(Date.now());
    const response: ChatResponse = {
      response: `I received your message: "${lastMsg}". This is a mock response from the agent. In a real deployment, I would call the Claude API and return an intelligent response.`,
      conversationId: convId,
      metadata: {},
    };
    return of(response).pipe(delay(1200));
  }
}
