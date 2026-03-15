import {
  AfterViewChecked,
  Component,
  ElementRef,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
  inject,
  input,
  signal,
} from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { ChatMessage } from '../../core/models/agent.model';
import { Conversation } from '../../core/models/conversation.model';
import { AgentService } from '../../core/services/agent.service';
import { ConversationService } from '../../core/services/conversation.service';
import { ToastService } from '../../core/services/toast.service';

const CHAT_USER_ID = 'admin-ui';

let localMessageId = 1;

@Component({
  selector: 'app-tab-chat',
  standalone: true,
  imports: [NgClass, DatePipe],
  host: {
    class: 'block h-full min-h-0',
  },
  template: `
    <div class="flex h-full min-h-0 overflow-hidden">
      <aside class="hidden w-72 shrink-0 border-r border-gray-200 bg-gray-50/80 xl:flex xl:flex-col dark:border-gray-700 dark:bg-gray-900/60">
        <div class="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
          <div class="flex items-center justify-between gap-3">
            <div>
              <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">Conversations</h3>
              <p class="mt-0.5 text-xs text-gray-400">Saved for {{ userId }}</p>
            </div>
            <button
              class="rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-white hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
              (click)="newConversation()"
            >
              New
            </button>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-3">
          @if (loadingConversations()) {
            <p class="px-2 py-3 text-xs text-gray-400">Loading conversations...</p>
          } @else if (conversations().length === 0) {
            <div class="rounded-xl border border-dashed border-gray-300 px-4 py-5 text-center text-xs text-gray-400 dark:border-gray-700">
              No saved conversations yet
            </div>
          } @else {
            <div class="space-y-2">
              @for (conversation of conversations(); track conversation.conversationId) {
                <button
                  class="block w-full rounded-xl border px-3 py-3 text-left transition-colors"
                  [ngClass]="{
                    'border-brand-200 bg-white shadow-sm dark:border-brand-700 dark:bg-gray-800': conversationId() === conversation.conversationId,
                    'border-transparent bg-transparent hover:border-gray-200 hover:bg-white dark:hover:border-gray-700 dark:hover:bg-gray-800': conversationId() !== conversation.conversationId
                  }"
                  (click)="selectConversation(conversation)"
                >
                  <p class="line-clamp-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                    {{ conversation.title || 'Untitled conversation' }}
                  </p>
                  <p class="mt-1 text-xs text-gray-400">
                    {{ conversation.updatedDate | date: 'short' }}
                  </p>
                </button>
              }
            </div>
          }
        </div>
      </aside>

      <div class="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div class="flex items-center justify-between gap-3 border-b border-gray-200 bg-white px-6 py-3 dark:border-gray-700 dark:bg-gray-800">
          <div class="min-w-0">
            <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">Test Chat</h3>
            @if (activeConversationTitle()) {
              <p class="mt-0.5 truncate text-xs text-gray-400">{{ activeConversationTitle() }}</p>
            } @else {
              <p class="mt-0.5 text-xs text-gray-400">New unsaved conversation</p>
            }
          </div>

          <div class="flex items-center gap-2">
            @if (conversationId()) {
              <button
                class="rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                [disabled]="loading() || loadingMessages()"
                (click)="deleteCurrentConversation()"
              >
                Delete
              </button>
            }
            <button
              class="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
              (click)="newConversation()"
            >
              New Conversation
            </button>
          </div>
        </div>

        <div #scrollContainer class="flex-1 overflow-y-auto px-6 py-4">
          @if (loadingMessages()) {
            <div class="flex h-full items-center justify-center">
              <p class="text-sm text-gray-400">Loading messages...</p>
            </div>
          } @else if (messages().length === 0) {
            <div class="flex h-full flex-col items-center justify-center text-center">
              <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-950">
                <svg class="h-8 w-8 text-brand-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
                </svg>
              </div>
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Start a conversation</p>
              <p class="mt-1 text-xs text-gray-400">Messages will be persisted through the conversation APIs</p>
            </div>
          } @else {
            <div class="space-y-4">
              @for (msg of messages(); track msg.messageId ?? msg.id) {
                <div class="flex gap-3" [ngClass]="msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'">
                  <div
                    class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm"
                    [ngClass]="{
                      'bg-brand-500 text-white': msg.role === 'user',
                      'bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-300': msg.role === 'assistant'
                    }"
                  >
                    {{ msg.role === 'user' ? 'U' : 'AI' }}
                  </div>

                  <div
                    class="max-w-[75%] rounded-2xl px-4 py-2.5 text-sm"
                    [ngClass]="{
                      'rounded-tr-sm bg-brand-500 text-white': msg.role === 'user',
                      'rounded-tl-sm bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200': msg.role === 'assistant' && !msg.isToolCall,
                      'rounded-tl-sm border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-400': msg.role === 'assistant' && msg.isToolCall
                    }"
                  >
                    @if (msg.isToolCall) {
                      <div class="flex items-center gap-2">
                        <svg class="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                        <span class="text-xs font-medium">Calling {{ msg.toolName }}...</span>
                      </div>
                    } @else {
                      <p class="whitespace-pre-wrap leading-relaxed">{{ msg.content }}</p>
                    }

                    @if (msg.createdDate) {
                      <p class="mt-2 text-[11px] opacity-70">{{ msg.createdDate | date: 'shortTime' }}</p>
                    }
                  </div>
                </div>
              }

              @if (loading()) {
                <div class="flex gap-3">
                  <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm dark:bg-gray-600">AI</div>
                  <div class="rounded-2xl rounded-tl-sm bg-gray-100 px-4 py-3 dark:bg-gray-700">
                    <div class="flex gap-1">
                      <span class="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style="animation-delay:0ms"></span>
                      <span class="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style="animation-delay:150ms"></span>
                      <span class="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style="animation-delay:300ms"></span>
                    </div>
                  </div>
                </div>
              }
            </div>
          }
        </div>

        <div class="shrink-0 border-t border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
          <div class="mb-2 flex items-center justify-between text-[11px] text-gray-400">
            <span class="truncate">User: {{ userId }}</span>
            @if (conversationId()) {
              <span class="truncate">Conversation: {{ conversationId() }}</span>
            }
          </div>

          <div class="flex items-end gap-3">
            <div class="relative flex-1">
              <textarea
                #msgInput
                class="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-2.5 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-60 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
                rows="1"
                [disabled]="loading() || loadingMessages()"
                [value]="inputText()"
                (input)="onInputChange($event)"
                (keydown)="onKeydown($event)"
              ></textarea>
            </div>

            <button
              class="shrink-0 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-600 disabled:opacity-50"
              [disabled]="loading() || loadingMessages() || !inputText().trim()"
              (click)="sendMessage()"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class TabChatComponent implements AfterViewChecked, OnChanges, OnInit {
  agentCode = input.required<string>();

  protected readonly userId = CHAT_USER_ID;

  private readonly agentSvc = inject(AgentService);
  private readonly conversationSvc = inject(ConversationService);
  private readonly toastSvc = inject(ToastService);

  messages = signal<ChatMessage[]>([]);
  conversations = signal<Conversation[]>([]);
  inputText = signal('');
  loading = signal(false);
  loadingMessages = signal(false);
  loadingConversations = signal(false);
  conversationId = signal<string | null>(null);
  activeConversationTitle = signal('');

  private shouldScroll = false;

  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('msgInput') msgInput!: ElementRef<HTMLTextAreaElement>;

  ngOnInit(): void {
    this.loadConversations();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['agentCode'] && !changes['agentCode'].firstChange) {
      this.newConversation(false);
      this.loadConversations();
    }
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll && this.scrollContainer) {
      const el = this.scrollContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
      this.shouldScroll = false;
    }
  }

  newConversation(resetInput = true): void {
    this.messages.set([]);
    this.conversationId.set(null);
    this.activeConversationTitle.set('');
    this.loading.set(false);
    this.loadingMessages.set(false);
    if (resetInput) {
      this.inputText.set('');
      this.resetTextareaHeight();
    }
  }

  onInputChange(event: Event): void {
    const ta = event.target as HTMLTextAreaElement;
    this.inputText.set(ta.value);
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  selectConversation(conversation: Conversation): void {
    if (this.loading()) return;

    this.conversationId.set(conversation.conversationId);
    this.activeConversationTitle.set(conversation.title ?? '');
    this.loadingMessages.set(true);

    this.conversationSvc.getMessages(conversation.conversationId).subscribe({
      next: messages => {
        this.messages.set(
          messages.map(message => ({
            id: localMessageId++,
            messageId: message.messageId,
            role: message.role === 'assistant' ? 'assistant' : 'user',
            content: this.parseStoredContent(message.content),
            createdDate: message.createdDate,
          }))
        );
        this.loadingMessages.set(false);
        this.shouldScroll = true;
      },
      error: () => {
        this.loadingMessages.set(false);
        this.toastSvc.error('Failed to load conversation messages');
      },
    });
  }

  deleteCurrentConversation(): void {
    const currentConversationId = this.conversationId();
    if (!currentConversationId) return;

    this.conversationSvc.deleteConversation(currentConversationId).subscribe({
      next: () => {
        this.toastSvc.success('Conversation deleted');
        this.newConversation();
        this.loadConversations();
      },
      error: () => this.toastSvc.error('Failed to delete conversation'),
    });
  }

  sendMessage(): void {
    const text = this.inputText().trim();
    if (!text || this.loading() || this.loadingMessages()) return;

    const currentConversationId = this.conversationId() ?? crypto.randomUUID();
    const currentMessageId = crypto.randomUUID();
    const isNewConversation = !this.conversationId();
    const title = this.buildConversationTitle(text);

    const userMessage: ChatMessage = {
      id: localMessageId++,
      messageId: currentMessageId,
      role: 'user',
      content: text,
      createdDate: new Date().toISOString(),
    };

    this.messages.update(list => [...list, userMessage]);
    this.inputText.set('');
    this.resetTextareaHeight();
    this.loading.set(true);
    this.shouldScroll = true;

    const sendChat = () => {
      const apiMessages = this.messages().map(message => ({
        role: message.role,
        content: message.content,
      }));

      this.agentSvc
        .chat({
          agentCode: this.agentCode(),
          conversationId: currentConversationId,
          messageId: currentMessageId,
          userId: this.userId,
          messages: apiMessages,
        })
        .subscribe({
          next: resp => {
            this.conversationId.set(currentConversationId);
            this.activeConversationTitle.set(title);

            const response = resp.response;
            if (typeof response === 'object' && response !== null && 'tool' in response) {
              this.messages.update(list => [
                ...list,
                {
                  id: localMessageId++,
                  role: 'assistant',
                  content: '',
                  isToolCall: true,
                  toolName: String(response.tool),
                },
              ]);
            } else {
              this.messages.update(list => [
                ...list,
                {
                  id: localMessageId++,
                  role: 'assistant',
                  content: String(response),
                  createdDate: new Date().toISOString(),
                },
              ]);
            }

            this.loading.set(false);
            this.shouldScroll = true;
            this.loadConversations(currentConversationId);
          },
          error: () => {
            this.loading.set(false);
            this.toastSvc.error('Failed to get response from agent');
          },
        });
    };

    if (isNewConversation) {
      this.conversationSvc
        .upsertConversation({
          conversationId: currentConversationId,
          userId: this.userId,
          title,
        })
        .subscribe({
          next: () => sendChat(),
          error: () => {
            this.loading.set(false);
            this.messages.update(list => list.filter(message => message.messageId !== currentMessageId));
            this.toastSvc.error('Failed to create conversation');
          },
        });
      return;
    }

    sendChat();
  }

  private loadConversations(selectedConversationId?: string): void {
    this.loadingConversations.set(true);
    this.conversationSvc.getConversations(this.userId).subscribe({
      next: conversations => {
        const sorted = [...conversations].sort(
          (a, b) => new Date(b.updatedDate).getTime() - new Date(a.updatedDate).getTime()
        );
        this.conversations.set(sorted);
        this.loadingConversations.set(false);

        const activeId = selectedConversationId ?? this.conversationId();
        if (!activeId) return;

        const activeConversation = sorted.find(conversation => conversation.conversationId === activeId);
        if (activeConversation) {
          this.activeConversationTitle.set(activeConversation.title ?? '');
        }
      },
      error: () => {
        this.loadingConversations.set(false);
        this.toastSvc.error('Failed to load conversations');
      },
    });
  }

  private buildConversationTitle(content: string): string {
    return content.length > 60 ? `${content.slice(0, 57)}...` : content;
  }

  private parseStoredContent(content: string): string {
    try {
      const parsed = JSON.parse(content);
      return typeof parsed === 'string' ? parsed : JSON.stringify(parsed, null, 2);
    } catch {
      return content;
    }
  }

  private resetTextareaHeight(): void {
    if (this.msgInput) {
      this.msgInput.nativeElement.style.height = 'auto';
    }
  }
}
