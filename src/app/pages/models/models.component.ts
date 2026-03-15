import { Component, inject, OnInit, signal } from '@angular/core';
import { AgentModel } from '../../core/models/agent.model';
import { AgentService } from '../../core/services/agent.service';
import { ToastService } from '../../core/services/toast.service';
import { DeleteConfirmModalComponent } from '../agent-hub/delete-confirm-modal.component';
import { ToastContainerComponent } from '../../shared/components/atoms/toast/toast.component';

interface ModelFormState {
  modelName: string;
  apiKey: string;
  urlGateway: string;
}

const EMPTY_FORM: ModelFormState = {
  modelName: '',
  apiKey: '',
  urlGateway: '',
};

@Component({
  selector: 'app-models',
  standalone: true,
  imports: [DeleteConfirmModalComponent, ToastContainerComponent],
  template: `
    <div class="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
      <div class="mx-auto max-w-6xl space-y-6">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 class="text-xl font-semibold text-gray-900 dark:text-gray-100">Models</h1>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Quan ly danh sach LLM model dang duoc backend cung cap.
            </p>
          </div>
          <button
            class="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors"
            (click)="startCreate()"
          >
            New Model
          </button>
        </div>

        @if (showForm()) {
          <section class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div class="flex items-center justify-between gap-3">
              <div>
                <h2 class="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  {{ editingModel() ? 'Edit Model' : 'Create Model' }}
                </h2>
                <p class="mt-1 text-xs text-gray-400">Thong tin nay se duoc gui truc tiep den /api/models.</p>
              </div>
              <button
                class="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                (click)="cancelForm()"
              >
                Close
              </button>
            </div>

            <div class="mt-5 grid gap-4 md:grid-cols-2">
              <div class="md:col-span-2">
                <label class="text-xs font-semibold uppercase tracking-wide text-gray-400">Model Name</label>
                <input
                  type="text"
                  class="mt-1.5 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 dark:bg-gray-900 dark:text-gray-100"
                  [class.border-red-400]="submitted() && !form().modelName.trim()"
                  [class.border-gray-300]="!(submitted() && !form().modelName.trim())"
                  [class.dark:border-gray-600]="!(submitted() && !form().modelName.trim())"
                  [value]="form().modelName"
                  (input)="patchForm('modelName', $any($event.target).value)"
                />
                @if (submitted() && !form().modelName.trim()) {
                  <p class="mt-1 text-xs text-red-500">Model name is required.</p>
                }
              </div>

              <div>
                <label class="text-xs font-semibold uppercase tracking-wide text-gray-400">API Key</label>
                <input
                  type="text"
                  class="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                  [value]="form().apiKey"
                  (input)="patchForm('apiKey', $any($event.target).value)"
                />
              </div>

              <div>
                <label class="text-xs font-semibold uppercase tracking-wide text-gray-400">Gateway URL</label>
                <input
                  type="text"
                  class="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                  [value]="form().urlGateway"
                  (input)="patchForm('urlGateway', $any($event.target).value)"
                />
              </div>
            </div>

            <div class="mt-5 flex justify-end gap-2">
              <button
                class="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                (click)="cancelForm()"
              >
                Cancel
              </button>
              <button
                class="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
                [disabled]="saving()"
                (click)="submitForm()"
              >
                {{ saving() ? 'Saving...' : (editingModel() ? 'Save Changes' : 'Create Model') }}
              </button>
            </div>
          </section>
        }

        <section class="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div class="border-b border-gray-200 px-5 py-4 dark:border-gray-700">
            <h2 class="text-sm font-semibold text-gray-800 dark:text-gray-100">Available Models</h2>
          </div>

          @if (loading()) {
            <div class="px-5 py-10 text-center text-sm text-gray-400">Loading models...</div>
          } @else if (models().length === 0) {
            <div class="px-5 py-10 text-center text-sm text-gray-400">No models found.</div>
          } @else {
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead class="bg-gray-50 dark:bg-gray-900/40">
                  <tr class="text-left text-xs uppercase tracking-wide text-gray-400">
                    <th class="px-5 py-3 font-medium">ID</th>
                    <th class="px-5 py-3 font-medium">Model</th>
                    <th class="px-5 py-3 font-medium">Gateway</th>
                    <th class="px-5 py-3 font-medium">API Key</th>
                    <th class="px-5 py-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                  @for (model of models(); track model.modelId) {
                    <tr class="align-top">
                      <td class="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{{ model.modelId }}</td>
                      <td class="px-5 py-4">
                        <div class="font-medium text-gray-900 dark:text-gray-100">{{ model.modelName }}</div>
                      </td>
                      <td class="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">{{ model.urlGateway || '-' }}</td>
                      <td class="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">{{ maskApiKey(model.apiKey) }}</td>
                      <td class="px-5 py-4">
                        <div class="flex justify-end gap-2">
                          <button
                            class="rounded-lg px-3 py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-950"
                            (click)="startEdit(model)"
                          >
                            Edit
                          </button>
                          <button
                            class="rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                            (click)="confirmDelete(model)"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </section>
      </div>

      @if (deleteTarget()) {
        <app-delete-confirm-modal
          [title]="'Delete Model'"
          [message]="'Delete ' + deleteTarget()!.modelName + '?'"
          [subMessage]="'This action cannot be undone.'"
          (cancel)="deleteTarget.set(null)"
          (confirm)="deleteModel()"
        />
      }

      <app-toast-container />
    </div>
  `,
})
export class ModelsComponent implements OnInit {
  private readonly agentService = inject(AgentService);
  private readonly toastService = inject(ToastService);

