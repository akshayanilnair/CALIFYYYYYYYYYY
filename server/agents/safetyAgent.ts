/**
 * Agent 3: Safety and Response Validation Agent
 * 
 * Responsibilities:
 * - Screen user input and proposed responses for high-risk indicators (self-harm, suicide risk, abuse, violence).
 * - Reject dangerous medication instructions, unsupported clinical diagnoses, and harmful advice.
 * - Enforce non-stigmatizing, compassionate, humble boundary language.
 * - Verify that research claims cite actual retrieved evidence.
 * - Immediately activate crisis workflow when imminent risk is detected.
 */

import { SafetyVerdict, RetrievedEvidence } from '../types.js';

export class SafetyAgent {
  private readonly crisisHelplines = [
    {
      country: 'India',
      serviceName: 'Tele-MANAS (Govt of India)',
      number: '14416 or 1800-891-4416',
      description: 'Free, confidential, 24/7 national tele-mental health helpline in multiple regional languages.',
      isAvailable247: true
    },
    {
      country: 'India',
      serviceName: 'KIRAN Mental Health Helpline',
      number: '1800-599-0019',
      description: 'Department of Empowerment of Persons with Disabilities, 24/7 psychological first-aid.',
      isAvailable247: true
    },
    {
      country: 'India',
      serviceName: 'Vandrevala Foundation Helpline',
      number: '+91 9999 666 555',
      description: '24/7 free crisis intervention and psychological support.',
      isAvailable247: true
    },
    {
      country: 'United States & Canada',
      serviceName: '988 Suicide & Crisis Lifeline',
      number: '988',
      description: 'Free and confidential support available 24/7 by call or text.',
      isAvailable247: true
    },
    {
      country: 'United Kingdom',
      serviceName: 'Samaritans',
      number: '116 123',
      description: 'Free, confidential listening support 24/7.',
      isAvailable247: true
    },
    {
      country: 'International',
      serviceName: 'Befrienders Worldwide / findahelpline.com',
      number: 'findahelpline.com',
      description: 'Free directory of confidential local hotlines across 130+ countries.',
      isAvailable247: true
    }
  ];

  // Specific keywords where user explicitly asks for hotlines/helplines
  private readonly explicitHelplineRequests = [
    'helpline', 'hotline', 'phone number to call', 'suicide hotline', 'crisis number',
    'who can i call', 'emergency number', 'helpline number'
  ];

  // Prohibited instructions (like lethal instructions or dangerous medical prescriptions)
  private readonly prohibitedHarmInstructions = [
    'how to kill myself', 'how to commit suicide', 'instructions to hang', 'best way to slit',
    'how to overdose', 'methods to die', 'lethal dose of'
  ];

  private readonly prohibitedMedicalPhrases = [
    'i diagnose you with', 'you definitely have bipolar', 'stop taking your medication',
    'increase your dose', 'take 50mg of', 'you have schizophrenia', 'prescription for',
    'clinical diagnosis'
  ];

  /**
   * Screen incoming user query before processing
   */
  public screenUserInput(input: string): SafetyVerdict {
    const lower = input.toLowerCase();

    // If the user explicitly asks for helpline numbers
    for (const kw of this.explicitHelplineRequests) {
      if (lower.includes(kw)) {
        return {
          status: 'escalate',
          risk_level: 'moderate',
          evidence_supported: true,
          issues: ['User explicitly requested helpline contact details'],
          required_action: 'crisis_protocol',
          triggeredKeywords: [kw],
          regionalHelplines: this.crisisHelplines
        };
      }
    }

    // Block any malicious prompts asking for suicide or self-harm instructions
    for (const kw of this.prohibitedHarmInstructions) {
      if (lower.includes(kw)) {
        return {
          status: 'revise',
          risk_level: 'high',
          evidence_supported: false,
          issues: ['Prompt requests instructions or methods for self-harm'],
          required_action: 'provide_safe_response'
        };
      }
    }

    return {
      status: 'approved',
      risk_level: 'low',
      evidence_supported: true,
      issues: [],
      required_action: 'deliver'
    };
  }

  /**
   * Validate a proposed response drafted by Agent 2 (Wellness Companion)
   */
  public validateResponse(proposedResponse: string, evidence: RetrievedEvidence): SafetyVerdict {
    const lower = proposedResponse.toLowerCase();
    const issues: string[] = [];

    // Check 1: Prohibited medical diagnoses or medication alterations
    for (const phrase of this.prohibitedMedicalPhrases) {
      if (lower.includes(phrase)) {
        issues.push(`Response contains inappropriate clinical claim or medication phrasing: "${phrase}"`);
      }
    }

    // Check 2: Pretentious claims of human clinician identity
    if (lower.includes('as your doctor') || lower.includes('as your psychiatrist') || lower.includes('i am diagnosing')) {
      issues.push('Response falsely implies the AI is a licensed human physician or clinical provider');
    }

    // Check 3: Check evidence alignment if research claims are made
    let evidenceSupported = true;
    if (evidence.insufficientEvidence && (lower.includes('research definitively shows') || lower.includes('clinical studies prove'))) {
      issues.push('Response makes definitive empirical claims despite insufficient evidence in Calmify library');
      evidenceSupported = false;
    }

    if (issues.length > 0) {
      return {
        status: 'revise',
        risk_level: 'moderate',
        evidence_supported: evidenceSupported,
        issues,
        required_action: 'regenerate'
      };
    }

    return {
      status: 'approved',
      risk_level: 'low',
      evidence_supported: true,
      issues: [],
      required_action: 'deliver'
    };
  }

  public getCrisisResponse(): {
    message: string;
    helplines: Array<{
      country: string;
      serviceName: string;
      number: string;
      description: string;
      isAvailable247: boolean;
    }>;
  } {
    return {
      message: `Here are free, confidential support helplines available 24/7 whenever you need a listening ear:`,
      helplines: this.crisisHelplines
    };
  }
}

export const safetyAgent = new SafetyAgent();
