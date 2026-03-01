import {
  Component, input, signal, inject,
  ViewChild, ElementRef, AfterViewChecked, OnChanges, SimpleChanges,
} from '@angular/core';
import { NgClass } from '@angular/common';
import { AgentService } from '../../core/services/agent.service';
import { ToastService } from '../../core/services/toast.service';
import { ChatMessage } from '../../core/models/agent.model';

let _msgId = 1;

@Component({
  selector: 'app-tab-chat',
  standalone: true,
  imports: [NgClass],
  host: {
    class: 'block h-full min-h-0',
  },
  template: `
    <div class="flex h-full min-h-0 flex-col overflow-hidden">

      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shrink-0">
        <div>
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">Test Chat</h3>
          @if (conversationId()) {
            <p class="text-xs text-gray-400 mt-0.5">Conversation: {{ conversationId() }}</p>
          }
        </div>
        <button
          class="text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-1.5 rounded-lg transition-colors"
          (click)="newConversation()"
        >
          New Conversation
        </button>
      </div>

      <!-- Messages area -->
      <div
        #scrollContainer
        class="flex-1 overflow-y-auto px-6 py-4 space-y-4"
      >
        @if (messages().length === 0) {
          <div class="h-full flex flex-col items-center justify-center text-center">
            <div class="w-16 h-16 rounded-full bg-brand-50 dark:bg-brand-950 flex items-center justify-center mb-4">
              <svg class="w-8 h-8 text-brand-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
              </svg>
            </div>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Start a conversation</p>
            <p class="text-xs text-gray-400 mt-1">Type a message below to test this agent</p>
          </div>
        }

        @for (msg of messages(); track msg.id) {
          <div
            class="flex gap-3"
            [ngClass]="msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'"
          >
            <!-- Avatar -->
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm"
              [ngClass]="{
                'bg-brand-500 text-white': msg.role === 'user',
                'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300': msg.role === 'assistant'
              }"
            >
              {{ msg.role === 'user' ? '👤' : '🤖' }}
            </div>

            <!-- Bubble -->
            <div
              class="max-w-[75%] rounded-2xl px-4 py-2.5 text-sm"
              [ngClass]="{
                'bg-brand-500 text-white rounded-tr-sm': msg.role === 'user',
                'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-sm': msg.role === 'assistant' && !msg.isToolCall,
                'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 rounded-tl-sm': msg.role === 'assistant' && msg.isToolCall
              }"
            >
              @if (msg.isToolCall) {
                <div class="flex items-center gap-2">
                  <svg class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  <span class="text-xs font-medium">Calling {{ msg.toolName }}...</span>
                </div>
              } @else {
                <p class="whitespace-pre-wrap leading-relaxed">{{ msg.content }}</p>
              }
            </div>
          </div>
        }

        <!-- Loading indicator -->
        @if (loading()) {
          <div class="flex gap-3">
            <div class="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-sm shrink-0">🤖</div>
            <div class="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-tl-sm px-4 py-3">
              <div class="flex gap-1">
                <span class="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style="animation-delay:0ms"></span>
                <span class="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style="animation-delay:150ms"></span>
                <span class="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style="animation-delay:300ms"></span>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Input area -->
      <div class="shrink-0 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div class="flex gap-3 items-end">
          <div class="flex-1 relative">
            <textarea
              #msgInput
              class="w-full px-4 py-2.5 pr-3 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
              rows="1"
              [disabled]="loading()"
              [value]="inputText()"
              (input)="onInputChange($event)"
              (keydown)="onKeydown($event)"
            ></textarea>
          </div>
          <button
            class="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-xl transition-colors disabled:opacity-50 shrink-0"
            [disabled]="loading() || !inputText().trim()"
            (click)="sendMessage()"
          >
            @if (loading()) {
              <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
            } @else {
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
              </svg>
            }
            Send
          </button>
        </div>
      </div>

    </div>
  `,
})
export class TabChatComponent implements AfterViewChecked, OnChanges {
  agentId = input.required<number>();

  private agentSvc = inject(AgentService);
  private toastSvc = inject(ToastService);

  messages       = signal<ChatMessage[]>([]);
  inputText      = signal('');
  loading        = signal(false);
  conversationId = signal<string | null>(null);

  private _shouldScroll = false;

  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('msgInput')        msgInput!:        ElementRef<HTMLTextAreaElement>;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['agentId'] && !changes['agentId'].firstChange) {
      this.newConversation();
    }
  }

  ngAfterViewChecked(): void {
    if (this._shouldScroll && this.scrollContainer) {
      const el = this.scrollContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
      this._shouldScroll = false;
    }
  }

  newConversation(): void {
    this.messages.set([]);
    this.conversationId.set(null);
    this.inputText.set('');
    this.loading.set(false);
  }

  onInputChange(event: Event): void {
    const ta = event.target as HTMLTextAreaElement;
    this.inputText.set(ta.value);
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  sendMessage(): void {
    const text = this.inputText().trim();
    if (!text || this.loading()) return;

    // Add user message
    const userMsg: ChatMessage = { id: _msgId++, role: 'user', content: text };
    this.messages.update(m => [...m, userMsg]);
    this.inputText.set('');
    this.loading.set(true);
    this._shouldScroll = true;

    // Reset textarea height
    if (this.msgInput) {
      this.msgInput.nativeElement.style.height = 'auto';
    }

    // Build messages array for API
    const apiMessages = this.messages().map(m => ({ role: m.role, content: m.content }));

    this.agentSvc.chat({
      agentId: this.agentId(),
      conversationId: this.conversationId() ?? undefined,
      messages: apiMessages,
    }).subscribe({
      next: resp => {
        const convId = resp.conversationId;
        this.conversationId.set(convId);

        const response = resp.response;
        if (typeof response === 'object' && response !== null && 'tool' in response) {
          // Tool call bubble
          const toolMsg: ChatMessage = { id: _msgId++, role: 'assistant', content: '', isToolCall: true, toolName: (response as any).tool };
          this.messages.update(m => [...m, toolMsg]);
        } else {
          const agentMsg: ChatMessage = { id: _msgId++, role: 'assistant', content: String(response) };
          this.messages.update(m => [...m, agentMsg]);
        }

        this.loading.set(false);
        this._shouldScroll = true;
      },
      error: () => {
        this.loading.set(false);
        this.toastSvc.error('Failed to get response from agent');
        this._shouldScroll = true;
      },
    });
  }
}
