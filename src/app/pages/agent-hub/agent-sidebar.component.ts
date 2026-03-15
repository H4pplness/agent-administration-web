import {
  Component, input, output, signal,
  ViewChild, ElementRef, AfterViewChecked, computed,
} from '@angular/core';
import { NgClass } from '@angular/common';
import { Agent } from '../../core/models/agent.model';

@Component({
  selector: 'app-agent-sidebar',
  standalone: true,
  imports: [NgClass],
  host: {
    class: 'block h-full min-h-0',
  },
  template: `
    <div class="w-60 flex h-full min-h-0 flex-col border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">

      <!-- Header -->
      <div class="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <span class="text-xs font-semibold text-gray-400 uppercase tracking-widest">Agents</span>
        <button
          class="flex items-center gap-1 text-xs font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors py-1 px-2 rounded hover:bg-brand-50 dark:hover:bg-brand-950"
          title="New Agent"
          (click)="startAdding()"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New
        </button>
      </div>

      <!-- Search -->
      <div class="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
        <div class="relative">
          <input
            type="text"
            class="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 pl-8 pr-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
            placeholder="Search agents..."
            [value]="searchTerm()"
            (input)="searchTerm.set($any($event.target).value)"
          />
          <svg class="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-4.35-4.35m0 0A7.5 7.5 0 1 0 6.75 6.75a7.5 7.5 0 0 0 9.9 9.9Z" />
          </svg>
        </div>
      </div>

      <!-- Agent List -->
      <div class="flex-1 min-h-0 overflow-y-auto py-2 px-2 space-y-0.5">

        @for (agent of filteredAgents(); track agent.code) {
          <div
            class="group flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors"
            [ngClass]="{
              'bg-brand-50 dark:bg-brand-950': selectedAgentCode() === agent.code && editingId() !== agent.code,
              'hover:bg-gray-100 dark:hover:bg-gray-700': selectedAgentCode() !== agent.code || editingId() === agent.code
            }"
            (click)="onSelectAgent(agent)"
          >
            <span class="text-base shrink-0">🤖</span>

            @if (editingId() === agent.code) {
              <!-- Inline rename input -->
              <input
                #renameInput
                type="text"
                class="flex-1 text-sm border border-brand-400 rounded px-1.5 py-0.5 bg-white dark:bg-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
                [class.border-red-500]="renameError()"
                [value]="editValue()"
                (input)="editValue.set($any($event.target).value); renameError.set(false)"
                (keydown.enter)="saveRename(agent)"
                (keydown.escape)="cancelEdit()"
                (blur)="saveRename(agent)"
                (click)="$event.stopPropagation()"
              />
            } @else {
              <!-- Agent name (double-click to rename) -->
              <span
                class="flex-1 text-sm truncate text-gray-700 dark:text-gray-300"
                [ngClass]="{ 'font-medium text-brand-700 dark:text-brand-300': selectedAgentCode() === agent.code }"
                title="Double-click to rename"
                (dblclick)="startEdit(agent, $event)"
              >{{ agent.name }}</span>

              <!-- Active indicator -->
              @if (selectedAgentCode() === agent.code) {
                <span class="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0"></span>
              }
            }
          </div>
        }

        @if (filteredAgents().length === 0 && !isAdding()) {
          <div class="px-2 py-6 text-center text-xs text-gray-400">
            No agents found
          </div>
        }

        <!-- New agent input row -->
        @if (isAdding()) {
          <div class="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-700/50">
            <span class="text-base shrink-0">🤖</span>
            <input
              #newAgentInput
              type="text"
              placeholder="Agent name..."
              class="flex-1 text-sm border border-brand-400 rounded px-1.5 py-0.5 bg-white dark:bg-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
              [class.border-red-400]="addError()"
              [value]="newAgentName()"
              (input)="newAgentName.set($any($event.target).value); addError.set(false)"
              (keydown.enter)="confirmAdd()"
              (keydown.escape)="cancelAdd()"
              (blur)="onNewAgentBlur()"
            />
          </div>
        }

      </div>
    </div>
  `,
})
export class AgentSidebarComponent implements AfterViewChecked {
  agents         = input.required<Agent[]>();
  selectedAgentCode = input<string | null>(null);

  selectAgent  = output<Agent>();
  renameAgent  = output<{ code: string; name: string }>();
  createAgent  = output<string>();

  /* ── Local edit state ──────────────────────────────────────────── */
  editingId  = signal<string | null>(null);
  editValue  = signal('');
  renameError = signal(false);

  isAdding    = signal(false);
  newAgentName = signal('');
  addError    = signal(false);
  searchTerm  = signal('');

  filteredAgents = computed(() => {
    const keyword = this.searchTerm().trim().toLowerCase();
    if (!keyword) return this.agents();
    return this.agents().filter(agent => agent.name.toLowerCase().includes(keyword));
  });

  private _shouldFocusRename = false;
  private _shouldFocusNew    = false;

  @ViewChild('renameInput')  renameInput!:  ElementRef<HTMLInputElement>;
  @ViewChild('newAgentInput') newAgentInput!: ElementRef<HTMLInputElement>;

  ngAfterViewChecked(): void {
    if (this._shouldFocusRename && this.renameInput) {
      this.renameInput.nativeElement.select();
      this._shouldFocusRename = false;
    }
    if (this._shouldFocusNew && this.newAgentInput) {
      this.newAgentInput.nativeElement.focus();
      this._shouldFocusNew = false;
    }
  }

  onSelectAgent(agent: Agent): void {
    if (this.editingId() === agent.code) return;
    this.selectAgent.emit(agent);
  }

  /* ── Rename inline ─────────────────────────────────────────────── */
  startEdit(agent: Agent, event: MouseEvent): void {
    event.stopPropagation();
    this.editingId.set(agent.code);
    this.editValue.set(agent.name);
    this.renameError.set(false);
    this._shouldFocusRename = true;
  }

  saveRename(agent: Agent): void {
    const name = this.editValue().trim();
    if (!name) {
      this.renameError.set(true);
      return;
    }
    if (name !== agent.name) {
      this.renameAgent.emit({ code: agent.code, name });
    }
    this.editingId.set(null);
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.renameError.set(false);
  }

  /* ── Add new agent ─────────────────────────────────────────────── */
  startAdding(): void {
    this.cancelEdit();
    this.isAdding.set(true);
    this.newAgentName.set('');
    this.addError.set(false);
    this._shouldFocusNew = true;
  }

  confirmAdd(): void {
    const name = this.newAgentName().trim();
    if (!name) {
      this.addError.set(true);
      return;
    }
    this.createAgent.emit(name);
    this.cancelAdd();
  }

  cancelAdd(): void {
    this.isAdding.set(false);
    this.newAgentName.set('');
    this.addError.set(false);
  }

  onNewAgentBlur(): void {
    const name = this.newAgentName().trim();
    if (name) {
      this.confirmAdd();
    } else {
      this.cancelAdd();
    }
  }
}
