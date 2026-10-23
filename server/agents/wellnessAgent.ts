/**
 * Agent 2: Personalized Wellness Companion Agent
 * 
 * Responsibilities:
 * - Convert retrieved research evidence and consented user context into empathetic, practical wellness guidance.
 * - Communicate in supportive, non-stigmatizing language.
 * - Suggest low-risk wellness practices (breathing, grounding, mindful journaling, micro-breaks).
 * - Distinguish research findings from general wellness suggestions.
 * - Never diagnose conditions, prescribe medication, or replace professional healthcare.
 */

import { GoogleGenAI } from '@google/genai';
import { RetrievedEvidence, UserProfile } from '../types.js';

export class WellnessAgent {
  private ai: GoogleGenAI | null = null;
  private isGeminiHealthy: boolean = true;

  constructor() {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== 'MY_GEMINI_API_KEY' && !key.startsWith('MY_') && key.trim().length > 15) {
      try {
        this.ai = new GoogleGenAI({
          apiKey: key,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });
      } catch (err) {
        console.warn('[WellnessAgent] Could not initialize GoogleGenAI client:', err);
        this.isGeminiHealthy = false;
      }
    } else {
      this.isGeminiHealthy = false;
    }
  }

  /**
   * Draft a supportive response informed by evidence and user preferences
   */
  public async draftResponse(
    userMessage: string,
    evidence: RetrievedEvidence,
    userProfile?: UserProfile,
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
  ): Promise<{ text: string; suggestedActivities: string[]; modelUsed: string }> {
    // Check if Gemini API is available and healthy
    if (this.ai && this.isGeminiHealthy && process.env.GEMINI_API_KEY) {
      try {
        const evidenceContext = evidence.passages.length > 0
          ? `SUPPORTIVE EVIDENCE CONTEXT (weave in gently only if relevant; never lecture):\n` +
            evidence.passages.map((p, idx) => `[Source ${idx + 1}] "${p.text}" (${p.documentTitle}, ${p.year})`).join('\n\n')
          : `EVIDENCE CONTEXT: General emotional support and somatic grounding.`;

        const userContext = userProfile?.preferences.personalizationConsent
          ? `USER CONTEXT: Name is ${userProfile.name}. Preferred breathing pace is ${userProfile.preferences.preferredBreathingPace}.`
          : `USER CONTEXT: Standard anonymous conversation.`;

        const systemInstruction = `You are Calmify, a warm, caring, empathetic human companion.
Your goal is to listen, understand, and console the person with genuine human sympathy.

RULES:
1. Speak naturally like a caring friend sitting beside them: Warm, gentle, direct, and comforting.
2. NEVER speak like a corporate bot. NEVER say "Thank you for sharing", "Thank you for opening up", "As an AI", or "I understand that you are experiencing...".
3. CONSOLE DIRECTLY: When the user is hurting, sad, lonely, anxious, crying, or in despair, understand their feelings and console them. Comfort them, stay right by their side, and reassure them that they are not alone. E.g., "I'm right here with you. Take a slow, gentle breath. You don't have to carry this all by yourself."
4. STICK TO THE POINT: Keep your reply concise, warm, and comforting (under 100 words). Do not give long academic lectures or dumps of irrelevant information.
5. NO EM DASHES: Never use em dashes (—). Use normal commas, periods, or simple hyphens.
6. PRACTICAL CARE: Offer a gentle micro-step, like taking a slow breath together or relaxing their shoulders.
7. CLINICAL BOUNDARIES: Do not give clinical psychiatric diagnoses or alter prescription medications.

${evidenceContext}

${userContext}
`;

        const recentHistory = conversationHistory.slice(-4).map(h => `${h.role === 'user' ? 'User' : 'Companion'}: ${h.content}`).join('\n');
        const prompt = `${recentHistory ? `RECENT CONVERSATION:\n${recentHistory}\n\n` : ''}User Message: "${userMessage}"\n\nFormulate your direct, warm, consoling response:`;

        const generatePromise = this.ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction,
            temperature: 0.7,
            topP: 0.9,
          }
        });

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('AI response timed out after 3.5 seconds')), 3500)
        );

        const response = await Promise.race([generatePromise, timeoutPromise]);
        const text = response.text || this.buildFallbackResponse(userMessage, evidence);
        const suggestedActivities = this.extractSuggestedActivities(text, userMessage);

        return {
          text,
          suggestedActivities,
          modelUsed: 'gemini-3.8-flash'
        };
      } catch (apiErr) {
        console.warn('[WellnessAgent] Gemini call failed, tripping circuit breaker to immediate fallback:', apiErr);
        this.isGeminiHealthy = false;
      }
    }

    // High-fidelity rule-grounded fallback
    const text = this.buildFallbackResponse(userMessage, evidence);
    const suggestedActivities = this.extractSuggestedActivities(text, userMessage);
    return {
      text,
      suggestedActivities,
      modelUsed: 'calmify-rule-engine-v2'
    };
  }

  private buildFallbackResponse(userMessage: string, evidence: RetrievedEvidence): string {
    const lower = userMessage.toLowerCase();

    // Emotional pain, despair, crying, loneliness, or distress: console directly
    if (
      lower.includes('hurt') ||
      lower.includes('die') ||
      lower.includes('crying') ||
      lower.includes('cry') ||
      lower.includes('sad') ||
      lower.includes('alone') ||
      lower.includes('depressed') ||
      lower.includes('hopeless') ||
      lower.includes('broken') ||
      lower.includes('worthless') ||
      lower.includes('cant do this') ||
      lower.includes("can't do this") ||
      lower.includes('give up')
    ) {
      return `I am right here with you. Take a slow, quiet breath. You do not have to carry all of this heavy weight alone right now.\n\nLet us just pause together for a moment. Drop your shoulders away from your ears, breathe in gently through your nose, and slowly let it out.\n\nWhat is hurting the most right now? I am here and I am listening.`;
    }

    // Panic, rapid heart rate, breathlessness, or physical tension
    if (
      lower.includes('breath') ||
      lower.includes('panic') ||
      lower.includes('heart') ||
      lower.includes('tight') ||
      lower.includes('shaking') ||
      lower.includes('anxiety attack')
    ) {
      return `I am right here with you. Put both feet flat on the floor and let your hands rest loosely on your lap.\n\nLet us take a slow breath together:\n1. Breathe in gently through your nose for 4 seconds.\n2. Hold softly for 4 seconds.\n3. Release slowly through your mouth for 6 seconds, letting all the tension drain out.\n\nYour body is safe right now. Would you like to do another quiet cycle with me?`;
    }

    // Stress, overwhelm, work, burnout, deadlines
    if (
      lower.includes('overwhelm') ||
      lower.includes('stress') ||
      lower.includes('work') ||
      lower.includes('deadline') ||
      lower.includes('busy') ||
      lower.includes('pressure') ||
      lower.includes('tired') ||
      lower.includes('exhausted')
    ) {
      return `That is a lot to carry, and it makes complete sense that you are feeling exhausted. You do not have to fix every single problem right at this second.\n\nLet us take the pressure off for a minute. What is the single thing on your plate that feels the heaviest right now? Let us look at just that one piece together.`;
    }

    // Sleep, insomnia, bedtime racing thoughts
    if (
      lower.includes('sleep') ||
      lower.includes('insomnia') ||
      lower.includes('bed') ||
      lower.includes('night') ||
      lower.includes('awake')
    ) {
      return `It is so frustrating when your body wants rest but your mind keeps racing. Let us help your nervous system wind down.\n\nDim your screen, unclench your jaw, and let your eyes soften. We can do a gentle 4-minute slow breathing sequence together whenever you are ready.`;
    }

    // Evidence-based check if specific research passage is relevant
    if (evidence.passages.length > 0) {
      const topEvidence = evidence.passages[0];
      return `I hear you, and what you are feeling is completely valid. Taking a short pause to reset your nervous system can help create space when things feel crowded.\n\nStudies on stress reduction (${topEvidence.documentTitle}) show that taking even 3 minutes for slow, deliberate exhalations helps settle your heart rate and clears mental fog.\n\nWould you like to try a quick 4-4-4-4 Box Breathing reset, or would you like to talk about what is going on?`;
    }

    // General default: warm, grounded, direct
    return `I hear you. When things build up, taking a quiet moment to pause and reset can make all the difference.\n\nTell me what is on your mind, or let me know if you want to try a quick breathing reset together.`;
  }

  private extractSuggestedActivities(text: string, userMessage: string): string[] {
    const combined = `${text} ${userMessage}`.toLowerCase();
    const suggestions: string[] = [];

    if (combined.includes('breath') || combined.includes('vagal') || combined.includes('sigh')) {
      suggestions.push('Box Breathing (4-4-4-4)');
      suggestions.push('Vagal Nerve 4-7-8 Breathing');
    }
    if (combined.includes('grounding') || combined.includes('sensory') || combined.includes('5-4-3-2-1') || combined.includes('panic')) {
      suggestions.push('5-4-3-2-1 Sensory Grounding');
    }
    if (combined.includes('reframe') || combined.includes('worry') || combined.includes('distortion') || combined.includes('perfectionism')) {
      suggestions.push('Cognitive Reframe & Perspective');
    }
    if (combined.includes('sleep') || combined.includes('bed') || combined.includes('night') || combined.includes('evening')) {
      suggestions.push('Evening Offloading & Sleep Prep');
    }

    if (suggestions.length === 0) {
      suggestions.push('Box Breathing (4-4-4-4)', '5-4-3-2-1 Sensory Grounding');
    }

    return Array.from(new Set(suggestions)).slice(0, 2);
  }
}

export const wellnessAgent = new WellnessAgent();
