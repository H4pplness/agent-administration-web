import { Component, computed, input, OnChanges, output, signal, SimpleChanges } from '@angular/core';
import { Agent, AgentModel } from '../../core/models/agent.model';
import { DeleteConfirmModalComponent } from './delete-confirm-modal.component';

interface AgentFormState {
  name: string;
  modelId: string | null;
  context: string;
}

@Component({
  selector: 'app-tab-general',
  standalone: true,
  imports: [DeleteConfirmModalComponent],
  host: {
    class: 'block h-full min-h-0',
  },
  template: `
    <div class="relative h-full min-h-0 overflow-y-auto">
      <div class="mx-auto max-w-3xl space-y-6 p-6">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">Agent Information</h3>
            <p class="mt-0.5 text-xs text-gray-400">Update all core fields, then save once.</p>
          </div>
          <div class="flex items-center gap-2">
            <button
              class="rounded-lg px-3 py-2 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 disabled:opacity-50"
              [disabled]="savingAgent() || !isDirty()"
              (click)="resetForm()"
            >
              Reset
            </button>
            <button
              class="flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-brand-600 disabled:opacity-50"
              [disabled]="savingAgent() || !isDirty() || !isValid()"
              (click)="saveAll()"
            >
              @if (savingAgent()) {
                <svg class="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
              } @else {
                <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              }
              Save Agent
            </button>
            <button
              class="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
              (click)="showDeleteModal.set(true)"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
              Delete Agent
            </button>
          </div>
        </div>

        <div class="space-y-5 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <div>
            <label class="text-xs font-semibold uppercase tracking-wider text-gray-400">Agent Name</label>
            <input
              type="text"
              class="mt-1.5 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 dark:bg-gray-900 dark:text-gray-100"
              [class.border-red-400]="showNameError()"
              [class.focus:ring-red-400]="showNameError()"
              [class.border-gray-300]="!showNameError()"
              [class.dark:border-gray-600]="!showNameError()"
              [class.focus:ring-brand-500]="!showNameError()"
              placeholder="Enter agent name"
              [value]="form().name"
              (input)="patchForm({ name: $any($event.target).value })"
            />
            @if (showNameError()) {
              <p class="mt-1 text-xs text-red-500">Name is required.</p>
            }
          </div>

          <div>
            <label class="text-xs font-semibold uppercase tracking-wider text-gray-400">Model</label>
            @if (loadingModels()) {
              <div class="mt-1.5 flex items-center gap-2 py-2 text-sm text-gray-400">
                <svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Loading models...
              </div>
            } @else {
              <select
                class="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                [value]="form().modelId ?? ''"
                (change)="patchForm({ modelId: ($any($event.target).value || null) })"
              >
                <option value="">No model selected</option>
                @for (m of models(); track m.id) {
                  <option [value]="m.id">{{ m.name }}</option>
                }
              </select>
            }
          </div>

          <div>
            <label class="text-xs font-semibold uppercase tracking-wider text-gray-400">Context / Description</label>
            <textarea
              class="mt-1.5 w-full resize-y rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
              rows="8"
              placeholder="Describe what this agent does..."
              [value]="form().context"
              (input)="patchForm({ context: $any($event.target).value })"
            ></textarea>
          </div>
        </div>
      </div>
    </div>

    @if (showDeleteModal()) {
      <app-delete-confirm-modal
        [title]="'Delete Agent'"
        [message]="'Are you sure you want to delete ' + agent().name + '?'"
        [subMessage]="'This action cannot be undone. All resources and conversations will be permanently deleted.'"
        (cancel)="showDeleteModal.set(false)"
        (confirm)="onConfirmDelete()"
      />
    }
  `,
})
export class TabGeneralComponent implements OnChanges {
  agent = input.required<Agent>();
  models = input<AgentModel[]>([]);
  loadingModels = input(false);
  savingAgent = input(false);

  updateAgent = output<Partial<Agent>>();
  deleteAgent = output<void>();

  attemptedSubmit = signal(false);
  showDeleteModal = signal(false);

  form = signal<AgentFormState>({
    name: '',
    modelId: null,
    context: '',
  });

  isValid = computed(() => this.form().name.trim().length > 0);

  isDirty = computed(() => {
    const f = this.form();
    const a = this.agent();
    return (
      f.name.trim() !== a.name.trim() ||
      (f.modelId ?? null) !== (a.modelId ?? null) ||
      f.context !== (a.context ?? '')
    );
  });

  showNameError = computed(() => this.attemptedSubmit() && this.form().name.trim().length === 0);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['agent']) {
      this.form.set({
        name: this.agent().name,
        modelId: this.agent().modelId ?? null,
        context: this.agent().context ?? '',
      });
      this.attemptedSubmit.set(false);
    }
  }

  patchForm(patch: Partial<AgentFormState>): void {
    this.form.update(current => ({ ...current, ...patch }));
  }

  resetForm(): void {
    this.form.set({
      name: this.agent().name,
      modelId: this.agent().modelId ?? null,
      context: this.agent().context ?? '',
    });
    this.attemptedSubmit.set(false);
  }

  saveAll(): void {
    this.attemptedSubmit.set(true);
    if (!this.isValid() || !this.isDirty()) return;
    const f = this.form();
    this.updateAgent.emit({
      name: f.name.trim(),
      modelId: f.modelId,
      context: f.context.trim() || null,
    });
  }

  onConfirmDelete(): void {
    this.showDeleteModal.set(false);
    this.deleteAgent.emit();
  }
}
