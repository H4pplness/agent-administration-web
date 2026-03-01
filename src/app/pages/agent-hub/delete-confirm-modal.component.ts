import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-delete-confirm-modal',
  standalone: true,
  template: `
    <!-- Backdrop -->
    <div
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      (click)="cancel.emit()"
    >
      <!-- Modal panel -->
      <div
        class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm mx-4 overflow-hidden"
        (click)="$event.stopPropagation()"
      >
        <div class="px-6 pt-6">
          <h3 class="text-base font-semibold text-gray-900 dark:text-gray-100">
            {{ title() }}
          </h3>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {{ message() }}
          </p>
          @if (subMessage()) {
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-500">
              {{ subMessage() }}
            </p>
          }
        </div>

        <div class="flex justify-end gap-2 px-6 py-4 mt-2">
          <button
            class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            (click)="cancel.emit()"
          >
            Cancel
          </button>
          <button
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            (click)="confirm.emit()"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  `,
})
export class DeleteConfirmModalComponent {
  title   = input('Delete');
  message = input('Are you sure?');
  subMessage = input('');

  cancel  = output<void>();
  confirm = output<void>();
}
