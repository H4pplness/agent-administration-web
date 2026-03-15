import {
  Component, computed, input, OnChanges, output, signal, SimpleChanges,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Agent } from '../../core/models/agent.model';
import {
  AgentSchema,
  HttpMethod,
  HttpSchema,
  ParamType,
  QueryParamDef,
  Resource,
  ResourceType,
} from '../../core/models/resource.model';
import { DeleteConfirmModalComponent } from './delete-confirm-modal.component';

interface FormState {
  id?: number;
  type: ResourceType;
  name: string;
  description: string;
  url: string;
  method: HttpMethod;
  headersText: string;
  queryParams: QueryParamDef[];
  targetAgentCode: string | null;
  targetAgentName: string;
  capabilities: string;
  taskTypes: string;
}

const HTTP_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

function emptyForm(type: ResourceType): FormState {
  return {
    type,
    name: '',
    description: '',
    url: 'https://',
    method: 'GET',
    headersText: '',
    queryParams: [],
    targetAgentCode: null,
    targetAgentName: '',
    capabilities: '',
    taskTypes: '',
  };
}

function resourceToForm(resource: Resource): FormState {
  if (resource.type === 'http') {
    const schema = resource.schema as HttpSchema;
    const headersText = Object.entries(schema.headers ?? {})
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
    const queryParams: QueryParamDef[] = Object.entries(schema.queryParams ?? {}).map(
      ([name, def]) => ({ name, type: def.type as ParamType, description: def.description })
    );

    return {
      id: resource.id,
      type: 'http',
      name: resource.name,
      description: resource.description ?? '',
      url: schema.url,
      method: schema.method,
      headersText,
      queryParams,
      targetAgentCode: null,
      targetAgentName: '',
      capabilities: '',
      taskTypes: '',
    };
  }

  const schema = resource.schema as AgentSchema;
  return {
    id: resource.id,
    type: 'agent',
    name: resource.name,
    description: resource.description ?? '',
    url: '',
    method: 'GET',
    headersText: '',
    queryParams: [],
    targetAgentCode: schema.targetAgentCode,
    targetAgentName: schema.targetAgentName,
    capabilities: schema.capabilities ?? '',
    taskTypes: (schema.taskTypes ?? []).join(', '),
  };
}

