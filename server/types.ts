/**
 * Core type definitions for Calmify
 * Architecture: Three-Agent Mental Wellness Platform
 */

export type UserRole = 'user' | 'reviewer' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  timezone: string;
  preferences: {
    theme: 'calm-light' | 'calm-dark' | 'system';
    quietHoursStart: string; // "22:00"
    quietHoursEnd: string;   // "07:00"
    preferredBreathingPace: 'calm' | 'box' | 'energizing';
    dailyCheckinTime: string; // "09:00"
    personalizationConsent: boolean;
    researchContributionConsent: boolean;
  };
  streak: number;
  lastActive: string;
  createdAt: string;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  type: 'terms' | 'privacy' | 'personalization' | 'ai_processing' | 'research_telemetry';
  granted: boolean;
  timestamp: string;
  version: string;
}

// ----------------------------------------------------------------------
// AGENTS & AI ORCHESTRATION
// ----------------------------------------------------------------------

export interface ResearchDocument {
  id: string;
  title: string;
  authors: string[];
  publicationYear: number;
  journal: string;
  doi?: string;
  url?: string;
  reviewStatus: 'pending' | 'reviewed' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewDate?: string;
  summary: string;
  chunks: ResearchChunk[];
  tags: string[];
  createdAt: string;
}

export interface ResearchChunk {
  id: string;
  documentId: string;
  documentTitle: string;
  passageText: string;
  keyFindings: string[];
  category: 'cbt' | 'mindfulness' | 'vagal_breathing' | 'sleep' | 'grounding' | 'self_compassion' | 'distress_tolerance' | 'reframing';
  score?: number;
}

export interface RetrievedEvidence {
  query: string;
  passages: Array<{
    passageId: string;
    documentId: string;
    documentTitle: string;
    authors: string[];
    year: number;
    journal: string;
    text: string;
    relevanceScore: number;
    evidenceLevel: 'meta-analysis' | 'randomized-trial' | 'clinical-guideline' | 'review';
  }>;
  confidence: number;
  insufficientEvidence: boolean;
}

export interface SafetyVerdict {
  status: 'approved' | 'revise' | 'blocked' | 'escalate';
  risk_level: 'low' | 'moderate' | 'high' | 'imminent';
  evidence_supported: boolean;
  issues: string[];
  required_action: 'deliver' | 'regenerate' | 'provide_safe_response' | 'crisis_protocol';
  triggeredKeywords?: string[];
  regionalHelplines?: Array<{
    country: string;
    serviceName: string;
    number: string;
    description: string;
    isAvailable247: boolean;
  }>;
}

export interface AgentExecutionTrace {
  requestId: string;
  stepTimingsMs: {
    safetyScreening: number;
    researchRetrieval: number;
    wellnessDraft: number;
    safetyValidation: number;
    total: number;
  };
  retrievedCount: number;
  safetyVerdict: SafetyVerdict;
  revisedTimes: number;
  modelUsed: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  citations?: Array<{
    sourceId: string;
    title: string;
    authors: string[];
    year: number;
    doi?: string;
    passageSnippet: string;
  }>;
  suggestedActivities?: string[];
  trace?: AgentExecutionTrace;
  feedback?: 'helpful' | 'unhelpful' | null;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  lastMessageSnippet: string;
}

// ----------------------------------------------------------------------
// MOOD & JOURNAL
// ----------------------------------------------------------------------

export interface MoodEntry {
  id: string;
  userId: string;
  valence: number; // -5 to +5 (pleasantness)
  arousal: number; // 1 to 10 (energy level)
  moodLabel: string; // e.g. "Peaceful", "Anxious", "Grounded", "Exhausted"
  emotions: string[]; // ["calm", "grateful", "tired"]
  note?: string;
  triggers?: string[]; // ["work", "sleep", "relationships"]
  timestamp: string;
}

export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  content: string;
  promptUsed?: string;
  sentimentTags?: string[];
  isEncrypted: boolean;
  wordCount: number;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------------------------
// ACTIVITIES & GOALS
// ----------------------------------------------------------------------

export interface WellnessActivity {
  id: string;
  title: string;
  category: 'breathing' | 'grounding' | 'somatic' | 'mindfulness' | 'reframing';
  durationMinutes: number;
  description: string;
  instructions: string[];
  evidenceBasis: string;
  pattern?: {
    inhale: number;
    hold1?: number;
    exhale: number;
    hold2?: number;
    cycles: number;
  };
}

export interface ActivityCompletion {
  id: string;
  userId: string;
  activityId: string;
  activityTitle: string;
  durationSeconds: number;
  timestamp: string;
  moodBefore?: number;
  moodAfter?: number;
}

// ----------------------------------------------------------------------
// AUTOMATIONS & NOTIFICATIONS
// ----------------------------------------------------------------------

export type AutomationTrigger = 'scheduled_cron' | 'event_mood_logged' | 'event_activity_done' | 'event_research_approved';

export interface AutomationRule {
  id: string;
  userId: string;
  title: string;
  type: 'daily_checkin' | 'wellness_reminder' | 'weekly_reflection' | 'research_indexer' | 'safety_monitor';
  enabled: boolean;
  scheduleCron?: string; // e.g. "0 9 * * *"
  preferredTime?: string; // "09:00"
  daysOfWeek?: number[]; // [1,2,3,4,5]
  channel: 'in_app' | 'browser_push' | 'email';
  lastRun?: string;
  nextRun?: string;
  quietHoursEnforced: boolean;
  config: Record<string, unknown>;
}

export interface AutomationExecution {
  id: string;
  ruleId: string;
  ruleTitle: string;
  userId: string;
  triggeredAt: string;
  status: 'success' | 'skipped_quiet_hours' | 'skipped_duplicate' | 'failed';
  resultSummary: string;
  durationMs: number;
}

export interface NotificationDelivery {
  id: string;
  userId: string;
  ruleId?: string;
  title: string;
  body: string;
  channel: 'in_app' | 'browser_push' | 'email';
  status: 'delivered' | 'read' | 'dismissed' | 'suppressed';
  timestamp: string;
  readAt?: string;
  actionUrl?: string;
}

// ----------------------------------------------------------------------
// SECURITY & AUDIT
// ----------------------------------------------------------------------

export type SecurityStatus = 'PASS' | 'FAIL' | 'NEEDS CONFIGURATION' | 'NOT VERIFIED';

export interface SecurityControlFinding {
  controlId: string; // e.g. "CHECK_01"
  name: string;
  category: 'secrets' | 'auth' | 'access' | 'network' | 'data' | 'system';
  status: SecurityStatus;
  testResult: string;
  evidence: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  remediation: string;
  lastVerified: string;
}
