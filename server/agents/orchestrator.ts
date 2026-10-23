/**
 * Central AI Orchestrator
 * Coordinates the Three-Agent Architecture:
 * - Agent 1: Research and Evidence Agent
 * - Agent 2: Personalized Wellness Companion Agent
 * - Agent 3: Safety and Response Validation Agent
 */

import { researchAgent } from './researchAgent.js';
import { wellnessAgent } from './wellnessAgent.js';
import { safetyAgent } from './safetyAgent.js';
import { UserProfile, ChatMessage, AgentExecutionTrace } from '../types.js';

export interface OrchestrationResult {
  message: string;
  citations: Array<{
    sourceId: string;
    title: string;
    authors: string[];
    year: number;
    doi?: string;
    passageSnippet: string;
  }>;
  suggestedActivities: string[];
  trace: AgentExecutionTrace;
  isCrisisEscalated: boolean;
}

export class CentralAIOrchestrator {
  private readonly MAX_RETRIES = 2;

  public async processUserMessage(
    userMessage: string,
    userProfile?: UserProfile,
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
  ): Promise<OrchestrationResult> {
    const startTime = Date.now();
    const requestId = `req-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // STEP 1: Initial Safety Pre-screening
    const preScreenStart = Date.now();
    const preScreenVerdict = safetyAgent.screenUserInput(userMessage);
    const preScreenTime = Date.now() - preScreenStart;

    // Immediate Crisis Escalation Pathway (when user explicitly asks for helpline contacts)
    if (preScreenVerdict.status === 'escalate' || preScreenVerdict.required_action === 'crisis_protocol') {
      const crisis = safetyAgent.getCrisisResponse();
      const totalTime = Date.now() - startTime;

      let crisisMessage = `${crisis.message}\n\n`;
      crisis.helplines.forEach((h: { serviceName: string; country: string; number: string; description: string }) => {
        crisisMessage += `• **${h.serviceName} (${h.country})**: **${h.number}**\n  *${h.description}*\n`;
      });
      crisisMessage += `\nI am also right here with you if you want to talk through what is happening or take a slow breath together.`;

      return {
        message: crisisMessage,
        citations: [],
        suggestedActivities: ['5-4-3-2-1 Sensory Grounding'],
        isCrisisEscalated: true,
        trace: {
          requestId,
          stepTimingsMs: {
            safetyScreening: preScreenTime,
            researchRetrieval: 0,
            wellnessDraft: 0,
            safetyValidation: 0,
            total: totalTime
          },
          retrievedCount: 0,
          safetyVerdict: preScreenVerdict,
          revisedTimes: 0,
          modelUsed: 'deterministic-safety-engine'
        }
      };
    }

    // STEP 2: Research Retrieval via Research Agent
    const researchStart = Date.now();
    const evidence = await researchAgent.retrieveEvidence(userMessage);
    const researchTime = Date.now() - researchStart;

    // STEP 3 & 4: Wellness Draft & Safety Validation with Bounded Revision
    let draftResult = { text: '', suggestedActivities: [] as string[], modelUsed: 'unknown' };
    let safetyVerdict = preScreenVerdict;
    let draftTime = 0;
    let validationTime = 0;
    let revisionCount = 0;

    for (let attempt = 0; attempt <= this.MAX_RETRIES; attempt++) {
      const dStart = Date.now();
      draftResult = await wellnessAgent.draftResponse(userMessage, evidence, userProfile, conversationHistory);
      draftTime += Date.now() - dStart;

      const vStart = Date.now();
      safetyVerdict = safetyAgent.validateResponse(draftResult.text, evidence);
      validationTime += Date.now() - vStart;

      if (safetyVerdict.status === 'approved' || safetyVerdict.required_action === 'deliver') {
        break; // Successfully approved!
      }

      revisionCount++;
      // If validation flagged issues, modify prompt constraints on retry
      userMessage = `${userMessage} (Ensure no clinical diagnoses or unsupported assertions are made)`;
    }

    // Prepare Citations Mapping
    const citations = evidence.passages.map(p => ({
      sourceId: p.documentId,
      title: p.documentTitle,
      authors: p.authors,
      year: p.year,
      doi: undefined,
      passageSnippet: p.text
    }));

    const totalTime = Date.now() - startTime;

    return {
      message: draftResult.text,
      citations,
      suggestedActivities: draftResult.suggestedActivities,
      isCrisisEscalated: false,
      trace: {
        requestId,
        stepTimingsMs: {
          safetyScreening: preScreenTime,
          researchRetrieval: researchTime,
          wellnessDraft: draftTime,
          safetyValidation: validationTime,
          total: totalTime
        },
        retrievedCount: evidence.passages.length,
        safetyVerdict,
        revisedTimes: revisionCount,
        modelUsed: draftResult.modelUsed
      }
    };
  }
}

export const orchestrator = new CentralAIOrchestrator();