function formToResource(form: FormState, agentCode: string): Omit<Resource, 'id'> {
  if (form.type === 'http') {
    const headers: Record<string, string> = {};
    form.headersText.split('\n').forEach(line => {
      const idx = line.indexOf(':');
      if (idx > 0) {
        headers[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
      }
    });

    const queryParams: Record<string, { type: string; description?: string }> = {};
    form.queryParams.forEach(param => {
      queryParams[param.name] = { type: param.type, description: param.description };
    });

    return {
      agentId: agentCode,
      type: 'http',
      name: form.name,
      description: form.description,
      schema: { url: form.url, method: form.method, headers, queryParams },
    };
  }

  return {
    agentId: agentCode,
    type: 'agent',
    name: form.name,
    description: form.description,
    schema: {
      targetAgentCode: form.targetAgentCode!,
      targetAgentName: form.targetAgentName,
      capabilities: form.capabilities,
      taskTypes: form.taskTypes.split(',').map(item => item.trim()).filter(Boolean),
    },
  };
}

@Component({
  selector: 'app-tab-resources',
  standalone: true,
  imports: [NgTemplateOutlet, DeleteConfirmModalComponent],
  host: {
    class: 'block h-full min-h-0',
  },
  template: `
    <div class="h-full min-h-0 overflow-y-auto p-6 space-y-6">
      <section class="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div class="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center gap-2">
            <span class="text-base">API</span>
            <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">HTTP Resources</span>
          </div>
          <button
            class="flex items-center gap-1 text-xs font-medium text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950 px-2 py-1 rounded transition-colors"
            (click)="startAdd('http')"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add HTTP
          </button>
        </div>

        <div class="divide-y divide-gray-100 dark:divide-gray-700">
          @for (r of httpResources(); track r.id) {
            @if (editingId() === r.id) {
              <div class="p-4 bg-blue-50/30 dark:bg-blue-950/20">
                <ng-container *ngTemplateOutlet="formTemplate; context: { $implicit: 'http' }" />
              </div>
            } @else {
              <div
                class="group flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer transition-colors"
                title="Double-click to edit"
                (dblclick)="startEdit(r)"
              >
                <span class="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
                <span class="font-medium text-sm text-gray-800 dark:text-gray-200 flex-1">{{ r.name }}</span>
                <span class="text-xs font-mono font-semibold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950 px-1.5 py-0.5 rounded">{{ httpSchema(r).method }}</span>
                <span class="text-xs text-gray-400 truncate max-w-[160px]">{{ httpDomain(r) }}</span>
                <button
                  class="opacity-0 group-hover:opacity-100 ml-2 p-1 text-gray-400 hover:text-red-500 transition-all"
                  title="Delete"
                  (click)="$event.stopPropagation(); confirmDelete(r)"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                </button>
              </div>
            }
          }

          @if (addingType() === 'http') {
            <div class="p-4 bg-blue-50/30 dark:bg-blue-950/20">
              <ng-container *ngTemplateOutlet="formTemplate; context: { $implicit: 'http' }" />
            </div>
          }

          @if (httpResources().length === 0 && addingType() !== 'http') {
            <div class="px-4 py-6 text-center text-sm text-gray-400">No HTTP resources yet</div>
          }
        </div>
      </section>

      <section class="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div class="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center gap-2">
            <span class="text-base">AG</span>
            <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">Agent Resources</span>
          </div>
          <button
            class="flex items-center gap-1 text-xs font-medium text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950 px-2 py-1 rounded transition-colors"
            (click)="startAdd('agent')"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Agent
          </button>
        </div>

        <div class="divide-y divide-gray-100 dark:divide-gray-700">
          @for (r of agentResources(); track r.id) {
            @if (editingId() === r.id) {
              <div class="p-4 bg-purple-50/30 dark:bg-purple-950/20">
                <ng-container *ngTemplateOutlet="formTemplate; context: { $implicit: 'agent' }" />
              </div>
            } @else {
              <div
                class="group flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer transition-colors"
                title="Double-click to edit"
                (dblclick)="startEdit(r)"
              >
                <span class="w-2 h-2 rounded-full bg-purple-400 shrink-0"></span>
                <span class="font-medium text-sm text-gray-800 dark:text-gray-200 flex-1">{{ r.name }}</span>
                <span class="text-xs text-gray-400">Agent: {{ agentSchema(r).targetAgentCode }}</span>
                <span class="text-xs text-gray-400 truncate max-w-[160px]">{{ agentTaskTypes(r) }}</span>
                <button
                  class="opacity-0 group-hover:opacity-100 ml-2 p-1 text-gray-400 hover:text-red-500 transition-all"
                  title="Delete"
                  (click)="$event.stopPropagation(); confirmDelete(r)"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                </button>
              </div>
            }
          }

          @if (addingType() === 'agent') {
            <div class="p-4 bg-purple-50/30 dark:bg-purple-950/20">
              <ng-container *ngTemplateOutlet="formTemplate; context: { $implicit: 'agent' }" />
            </div>
          }

          @if (agentResources().length === 0 && addingType() !== 'agent') {
            <div class="px-4 py-6 text-center text-sm text-gray-400">No agent resources yet</div>
          }
        </div>
      </section>
    </div>

    <ng-template #formTemplate let-type>
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-xs font-medium text-gray-500 dark:text-gray-400">Name *</label>
            <input
              type="text"
              class="mt-1 w-full px-3 py-1.5 text-sm border rounded-lg bg-white dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-1"
              [class.border-red-400]="form().nameError"
              [class.focus:ring-red-400]="form().nameError"
              [class.border-gray-300]="!form().nameError"
              [class.dark:border-gray-600]="!form().nameError"
              [class.focus:ring-brand-500]="!form().nameError"
              placeholder="Resource name"
              [value]="form().name"
              (input)="patchForm({ name: $any($event.target).value, nameError: false })"
            />
            @if (form().nameError) {
              <p class="text-xs text-red-500 mt-0.5">Name is required</p>
            }
          </div>
          <div>
            <label class="text-xs font-medium text-gray-500 dark:text-gray-400">Description</label>
            <input
              type="text"
              class="mt-1 w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
              placeholder="Brief description"
              [value]="form().description"
              (input)="patchForm({ description: $any($event.target).value })"
            />
          </div>
        </div>

        @if (type === 'http') {
          <div class="grid grid-cols-3 gap-3">
            <div class="col-span-2">
              <label class="text-xs font-medium text-gray-500 dark:text-gray-400">URL *</label>
              <input
                type="text"
                class="mt-1 w-full px-3 py-1.5 text-sm border rounded-lg bg-white dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-1"
                [class.border-red-400]="form().urlError"
                [class.focus:ring-red-400]="form().urlError"
                [class.border-gray-300]="!form().urlError"
                [class.focus:ring-brand-500]="!form().urlError"
                placeholder="https://api.example.com/endpoint"
                [value]="form().url"
                (input)="patchForm({ url: $any($event.target).value, urlError: false })"
              />
              @if (form().urlError) {
                <p class="text-xs text-red-500 mt-0.5">Valid URL required (http:// or https://)</p>
              }
            </div>
            <div>
              <label class="text-xs font-medium text-gray-500 dark:text-gray-400">Method *</label>
              <select
                class="mt-1 w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
                [value]="form().method"
                (change)="patchForm({ method: $any($event.target).value })"
              >
                @for (m of httpMethods; track m) {
                  <option [value]="m">{{ m }}</option>
                }
              </select>
            </div>
          </div>

          <div>
            <label class="text-xs font-medium text-gray-500 dark:text-gray-400">Headers (key: value per line)</label>
            <textarea
              class="mt-1 w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono resize-none"
              rows="3"
              placeholder="Authorization: Bearer {token}&#10;Content-Type: application/json"
              [value]="form().headersText"
              (input)="patchForm({ headersText: $any($event.target).value })"
            ></textarea>
          </div>

          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="text-xs font-medium text-gray-500 dark:text-gray-400">Query Params</label>
              <button
                class="text-xs font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 flex items-center gap-1"
                (click)="addQueryParam()"
              >
                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add Param
              </button>
            </div>
            @if (form().queryParams.length > 0) {
              <div class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div class="grid grid-cols-[1fr_100px_36px] bg-gray-50 dark:bg-gray-700/50 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <span class="px-3 py-2">Param Name</span>
                  <span class="px-3 py-2">Type</span>
                  <span></span>
                </div>
                @for (param of form().queryParams; track $index; let i = $index) {
                  <div class="grid grid-cols-[1fr_100px_36px] border-t border-gray-100 dark:border-gray-700">
                    <input
                      type="text"
                      class="px-3 py-1.5 text-sm bg-transparent border-0 focus:outline-none focus:ring-0 dark:text-gray-200"
                      placeholder="param_name"
                      [value]="param.name"
                      (input)="updateQueryParam(i, 'name', $any($event.target).value)"
                    />
                    <select
                      class="px-2 py-1.5 text-sm bg-transparent border-0 border-l border-gray-100 dark:border-gray-700 focus:outline-none focus:ring-0 dark:text-gray-200"
                      [value]="param.type"
                      (change)="updateQueryParam(i, 'type', $any($event.target).value)"
                    >
                      <option value="string">string</option>
                      <option value="number">number</option>
                      <option value="boolean">boolean</option>
                    </select>
                    <button
                      class="flex items-center justify-center text-gray-400 hover:text-red-500 border-l border-gray-100 dark:border-gray-700 transition-colors"
                      (click)="removeQueryParam(i)"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                }
              </div>
            }
          </div>
        }

        @if (type === 'agent') {
          <div>
            <label class="text-xs font-medium text-gray-500 dark:text-gray-400">Target Agent *</label>
            <select
              class="mt-1 w-full px-3 py-1.5 text-sm border rounded-lg bg-white dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-1"
              [class.border-red-400]="form().targetError"
              [class.border-gray-300]="!form().targetError"
              [class.focus:ring-brand-500]="!form().targetError"
              [class.focus:ring-red-400]="form().targetError"
              [value]="form().targetAgentCode ?? ''"
              (change)="onTargetAgentChange($any($event.target).value)"
            >
              <option value="">-- Select agent --</option>
              @for (a of otherAgents(); track a.code) {
                <option [value]="a.code">{{ a.name }} ({{ a.code }})</option>
              }
            </select>
            @if (form().targetError) {
              <p class="text-xs text-red-500 mt-0.5">Target agent is required</p>
            }
          </div>

          <div>
            <label class="text-xs font-medium text-gray-500 dark:text-gray-400">Capabilities</label>
            <textarea
              class="mt-1 w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none"
              rows="2"
              placeholder="Describe what this agent can do..."
              [value]="form().capabilities"
              (input)="patchForm({ capabilities: $any($event.target).value })"
            ></textarea>
          </div>

          <div>
            <label class="text-xs font-medium text-gray-500 dark:text-gray-400">Task Types (comma separated)</label>
            <input
              type="text"
              class="mt-1 w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
              placeholder="analysis, reporting, data_processing"
              [value]="form().taskTypes"
              (input)="patchForm({ taskTypes: $any($event.target).value })"
            />
          </div>
        }

        <div class="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
          <button
            class="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            (click)="cancelForm()"
          >
            Cancel
          </button>
          <button
            class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg transition-colors disabled:opacity-50"
            [disabled]="saving()"
            (click)="submitForm()"
          >
            @if (saving()) {
              <svg class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
            } @else {
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            }
            Save
          </button>
        </div>
      </div>
    </ng-template>

    @if (deleteTarget()) {
      <app-delete-confirm-modal
        [title]="'Delete Resource'"
        [message]="'Delete ' + deleteTarget()!.name + '?'"
        [subMessage]="'This cannot be undone.'"
        (cancel)="deleteTarget.set(null)"
        (confirm)="onConfirmDelete()"
      />
    }
  `,
})
export class TabResourcesComponent implements OnChanges {
  currentAgentCode = input.required<string>();
  resources = input<Resource[]>([]);
  allAgents = input<Agent[]>([]);

  createResource = output<Omit<Resource, 'id'>>();
  updateResource = output<{ id: number; data: Partial<Resource> }>();
  deleteResource = output<number>();

  httpResources = computed(() => this.resources().filter(resource => resource.type === 'http'));
  agentResources = computed(() => this.resources().filter(resource => resource.type === 'agent'));
  otherAgents = computed(() => this.allAgents().filter(agent => agent.code !== this.currentAgentCode()));

  editingId = signal<number | null>(null);
  addingType = signal<ResourceType | null>(null);
  saving = signal(false);
  deleteTarget = signal<Resource | null>(null);

  private readonly _formState = signal<FormState & {
    nameError?: boolean;
    urlError?: boolean;
    targetError?: boolean;
  }>(emptyForm('http'));

  form = this._formState.asReadonly();
  readonly httpMethods = HTTP_METHODS;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentAgentCode']) {
      this.cancelForm();
    }
  }

  patchForm(patch: Partial<FormState & { nameError?: boolean; urlError?: boolean; targetError?: boolean }>): void {
    this._formState.update(form => ({ ...form, ...patch }));
  }

  httpSchema(resource: Resource): HttpSchema {
    return resource.schema as HttpSchema;
  }

  agentSchema(resource: Resource): AgentSchema {
    return resource.schema as AgentSchema;
  }

  httpDomain(resource: Resource): string {
    try {
      return new URL((resource.schema as HttpSchema).url).hostname;
    } catch {
      return (resource.schema as HttpSchema).url;
    }
  }

  agentTaskTypes(resource: Resource): string {
    return ((resource.schema as AgentSchema).taskTypes ?? []).join(', ');
  }

  startEdit(resource: Resource): void {
    this.addingType.set(null);
    this.editingId.set(resource.id);
    this._formState.set({ ...resourceToForm(resource), nameError: false, urlError: false, targetError: false });
  }

  startAdd(type: ResourceType): void {
    this.editingId.set(null);
    this.addingType.set(type);
    this._formState.set({ ...emptyForm(type), nameError: false, urlError: false, targetError: false });
  }

  cancelForm(): void {
    this.editingId.set(null);
    this.addingType.set(null);
    this.saving.set(false);
  }

  addQueryParam(): void {
    this.patchForm({ queryParams: [...this.form().queryParams, { name: '', type: 'string' }] });
  }

  removeQueryParam(index: number): void {
    const queryParams = [...this.form().queryParams];
    queryParams.splice(index, 1);
    this.patchForm({ queryParams });
  }

  updateQueryParam(index: number, field: 'name' | 'type', value: string): void {
    this.patchForm({
      queryParams: this.form().queryParams.map((param, paramIndex) =>
        (paramIndex === index ? { ...param, [field]: value } : param)
      ),
    });
  }

  onTargetAgentChange(value: string): void {
    const agent = this.allAgents().find(item => item.code === value);
    this.patchForm({
      targetAgentCode: value || null,
      targetAgentName: agent?.name ?? '',
      targetError: false,
    });
  }

  submitForm(): void {
    const form = this.form();
    let valid = true;

    if (!form.name.trim()) {
      this.patchForm({ nameError: true });
      valid = false;
    }

    if (form.type === 'http') {
      if (!form.url.match(/^https?:\/\/.+/)) {
        this.patchForm({ urlError: true });
        valid = false;
      }
    } else if (!form.targetAgentCode) {
      this.patchForm({ targetError: true });
      valid = false;
    }

    if (!valid) return;

    this.saving.set(true);
    const resourceData = formToResource(form, this.currentAgentCode());

    if (this.editingId() !== null) {
      this.updateResource.emit({ id: this.editingId()!, data: resourceData });
    } else {
      this.createResource.emit(resourceData);
    }

    setTimeout(() => {
      this.saving.set(false);
      this.cancelForm();
    }, 400);
  }

  confirmDelete(resource: Resource): void {
    this.deleteTarget.set(resource);
  }

  onConfirmDelete(): void {
    const resource = this.deleteTarget();
    if (resource) this.deleteResource.emit(resource.id);
    this.deleteTarget.set(null);
    if (this.editingId() === resource?.id) this.cancelForm();
  }
}