  models = signal<AgentModel[]>([]);
  loading = signal(true);
  saving = signal(false);
  submitted = signal(false);
  showForm = signal(false);
  editingModel = signal<AgentModel | null>(null);
  deleteTarget = signal<AgentModel | null>(null);
  form = signal<ModelFormState>({ ...EMPTY_FORM });

  ngOnInit(): void {
    this.loadModels();
  }

  loadModels(): void {
    this.loading.set(true);
    this.agentService.getModels().subscribe({
      next: models => {
        this.models.set(models);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toastService.error('Failed to load models');
      },
    });
  }

  startCreate(): void {
    this.editingModel.set(null);
    this.form.set({ ...EMPTY_FORM });
    this.submitted.set(false);
    this.showForm.set(true);
  }

  startEdit(model: AgentModel): void {
    this.editingModel.set(model);
    this.form.set({
      modelName: model.modelName,
      apiKey: model.apiKey,
      urlGateway: model.urlGateway,
    });
    this.submitted.set(false);
    this.showForm.set(true);
  }

  cancelForm(): void {
    this.showForm.set(false);
    this.editingModel.set(null);
    this.form.set({ ...EMPTY_FORM });
    this.submitted.set(false);
    this.saving.set(false);
  }

  patchForm(field: keyof ModelFormState, value: string): void {
    this.form.update(current => ({ ...current, [field]: value }));
  }

  submitForm(): void {
    this.submitted.set(true);
    if (!this.form().modelName.trim()) return;

    this.saving.set(true);
    const payload = {
      modelName: this.form().modelName.trim(),
      apiKey: this.form().apiKey.trim(),
      urlGateway: this.form().urlGateway.trim(),
    };

    const editing = this.editingModel();
    const request$ = editing
      ? this.agentService.updateModel(editing.modelId, payload)
      : this.agentService.createModel(payload);

    request$.subscribe({
      next: savedModel => {
        if (editing) {
          this.models.update(models => models.map(model => model.modelId === savedModel.modelId ? savedModel : model));
          this.toastService.success('Model updated');
        } else {
          this.models.update(models => [...models, savedModel]);
          this.toastService.success('Model created');
        }
        this.cancelForm();
      },
      error: () => {
        this.saving.set(false);
        this.toastService.error(editing ? 'Failed to update model' : 'Failed to create model');
      },
    });
  }

  confirmDelete(model: AgentModel): void {
    this.deleteTarget.set(model);
  }

  deleteModel(): void {
    const model = this.deleteTarget();
    if (!model) return;

    this.agentService.deleteModel(model.modelId).subscribe({
      next: () => {
        this.models.update(models => models.filter(item => item.modelId !== model.modelId));
        this.deleteTarget.set(null);
        this.toastService.success('Model deleted');
      },
      error: () => {
        this.deleteTarget.set(null);
        this.toastService.error('Failed to delete model');
      },
    });
  }

  maskApiKey(value: string): string {
    if (!value) return '-';
    if (value.length <= 8) return '********';
    return `${value.slice(0, 4)}...${value.slice(-4)}`;
  }
}
