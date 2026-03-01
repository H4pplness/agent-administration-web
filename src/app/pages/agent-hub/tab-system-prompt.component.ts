import { Component, input, output, signal, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-tab-system-prompt',
  standalone: true,
  host: {
    class: 'block h-full min-h-0',
  },
  template: `
    <div class="h-full min-h-0 overflow-y-auto p-6 space-y-4 max-w-3xl">

      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">System Prompt</h3>
          <p class="text-xs text-gray-400 mt-0.5">Auto-generated from agent context and configured tools</p>
        </div>
        <button
          class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg transition-colors disabled:opacity-50"
          [disabled]="rebuilding()"
          (click)="onRebuild()"
        >
          @if (rebuilding()) {
            <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            Rebuilding...
          } @else {
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Rebuild & Save
          }
        </button>
      </div>

      <!-- Stale warning -->
      @if (isDirty()) {
        <div class="flex items-center gap-2 px-4 py-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-lg text-sm text-amber-700 dark:text-amber-400">
          <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
          System prompt is outdated. Click "Rebuild & Save" to apply the latest changes.
        </div>
      }

      <!-- Prompt preview -->
      <div class="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div class="flex items-center justify-between px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Preview</span>
          <span class="text-xs text-gray-400">Read-only</span>
        </div>
        <div class="p-4">
          @if (loadingPrompt()) {
            <div class="flex items-center gap-2 text-sm text-gray-400 py-8 justify-center">
              <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              Loading prompt...
            </div>
          } @else if (prompt()) {
            <pre class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">{{ prompt() }}</pre>
          } @else {
            <div class="py-8 text-center text-sm text-gray-400">
              No system prompt generated yet. Click "Rebuild & Save" to generate one.
            </div>
          }
        </div>
      </div>

    </div>
  `,
})
export class TabSystemPromptComponent implements OnChanges {
  agentId      = input.required<number>();
  prompt       = input<string>('');
  isDirty      = input(false);
  loadingPrompt = input(false);

  rebuild = output<void>();

  rebuilding = signal(false);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['prompt']) {
      this.rebuilding.set(false);
    }
  }

  onRebuild(): void {
    this.rebuilding.set(true);
    this.rebuild.emit();
  }
}
