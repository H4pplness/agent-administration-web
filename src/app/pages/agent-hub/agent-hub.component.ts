import { Component, inject, signal, OnInit } from '@angular/core';
import { Agent, AgentModel } from '../../core/models/agent.model';
import { Resource } from '../../core/models/resource.model';
import { AgentService } from '../../core/services/agent.service';
import { ResourceService } from '../../core/services/resource.service';
import { ToastService } from '../../core/services/toast.service';
import { AgentSidebarComponent } from './agent-sidebar.component';
import { AgentDetailComponent } from './agent-detail.component';
import { ToastContainerComponent } from '../../shared/components/atoms/toast/toast.component';

@Component({
  selector: 'app-agent-hub',
  standalone: true,
  imports: [AgentSidebarComponent, AgentDetailComponent, ToastContainerComponent],
  host: {
    class: 'block h-full min-h-0',
  },
  template: `
    <div class="flex h-full min-h-0 overflow-hidden bg-gray-50 dark:bg-gray-900">

      <!-- Left Sidebar: Agent List -->
      <app-agent-sidebar
        [agents]="agents()"
        [selectedAgentId]="selectedAgent()?.id ?? null"
        (selectAgent)="selectAgent($event)"
        (renameAgent)="renameAgent($event)"
        (createAgent)="createAgent($event)"
      />

      <!-- Right Panel: Agent Detail -->
      @if (loading()) {
        <div class="flex-1 flex items-center justify-center">
          <div class="text-center">
            <svg class="w-8 h-8 animate-spin text-brand-500 mx-auto" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            <p class="mt-2 text-sm text-gray-400">Loading agents...</p>
          </div>
        </div>
      } @else if (selectedAgent()) {
        <app-agent-detail
          [agent]="selectedAgent()!"
          [resources]="resources()"
          [allAgents]="agents()"
          [models]="models()"
          [loadingModels]="loadingModels()"
          [savingAgent]="savingAgent()"
          [systemPrompt]="systemPrompt()"
          [isDirty]="resourcesDirty()"
          [loadingPrompt]="loadingPrompt()"
          (updateAgent)="updateAgent($event)"
          (deleteAgent)="deleteAgent()"
          (createResource)="createResource($event)"
          (updateResource)="updateResource($event)"
          (deleteResource)="deleteResource($event)"
          (rebuild)="rebuildPrompt()"
        />
      } @else {
        <div class="flex-1 flex flex-col items-center justify-center text-center p-8">
          <div class="w-20 h-20 rounded-2xl bg-brand-50 dark:bg-brand-950 flex items-center justify-center mb-4">
            <span class="text-4xl">🤖</span>
          </div>
          <h3 class="text-base font-semibold text-gray-700 dark:text-gray-300">No agents yet</h3>
          <p class="text-sm text-gray-400 mt-1 mb-4">Create your first agent to get started</p>
          <button
            class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg transition-colors"
            (click)="triggerNewAgent()"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create Agent
          </button>
        </div>
      }

    </div>

    <!-- Global Toasts -->
    <app-toast-container />
  `,
})
export class AgentHubComponent implements OnInit {
  private agentSvc    = inject(AgentService);
  private resourceSvc = inject(ResourceService);
  private toastSvc    = inject(ToastService);

  /* ── State ─────────────────────────────────────────────────────── */
  agents         = signal<Agent[]>([]);
  selectedAgent  = signal<Agent | null>(null);
  resources      = signal<Resource[]>([]);
  models         = signal<AgentModel[]>([]);
  systemPrompt   = signal('');

  loading        = signal(true);
  loadingModels  = signal(false);
  loadingPrompt  = signal(false);
  savingAgent    = signal(false);
  resourcesDirty = signal(false);

  /* ── Init ──────────────────────────────────────────────────────── */
  ngOnInit(): void {
    this.loadAgents();
    this.loadModels();
  }

  private loadAgents(): void {
    this.loading.set(true);
    this.agentSvc.getAgents().subscribe({
      next: agents => {
        this.agents.set(agents);
        if (agents.length > 0) {
          this.doSelectAgent(agents[0]);
        }
        this.loading.set(false);
      },
      error: () => {
        this.toastSvc.error('Failed to load agents');
        this.loading.set(false);
      },
    });
  }

  private loadModels(): void {
    this.loadingModels.set(true);
    this.agentSvc.getModels().subscribe({
      next: models => { this.models.set(models); this.loadingModels.set(false); },
      error: () => this.loadingModels.set(false),
    });
  }

  private loadResources(agentId: number): void {
    this.resourceSvc.getByAgent(agentId).subscribe({
      next: grouped => {
        const all: Resource[] = Object.values(grouped).flat();
        this.resources.set(all);
      },
      error: () => this.toastSvc.error('Failed to load resources'),
    });
  }

