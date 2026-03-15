import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Conversation,
  ConversationMessage,
  UpsertConversationRequest,
} from '../models/conversation.model';
import { API_BASE_URL } from '../config/api.config';

@Injectable({ providedIn: 'root' })
export class ConversationService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = API_BASE_URL;

  upsertConversation(data: UpsertConversationRequest): Observable<Conversation> {
    return this.http.post<Conversation>(`${this.apiBase}/conversations`, data);
  }

  getConversations(userId: string): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`${this.apiBase}/conversations`, {
      params: { userId },
    });
  }

  getMessages(conversationId: string): Observable<ConversationMessage[]> {
    return this.http.get<ConversationMessage[]>(
      `${this.apiBase}/conversations/${encodeURIComponent(conversationId)}/messages`
    );
  }

  deleteConversation(conversationId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiBase}/conversations/${encodeURIComponent(conversationId)}`
    );
  }
}
