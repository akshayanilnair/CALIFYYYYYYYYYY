/**
 * Calmify API Client
 * Typed communication with backend REST services
 */

import {
  UserProfile,
  ChatMessage,
  Conversation,
  MoodEntry,
  JournalEntry,
  WellnessActivity,
  AutomationRule,
  AutomationExecution,
  NotificationDelivery,
  ResearchDocument,
  SecurityControlFinding
} from '../../server/types.js';

class ApiClient {
  private activeUserId: string = 'usr-demo-01';

  public setUserId(id: string) {
    this.activeUserId = id;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = {
      'Content-Type': 'application/json',
      'X-User-Id': this.activeUserId,
      ...(options.headers || {})
    };

    const res = await fetch(endpoint, { ...options, headers });
    if (!res.ok) {
      let errorMsg = `HTTP Error ${res.status}`;
      try {
        const errorData = await res.json();
        errorMsg = errorData.message || errorData.error || errorMsg;
      } catch {
        // Response was not JSON
      }
      throw new Error(errorMsg);
    }
    return res.json();
  }

  // Auth & Profile
  public getMe() {
    return this.request<{ user: UserProfile }>('/api/auth/me');
  }

  public switchRole(role: 'user' | 'reviewer' | 'admin') {
    return this.request<{ user: UserProfile; message: string }>('/api/auth/switch-role', {
      method: 'POST',
      body: JSON.stringify({ role })
    });
  }

  public updateProfile(data: { name?: string; preferences?: Partial<UserProfile['preferences']> }) {
    return this.request<{ user: UserProfile }>('/api/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  // Chat & 3-Agent AI
  public sendChatMessage(message: string, conversationId?: string) {
    return this.request<{
      conversationId: string;
      userMessage: ChatMessage;
      assistantMessage: ChatMessage;
      trace: ChatMessage['trace'];
      isCrisisEscalated: boolean;
    }>('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message, conversationId })
    });
  }

  public getConversations() {
    return this.request<{ conversations: Conversation[] }>('/api/conversations');
  }

  public getConversation(id: string) {
    return this.request<{ conversation: Conversation; messages: ChatMessage[] }>(`/api/conversations/${id}`);
  }

  public deleteConversation(id: string) {
    return this.request<{ success: boolean }>(`/api/conversations/${id}`, { method: 'DELETE' });
  }

  public sendFeedback(conversationId: string, messageId: string, feedback: 'helpful' | 'unhelpful') {
    return this.request<{ success: boolean }>(`/api/conversations/${conversationId}/feedback`, {
      method: 'POST',
      body: JSON.stringify({ messageId, feedback })
    });
  }

  // Mood Tracker
  public getMoods() {
    return this.request<{ moods: MoodEntry[] }>('/api/moods');
  }

  public createMood(data: Omit<MoodEntry, 'id' | 'userId' | 'timestamp'>) {
    return this.request<{ mood: MoodEntry }>('/api/moods', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  public deleteMood(id: string) {
    return this.request<{ success: boolean }>(`/api/moods/${id}`, { method: 'DELETE' });
  }

  // Digital Journal
  public getJournals() {
    return this.request<{ journals: JournalEntry[] }>('/api/journal');
  }

  public createJournal(data: { title: string; content: string; promptUsed?: string; sentimentTags?: string[] }) {
    return this.request<{ journal: JournalEntry }>('/api/journal', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  public updateJournal(id: string, data: { title?: string; content?: string; sentimentTags?: string[] }) {
    return this.request<{ journal: JournalEntry }>(`/api/journal/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  public deleteJournal(id: string) {
    return this.request<{ success: boolean }>(`/api/journal/${id}`, { method: 'DELETE' });
  }

  // Wellness Activities & Progress
  public getActivities() {
    return this.request<{ activities: WellnessActivity[] }>('/api/activities');
  }

  public completeActivity(id: string, data: { durationSeconds: number; moodBefore?: number; moodAfter?: number }) {
    return this.request<{ completion: any }>(`/api/activities/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  public getProgress() {
    return this.request<{
      streak: number;
      totalMindfulMinutes: number;
      completedExercises: number;
      recordedMoods: number;
      writtenJournals: number;
      recentCompletions: any[];
    }>('/api/progress');
  }

  // Automations & Notifications
  public getAutomations() {
    return this.request<{ automations: AutomationRule[] }>('/api/automations');
  }

  public toggleAutomation(id: string, enabled: boolean) {
    return this.request<{ automation: AutomationRule }>(`/api/automations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ enabled })
    });
  }

  public runAutomation(id: string) {
    return this.request<{ execution: AutomationExecution }>(`/api/automations/${id}/run`, {
      method: 'POST'
    });
  }

  public getAutomationExecutions() {
    return this.request<{ executions: AutomationExecution[] }>('/api/automations/executions');
  }

  public getNotifications() {
    return this.request<{ notifications: NotificationDelivery[] }>('/api/notifications');
  }

  public markNotificationRead(id: string) {
    return this.request<{ success: boolean }>(`/api/notifications/${id}/read`, { method: 'PATCH' });
  }

  // Research Admin Console
  public getResearchDocs() {
    return this.request<{ documents: ResearchDocument[] }>('/api/admin/research');
  }

  public uploadResearchDoc(data: {
    title: string;
    authors: string[];
    publicationYear: number;
    journal: string;
    summary: string;
    fullText?: string;
    tags: string[];
  }) {
    return this.request<{ document: ResearchDocument }>('/api/admin/research/upload', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  public reviewResearchDoc(id: string, status: 'approved' | 'rejected') {
    return this.request<{ document: ResearchDocument }>(`/api/admin/research/${id}/review`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }

  // 20-Point Security Program
  public getSecurityStatus() {
    return this.request<{
      overallScore: number;
      summary: { total: number; passed: number; failed: number; needsConfig: number };
      findings: SecurityControlFinding[];
      recentAudits: any[];
    }>('/api/admin/security/status');
  }

  // Privacy
  public getExportUrl() {
    return `/api/privacy/export`;
  }

  public deleteAccount() {
    return this.request<{ success: boolean; message: string }>('/api/privacy/account', {
      method: 'DELETE'
    });
  }
}

export const api = new ApiClient();