  private loadPrompt(agentId: number): void {
    this.loadingPrompt.set(true);
    this.resourceSvc.getPrompt(agentId).subscribe({
      next: r => { this.systemPrompt.set(r.prompt); this.loadingPrompt.set(false); },
      error: () => this.loadingPrompt.set(false),
    });
  }

  private doSelectAgent(agent: Agent): void {
    this.selectedAgent.set(agent);
    this.resourcesDirty.set(false);
    this.resources.set([]);
    this.systemPrompt.set('');
    this.loadResources(agent.id);
    this.loadPrompt(agent.id);
  }

  /* ── Agent actions ─────────────────────────────────────────────── */
  selectAgent(agent: Agent): void {
    if (this.selectedAgent()?.id === agent.id) return;
    this.doSelectAgent(agent);
  }

  renameAgent(ev: { id: number; name: string }): void {
    this.agentSvc.updateAgent(ev.id, { name: ev.name }).subscribe({
      next: updated => {
        this.agents.update(list => list.map(a => (a.id === updated.id ? updated : a)));
        if (this.selectedAgent()?.id === updated.id) {
          this.selectedAgent.set(updated);
        }
        this.toastSvc.success('Agent renamed');
      },
      error: () => this.toastSvc.error('Failed to rename agent'),
    });
  }

  createAgent(name: string): void {
    this.agentSvc.createAgent({ name }).subscribe({
      next: agent => {
        this.agents.update(list => [...list, agent]);
        this.doSelectAgent(agent);
        this.toastSvc.success('Agent created');
      },
      error: () => this.toastSvc.error('Failed to create agent'),
    });
  }

  updateAgent(data: Partial<Agent>): void {
    const agent = this.selectedAgent();
    if (!agent) return;
    this.savingAgent.set(true);
    this.agentSvc.updateAgent(agent.id, data).subscribe({
      next: updated => {
        this.agents.update(list => list.map(a => (a.id === updated.id ? updated : a)));
        this.selectedAgent.set(updated);
        this.savingAgent.set(false);
        this.toastSvc.success('Saved');
      },
      error: () => {
        this.savingAgent.set(false);
        this.toastSvc.error('Failed to update agent');
      },
    });
  }

  deleteAgent(): void {
    const agent = this.selectedAgent();
    if (!agent) return;
    this.agentSvc.deleteAgent(agent.id).subscribe({
      next: () => {
        const remaining = this.agents().filter(a => a.id !== agent.id);
        this.agents.set(remaining);
        if (remaining.length > 0) {
          this.doSelectAgent(remaining[0]);
        } else {
          this.selectedAgent.set(null);
          this.resources.set([]);
          this.systemPrompt.set('');
        }
        this.toastSvc.success('Agent deleted');
      },
      error: () => this.toastSvc.error('Failed to delete agent'),
    });
  }

  /* ── Resource actions ──────────────────────────────────────────── */
  createResource(data: Omit<Resource, 'id'>): void {
    this.resourceSvc.create(data).subscribe({
      next: r => {
        this.resources.update(list => [...list, r]);
        this.resourcesDirty.set(true);
        this.toastSvc.success('Resource added');
      },
      error: () => this.toastSvc.error('Failed to add resource'),
    });
  }

  updateResource(ev: { id: number; data: Partial<Resource> }): void {
    this.resourceSvc.update(ev.id, ev.data).subscribe({
      next: r => {
        this.resources.update(list => list.map(x => (x.id === r.id ? r : x)));
        this.resourcesDirty.set(true);
        this.toastSvc.success('Resource updated');
      },
      error: () => this.toastSvc.error('Failed to update resource'),
    });
  }

  deleteResource(id: number): void {
    this.resourceSvc.delete(id).subscribe({
      next: () => {
        this.resources.update(list => list.filter(r => r.id !== id));
        this.resourcesDirty.set(true);
        this.toastSvc.success('Resource deleted');
      },
      error: () => this.toastSvc.error('Failed to delete resource'),
    });
  }

  /* ── System Prompt ─────────────────────────────────────────────── */
  rebuildPrompt(): void {
    const agent = this.selectedAgent();
    if (!agent) return;
    this.resourceSvc.savePrompt(agent.id).subscribe({
      next: r => {
        this.systemPrompt.set(r.prompt);
        this.resourcesDirty.set(false);
        this.toastSvc.success('System prompt saved');
      },
      error: () => this.toastSvc.error('Failed to rebuild system prompt'),
    });
  }

  /* ── Misc ──────────────────────────────────────────────────────── */
  triggerNewAgent(): void {
    // This is handled by the sidebar component's startAdding() method
    // For the empty state button, we just show a hint
    this.toastSvc.success('Use the "New" button in the sidebar to create an agent');
  }
}
