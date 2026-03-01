import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Resource } from '../models/resource.model';

let _nextId = 4;
let _resources: Resource[] = [
  {
    id: 1,
    agentId: 1,
    name: 'Weather API',
    type: 'http',
    description: 'Get current weather data',
    schema: {
      url: 'https://api.openweathermap.org/data/2.5/weather',
      method: 'GET',
      headers: { Authorization: 'Bearer {token}' },
      queryParams: {
        q: { type: 'string', description: 'City name' },
        units: { type: 'string', description: 'Metric or imperial' },
      },
    },
  },
  {
    id: 2,
    agentId: 1,
    name: 'Payment Gateway',
    type: 'http',
    description: 'Process payments via Stripe',
    schema: {
      url: 'https://payments.example.com/charge',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      queryParams: {},
    },
  },
  {
    id: 3,
    agentId: 1,
    name: 'Data Analyst',
    type: 'agent',
    description: 'Delegate data analysis tasks',
    schema: {
      targetAgentId: 3,
      targetAgentName: 'Data Analyst',
      capabilities: 'Performs statistical analysis and data insights',
      taskTypes: ['analysis', 'reporting', 'data_processing'],
    },
  },
];

@Injectable({ providedIn: 'root' })
export class ResourceService {
  getByAgent(agentId: number): Observable<Record<string, Resource[]>> {
    const items = _resources.filter(r => r.agentId === agentId).map(r => ({ ...r }));
    const grouped: Record<string, Resource[]> = {};
    for (const r of items) {
      if (!grouped[r.type]) grouped[r.type] = [];
      grouped[r.type].push(r);
    }
    return of(grouped).pipe(delay(200));
  }

  create(data: Omit<Resource, 'id'>): Observable<Resource> {
    const resource: Resource = { ...data, id: _nextId++ };
    _resources = [..._resources, resource];
    return of({ ...resource }).pipe(delay(300));
  }

  update(id: number, data: Partial<Resource>): Observable<Resource> {
    _resources = _resources.map(r => (r.id === id ? { ...r, ...data } : r));
    const updated = _resources.find(r => r.id === id)!;
    return of({ ...updated }).pipe(delay(300));
  }

  delete(id: number): Observable<void> {
    _resources = _resources.filter(r => r.id !== id);
    return of(undefined).pipe(delay(300));
  }

  getPrompt(agentId: number): Observable<{ prompt: string }> {
    const resources = _resources.filter(r => r.agentId === agentId);
    const sections = resources
      .map(r => `### ${r.name}\n${r.description ?? ''}`)
      .join('\n\n');
    const prompt = `You are a helpful AI agent.\n\n## Available Tools\n\n${sections || '(No tools configured)'}`;
    return of({ prompt }).pipe(delay(300));
  }

  savePrompt(agentId: number): Observable<{ prompt: string }> {
    const resources = _resources.filter(r => r.agentId === agentId);
    const sections = resources
      .map(r => `### Tool: ${r.name}\n${r.description ?? ''}\n\nUse this tool for relevant tasks.`)
      .join('\n\n');
    const prompt = `You are a helpful AI agent.\n\n## Available Tools\n\n${sections || '(No tools configured)'}\n\n## Instructions\nAlways use available tools when appropriate.`;
    return of({ prompt }).pipe(delay(500));
  }
}
