import { Component, input, output, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { Agent, AgentModel } from '../../core/models/agent.model';
import { Resource } from '../../core/models/resource.model';
import { TabGeneralComponent } from './tab-general.component';
import { TabResourcesComponent } from './tab-resources.component';
import { TabSystemPromptComponent } from './tab-system-prompt.component';
import { TabChatComponent } from './tab-chat.component';

type Tab = 'general' | 'tools' | 'prompt' | 'chat';

interface TabDef {
  id: Tab;
  label: string;
}

const TABS: TabDef[] = [
  { id: 'general', label: 'General' },
  { id: 'tools',   label: 'Tools & Resources' },
  { id: 'prompt',  label: 'System Prompt' },
  { id: 'chat',    label: 'Chat' },
];

@Component({
  selector: 'app-agent-detail',
  standalone: true,
  host: {
    class: 'block h-full min-h-0 flex-1',
  },
  imports: [
    NgClass,
    TabGeneralComponent,
    TabResourcesComponent,
    TabSystemPromptComponent,
    TabChatComponent,
  ],
  template: `
    <div class="flex h-full min-h-0 flex-col overflow-hidden bg-white dark:bg-gray-800">

      <!-- Tab bar -->
      <div class="shrink-0 border-b border-gray-200 dark:border-gray-700 px-6">
        <nav class="flex gap-0 -mb-px">
          @for (tab of tabs; track tab.id) {
            <button
              class="px-4 py-3.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap"
              [ngClass]="{
                'border-brand-500 text-brand-600 dark:text-brand-400': activeTab() === tab.id,
                'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600': activeTab() !== tab.id
              }"
              (click)="activeTab.set(tab.id)"
            >
              {{ tab.label }}
              @if (tab.id === 'prompt' && isDirty()) {
                <span class="ml-1.5 inline-flex w-2 h-2 rounded-full bg-amber-400"></span>
              }
            </button>
          }
        </nav>
      </div>

      <!-- Tab content -->
      <div class="flex-1 min-h-0 overflow-hidden">
        @switch (activeTab()) {

          @case ('general') {
            <app-tab-general
              [agent]="agent()"
              [models]="models()"
              [loadingModels]="loadingModels()"
              [savingAgent]="savingAgent()"
              (updateAgent)="updateAgent.emit($event)"
              (deleteAgent)="deleteAgent.emit()"
            />
          }

          @case ('tools') {
            <app-tab-resources
              [currentAgentId]="agent().id"
              [resources]="resources()"
              [allAgents]="allAgents()"
              (createResource)="onCreate($event)"
              (updateResource)="onUpdate($event)"
              (deleteResource)="onDelete($event)"
            />
          }

          @case ('prompt') {
            <app-tab-system-prompt
              [agentId]="agent().id"
              [prompt]="systemPrompt()"
              [isDirty]="isDirty()"
              [loadingPrompt]="loadingPrompt()"
              (rebuild)="rebuild.emit()"
            />
          }

          @case ('chat') {
            <app-tab-chat [agentId]="agent().id" />
          }

        }
      </div>
    </div>
  `,
})
export class AgentDetailComponent {
  agent        = input.required<Agent>();
  resources    = input<Resource[]>([]);
  allAgents    = input<Agent[]>([]);
  models       = input<AgentModel[]>([]);
  loadingModels = input(false);
  savingAgent  = input(false);
  systemPrompt = input('');
  isDirty      = input(false);
  loadingPrompt = input(false);

  updateAgent    = output<Partial<Agent>>();
  deleteAgent    = output<void>();
  createResource = output<Omit<Resource, 'id'>>();
  updateResource = output<{ id: number; data: Partial<Resource> }>();
  deleteResource = output<number>();
  rebuild        = output<void>();

  readonly tabs = TABS;
  activeTab = signal<Tab>('general');

  onCreate(data: Omit<Resource, 'id'>): void  { this.createResource.emit(data); }
  onUpdate(ev: { id: number; data: Partial<Resource> }): void { this.updateResource.emit(ev); }
  onDelete(id: number): void { this.deleteResource.emit(id); }
}
