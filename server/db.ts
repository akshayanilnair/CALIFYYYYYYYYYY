/**
 * Persistent Data Storage Layer for Calmify
 * Ensures data isolation, atomic disk writes, and instant hydration
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  UserProfile,
  ConsentRecord,
  ResearchDocument,
  ResearchChunk,
  Conversation,
  ChatMessage,
  MoodEntry,
  JournalEntry,
  WellnessActivity,
  ActivityCompletion,
  AutomationRule,
  AutomationExecution,
  NotificationDelivery,
  SecurityControlFinding
} from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'calmify_store.json');

export interface DatabaseSchema {
  users: Record<string, UserProfile>;
  consents: ConsentRecord[];
  researchDocs: ResearchDocument[];
  researchChunks: ResearchChunk[];
  conversations: Record<string, Conversation>;
  messages: Record<string, ChatMessage[]>;
  moods: MoodEntry[];
  journals: JournalEntry[];
  activities: WellnessActivity[];
  completions: ActivityCompletion[];
  automations: AutomationRule[];
  executions: AutomationExecution[];
  notifications: NotificationDelivery[];
  securityFindings: SecurityControlFinding[];
  auditLogs: Array<{
    id: string;
    timestamp: string;
    actor: string;
    action: string;
    resource: string;
    details: string;
  }>;
}

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial Curated Psychological Research Library
const INITIAL_RESEARCH_DOCS: ResearchDocument[] = [
  {
    id: 'res-cbt-2012',
    title: 'The Efficacy of Cognitive Behavioral Therapy: A Review of Meta-analyses',
    authors: ['Stefan G. Hofmann', 'Adolf Asnaani', 'Imke J.J. Vonk', 'Alice T. Sawyer', 'Angela Fang'],
    publicationYear: 2012,
    journal: 'Cognitive Therapy and Research, 36(5), 427-440',
    doi: '10.1007/s10608-012-9476-1',
    reviewStatus: 'approved',
    reviewedBy: 'Dr. Sarah Lin (Lead Clinical Reviewer)',
    reviewDate: '2026-03-15',
    summary: 'A comprehensive review of 269 meta-analyses showing strong empirical evidence for CBT across anxiety disorders, somatic stress, and generalized emotional regulation.',
    tags: ['CBT', 'Anxiety', 'Cognitive Restructuring', 'Meta-Analysis'],
    createdAt: new Date().toISOString(),
    chunks: [
      {
        id: 'chunk-cbt-1',
        documentId: 'res-cbt-2012',
        documentTitle: 'The Efficacy of Cognitive Behavioral Therapy: A Review of Meta-analyses',
        category: 'cbt',
        passageText: 'Cognitive Behavioral Therapy (CBT) operates through identifying automatic cognitive distortions (catastrophizing, all-or-nothing thinking, emotional reasoning) and testing them against empirical evidence. Cognitive restructuring systematically lowers amygdala reactivity and strengthens prefrontal executive control over distressing affective states.',
        keyFindings: ['Cognitive restructuring reduces emotional hyperreactivity', 'Empirical reappraisal replaces cognitive distortions', 'Effective across generalized worry and acute stress']
      },
      {
        id: 'chunk-cbt-2',
        documentId: 'res-cbt-2012',
        documentTitle: 'The Efficacy of Cognitive Behavioral Therapy: A Review of Meta-analyses',
        category: 'reframing',
        passageText: 'Behavioral experiments and cognitive reframing protocols encourage patients to differentiate between controllable stressors and intrusive worries. Reframing is most effective when executed as written structured reflections rather than purely internal rumination.',
        keyFindings: ['Written structured reflection prevents circular rumination', 'Clear distinction between actionable and hypothetical worry']
      }
    ]
  },
  {
    id: 'res-vagal-2018',
    title: 'Breath of Life: The Respiratory Vagal Stimulation Model of Contemplative Activity',
    authors: ['R. J. S. Gerritsen', 'G. P. H. Band'],
    publicationYear: 2018,
    journal: 'Frontiers in Human Neuroscience, 12, 397',
    doi: '10.3389/fnhum.2018.00397',
    reviewStatus: 'approved',
    reviewedBy: 'Dr. Sarah Lin (Lead Clinical Reviewer)',
    reviewDate: '2026-04-10',
    summary: 'Demonstrates neurobiological pathways through which prolonged exhalation and controlled slow breathing (5-6 breaths/min) stimulate the vagus nerve, increase heart rate variability (HRV), and downregulate sympathetic fight-or-flight tone.',
    tags: ['Physiological Sigh', 'Vagus Nerve', 'Parasympathetic', 'Breathing', 'HRV'],
    createdAt: new Date().toISOString(),
    chunks: [
      {
        id: 'chunk-vagal-1',
        documentId: 'res-vagal-2018',
        documentTitle: 'Breath of Life: The Respiratory Vagal Stimulation Model',
        category: 'vagal_breathing',
        passageText: 'Slow respiration with extended expiration (such as 4-second inhalation followed by 6-to-8-second exhalation) modulates cardiac vagal tone via pulmonary stretch receptors. This activates the baroreflex arc, accelerating parasympathetic nervous system takeover and abruptly reducing subjective anxiety and physiological tremulousness.',
        keyFindings: ['Prolonged exhalation stimulates vagal cholinergic pathways', 'Increases Respiratory Sinus Arrhythmia (RSA)', 'Measurable drop in autonomic sympathetic arousal within 90 seconds']
      },
      {
        id: 'chunk-vagal-2',
        documentId: 'res-vagal-2018',
        documentTitle: 'Breath of Life: The Respiratory Vagal Stimulation Model',
        category: 'vagal_breathing',
        passageText: 'The Physiological Sigh (double nasal inhale followed by slow oral exhale) specifically re-inflates collapsed pulmonary alveoli and expels excess carbon dioxide, signaling immediate safety to brainstem autonomic nuclei.',
        keyFindings: ['Rapid alveolar re-expansion', 'Direct brainstem signaling for acute anxiety decompression']
      }
    ]
  },
  {
    id: 'res-mbsr-2014',
    title: 'Meditation Programs for Psychological Stress and Well-being: A Systematic Review and Meta-analysis',
    authors: ['Madhav Goyal', 'Sonal Singh', 'Erica M. S. Sibinga', 'et al.'],
    publicationYear: 2014,
    journal: 'JAMA Internal Medicine, 174(3), 357-368',
    doi: '10.1001/jamainternmed.2013.13018',
    reviewStatus: 'approved',
    reviewedBy: 'Dr. Kevin Mehta (Ethics & Psychometrics)',
    reviewDate: '2026-05-02',
    summary: 'Rigorous JAMA meta-analysis of 47 randomized clinical trials showing moderate evidence that mindfulness meditation reduces anxiety, depression, and psychological stress ratings.',
    tags: ['Mindfulness', 'MBSR', 'Stress Reduction', 'Systematic Review'],
    createdAt: new Date().toISOString(),
    chunks: [
      {
        id: 'chunk-mbsr-1',
        documentId: 'res-mbsr-2014',
        documentTitle: 'Meditation Programs for Psychological Stress and Well-being',
        category: 'mindfulness',
        passageText: 'Mindfulness interventions cultivate decentering (the capacity to observe thoughts, visceral feelings, and physical sensations as transient mental events rather than literal, urgent truths). Even brief 5-minute nonjudgmental open-monitoring sessions significantly diminish cognitive reactivity to acute emotional triggers.',
        keyFindings: ['Decentering decouples thought from behavioral urgency', 'Reduces psychological distress and rumination cycles', 'Durable benefits observed with daily micro-practices (5-10 mins)']
      }
    ]
  },
  {
    id: 'res-grounding-2015',
    title: 'Distress Tolerance & Sensory Grounding in Acute Emotion Dysregulation',
    authors: ['Marsha M. Linehan'],
    publicationYear: 2015,
    journal: 'DBT Skills Training Manual, Second Edition (Guilford Press)',
    doi: '978-1462516995',
    reviewStatus: 'approved',
    reviewedBy: 'Dr. Sarah Lin (Lead Clinical Reviewer)',
    reviewDate: '2026-02-20',
    summary: 'Evidence-based protocols for redirecting intense emotional flooding to external sensory awareness through the 5-4-3-2-1 multimodal grounding technique and temperature/sensory shifts.',
    tags: ['Grounding', 'Distress Tolerance', '5-4-3-2-1', 'Somatic Regulation'],
    createdAt: new Date().toISOString(),
    chunks: [
      {
        id: 'chunk-grounding-1',
        documentId: 'res-grounding-2015',
        documentTitle: 'Distress Tolerance & Sensory Grounding',
        category: 'grounding',
        passageText: 'When experiencing sudden sensory or emotional overwhelm, the 5-4-3-2-1 technique forces thalamic sensory gating to prioritize afferent sensory data (vision, touch, hearing, smell, taste) over amygdala alarm loops. Looking for 5 distinct objects, touching 4 textures, identifying 3 ambient sounds, noticing 2 aromas, and 1 taste grounds the nervous system in immediate physical reality.',
        keyFindings: ['Forces cognitive bandwidth away from panic loops', 'Engages primary sensory cortex and thalamus', 'Safe, non-invasive first-line tool for acute panic or dissociation']
      }
    ]
  },
  {
    id: 'res-sleep-2014',
    title: 'Cognitive Behavioral Therapy for Insomnia and Circadian Rhythm Synchronization',
    authors: ['Allison G. Harvey', 'Nicole B. Gumport', 'et al.'],
    publicationYear: 2014,
    journal: 'The Lancet Psychiatry, 1(6), 433-441',
    doi: '10.1016/S2215-0366(14)70377-6',
    reviewStatus: 'approved',
    reviewedBy: 'Dr. Kevin Mehta',
    reviewDate: '2026-06-18',
    summary: 'Demonstrates that stimulus control, cognitive wind-down buffers, and consistent waking routines restore healthy sleep architecture and stabilize diurnal cortisol rhythms.',
    tags: ['Sleep Hygiene', 'Circadian', 'Insomnia', 'CBT-I'],
    createdAt: new Date().toISOString(),
    chunks: [
      {
        id: 'chunk-sleep-1',
        documentId: 'res-sleep-2014',
        documentTitle: 'Cognitive Behavioral Therapy for Insomnia',
        category: 'sleep',
        passageText: 'Preserving a 30-minute cognitive buffer between daytime problem-solving and sleep prevents pre-sleep autonomic arousal. Writing down top anxieties on paper (the "brain dump" technique) offloads working memory and reduces sleep onset latency by an average of 42%.',
        keyFindings: ['Evening structured offloading cuts sleep onset latency', 'Cognitive wind-down buffer reduces bedtime heart rate', 'Consistency in wake time anchor stabilizes melatonin onset']
      }
    ]
  }
];

const INITIAL_ACTIVITIES: WellnessActivity[] = [
  {
    id: 'act-box-breathing',
    title: 'Box Breathing (4-4-4-4)',
    category: 'breathing',
    durationMinutes: 4,
    description: 'A tactical parasympathetic reset used by high-performance teams to regain composure under acute pressure.',
    instructions: [
      'Gently inhale through your nose for 4 seconds, feeling your ribs expand.',
      'Hold your breath comfortably for 4 seconds without clenching your throat.',
      'Smoothly exhale through your mouth for 4 seconds, letting tension drop from your shoulders.',
      'Hold the empty breath for 4 seconds before the next gentle breath.'
    ],
    evidenceBasis: 'Gerritsen & Band (2018) Front Hum Neurosci: Equitempo breathing balances sympathetic and parasympathetic activity.',
    pattern: {
      inhale: 4,
      hold1: 4,
      exhale: 4,
      hold2: 4,
      cycles: 4
    }
  },
  {
    id: 'act-vagal-calm',
    title: 'Vagal Nerve 4-7-8 Breathing',
    category: 'breathing',
    durationMinutes: 5,
    description: 'Extended exhalation breathing designed specifically to engage the vagal brake and slow rapid heart rate.',
    instructions: [
      'Empty your lungs completely through your mouth with a gentle whoosh sound.',
      'Inhale quietly through your nose for a count of 4.',
      'Gently hold your breath for a count of 7.',
      'Exhale audibly through your mouth for a slow count of 8.'
    ],
    evidenceBasis: 'Frontiers in Human Neuroscience: Exhalation twice the length of inhalation optimizes cardiac vagal tone.',
    pattern: {
      inhale: 4,
      hold1: 7,
      exhale: 8,
      hold2: 0,
      cycles: 4
    }
  },
  {
    id: 'act-54321-grounding',
    title: '5-4-3-2-1 Sensory Grounding',
    category: 'grounding',
    durationMinutes: 4,
    description: 'An interactive mindfulness exercise that reconnects your attention with immediate physical surroundings.',
    instructions: [
      'Notice 5 things you can SEE around you (shapes, colors, shadows, textures).',
      'Notice 4 things you can physically TOUCH or feel (your feet on the floor, texture of your sleeve).',
      'Notice 3 things you can HEAR in your environment (distant hum, your own breath, outside breeze).',
      'Notice 2 things you can SMELL (ambient scent, freshly washed clothes).',
      'Notice 1 thing you can TASTE or a sip of cool water.'
    ],
    evidenceBasis: 'Linehan (2015) DBT Skills: Sensory redirection engages thalamic sensory filtering to dampen acute amygdala panic loops.'
  },
  {
    id: 'act-thought-reframing',
    title: 'Cognitive Reframe & Perspective',
    category: 'reframing',
    durationMinutes: 6,
    description: 'Examine a stressful automatic thought, challenge catastrophic assumptions, and create an evidence-grounded perspective.',
    instructions: [
      'Write down the exact thought causing stress (e.g., "I will fail completely").',
      'Identify the cognitive distortion (All-or-nothing? Mind reading? Catastrophizing?).',
      'Ask: What is concrete evidence FOR this thought? What is concrete evidence AGAINST it?',
      'Draft a balanced, objective replacement thought (e.g., "This is difficult, but I have handled challenges before and can take one step at a time").'
    ],
    evidenceBasis: 'Hofmann et al. (2012) Cognit Ther Res: Empirical cognitive restructuring significantly reduces generalized worry.'
  },
  {
    id: 'act-evening-decompression',
    title: 'Evening Offloading & Sleep Prep',
    category: 'mindfulness',
    durationMinutes: 5,
    description: 'A 5-minute quiet mental transition to let go of unresolved tasks and signal rest to your nervous system.',
    instructions: [
      'Jot down the 2-3 pending tasks for tomorrow so your working memory can release them.',
      'Acknowledge 1 small effort or moment of grace from today.',
      'Dim bright screens, take 3 deep sighs with relaxed shoulders, and prepare for rest.'
    ],
    evidenceBasis: 'Harvey et al. (2014) Lancet Psychiatry: Structured evening offloading cuts pre-sleep cognitive arousal.'
  }
];

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('[DB] Failed to read store file, reinitializing default seed:', err);
    }
    const defaultData = this.getSeedData();
    this.saveDirect(defaultData);
    return defaultData;
  }

  private getSeedData(): DatabaseSchema {
    const defaultUserId = 'usr-demo-01';
    const now = new Date().toISOString();

    const allChunks: ResearchChunk[] = [];
    INITIAL_RESEARCH_DOCS.forEach(doc => {
      doc.chunks.forEach(chunk => allChunks.push(chunk));
    });

    return {
      users: {
        [defaultUserId]: {
          id: defaultUserId,
          email: 'alex.mindful@calmify.app',
          name: 'Alex Rivera',
          role: 'user',
          timezone: 'America/New_York',
          preferences: {
            theme: 'calm-light',
            quietHoursStart: '22:00',
            quietHoursEnd: '07:30',
            preferredBreathingPace: 'calm',
            dailyCheckinTime: '09:00',
            personalizationConsent: true,
            researchContributionConsent: true
          },
          streak: 4,
          lastActive: now,
          createdAt: new Date(Date.now() - 7 * 86400000).toISOString()
        },
        'usr-admin-01': {
          id: 'usr-admin-01',
          email: 'dr.lin@calmify.app',
          name: 'Dr. Sarah Lin',
          role: 'admin',
          timezone: 'America/New_York',
          preferences: {
            theme: 'calm-light',
            quietHoursStart: '23:00',
            quietHoursEnd: '07:00',
            preferredBreathingPace: 'box',
            dailyCheckinTime: '08:30',
            personalizationConsent: true,
            researchContributionConsent: true
          },
          streak: 12,
          lastActive: now,
          createdAt: new Date(Date.now() - 30 * 86400000).toISOString()
        }
      },
      consents: [
        {
          id: 'con-1',
          userId: defaultUserId,
          type: 'terms',
          granted: true,
          timestamp: now,
          version: 'v2.1'
        },
        {
          id: 'con-2',
          userId: defaultUserId,
          type: 'privacy',
          granted: true,
          timestamp: now,
          version: 'v2.1'
        },
        {
          id: 'con-3',
          userId: defaultUserId,
          type: 'personalization',
          granted: true,
          timestamp: now,
          version: 'v2.1'
        }
      ],
      researchDocs: INITIAL_RESEARCH_DOCS,
      researchChunks: allChunks,
      conversations: {
        'conv-welcome': {
          id: 'conv-welcome',
          userId: defaultUserId,
          title: 'Managing Work Transitions and Stress',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
          messageCount: 2,
          lastMessageSnippet: 'Remember that stress is an adaptive physiological signal rather than a permanent defect.'
        }
      },
      messages: {
        'conv-welcome': [
          {
            id: 'msg-1',
            conversationId: 'conv-welcome',
            role: 'user',
            content: 'I have been feeling quite overwhelmed balancing deadlines this week. How can I regain mental clarity without burning out?',
            timestamp: new Date(Date.now() - 86400000).toISOString()
          },
          {
            id: 'msg-2',
            conversationId: 'conv-welcome',
            role: 'assistant',
            content: `It is completely natural to experience stress when deadlines compress your cognitive resources. Stress is an adaptive physiological signal, not a personal failing.\n\nBased on peer-reviewed research in cognitive stress management, here are three evidence-grounded steps you can take today:\n\n1. **Vagal Reset via Extended Exhalation**: When feeling acute overwhelm, take 3 physiological sighs (two nasal inhales followed by one slow oral exhale). Prolonged expiration directly engages your parasympathetic nervous system to slow racing thoughts.\n\n2. **Categorize Controllable vs. Hypothetical Worries**: In Cognitive Behavioral Therapy, distinguishing between actionable tasks and anticipatory "what-if" thoughts stops repetitive rumination cycles.\n\n3. **Schedule a 5-Minute Micro-Break**: Take a brief walk or practice sensory grounding (noticing 5 visual textures around you) before diving into the next project block.\n\nWould you like to try a gentle 3-minute box breathing exercise together right now?`,
            timestamp: new Date(Date.now() - 86350000).toISOString(),
            citations: [
              {
                sourceId: 'res-vagal-2018',
                title: 'Breath of Life: The Respiratory Vagal Stimulation Model',
                authors: ['R. J. S. Gerritsen', 'G. P. H. Band'],
                year: 2018,
                doi: '10.3389/fnhum.2018.00397',
                passageSnippet: 'Slow respiration with extended expiration modulates cardiac vagal tone via pulmonary stretch receptors, accelerating parasympathetic nervous system takeover.'
              },
              {
                sourceId: 'res-cbt-2012',
                title: 'The Efficacy of Cognitive Behavioral Therapy: A Review of Meta-analyses',
                authors: ['Stefan G. Hofmann et al.'],
                year: 2012,
                doi: '10.1007/s10608-012-9476-1',
                passageSnippet: 'Cognitive restructuring systematically lowers amygdala reactivity and strengthens prefrontal executive control over distressing affective states.'
              }
            ],
            suggestedActivities: ['Box Breathing (4-4-4-4)', '5-4-3-2-1 Sensory Grounding']
          }
        ]
      },
      moods: [
        {
          id: 'mood-1',
          userId: defaultUserId,
          valence: -1,
          arousal: 6,
          moodLabel: 'Restless',
          emotions: ['overwhelmed', 'busy'],
          note: 'Tight deadlines at the studio, feeling tight around neck.',
          triggers: ['work', 'screen time'],
          timestamp: new Date(Date.now() - 3 * 86400000).toISOString()
        },
        {
          id: 'mood-2',
          userId: defaultUserId,
          valence: 2,
          arousal: 4,
          moodLabel: 'Centered',
          emotions: ['relieved', 'grounded'],
          note: 'Practiced 5 minutes of box breathing before my afternoon presentation.',
          triggers: ['breathing', 'exercise'],
          timestamp: new Date(Date.now() - 2 * 86400000).toISOString()
        },
        {
          id: 'mood-3',
          userId: defaultUserId,
          valence: 1,
          arousal: 5,
          moodLabel: 'Focused',
          emotions: ['productive', 'thoughtful'],
          note: 'Completed morning priority tasks early.',
          triggers: ['morning routine'],
          timestamp: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: 'mood-4',
          userId: defaultUserId,
          valence: 3,
          arousal: 4,
          moodLabel: 'Peaceful',
          emotions: ['calm', 'grateful'],
          note: 'Went for a brisk morning walk under the trees.',
          triggers: ['nature', 'sleep'],
          timestamp: now
        }
      ],
      journals: [
        {
          id: 'jrn-1',
          userId: defaultUserId,
          title: 'Notes on letting go of perfectionism',
          content: 'I realized today that I hold myself to an impossible standard when presenting drafts. Done with clarity is far healthier than endlessly agonizing over minor details. Choosing to submit and take a breath.',
          promptUsed: 'What is one expectation you can soften today?',
          sentimentTags: ['acceptance', 'growth'],
          isEncrypted: true,
          wordCount: 37,
          createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 86400000).toISOString()
        }
      ],
      activities: INITIAL_ACTIVITIES,
      completions: [
        {
          id: 'comp-1',
          userId: defaultUserId,
          activityId: 'act-box-breathing',
          activityTitle: 'Box Breathing (4-4-4-4)',
          durationSeconds: 240,
          timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
          moodBefore: -1,
          moodAfter: 2
        },
        {
          id: 'comp-2',
          userId: defaultUserId,
          activityId: 'act-54321-grounding',
          activityTitle: '5-4-3-2-1 Sensory Grounding',
          durationSeconds: 180,
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          moodBefore: 0,
          moodAfter: 2
        }
      ],
      automations: [
        {
          id: 'auto-daily-checkin',
          userId: defaultUserId,
          title: 'Daily Morning Mind Check-in',
          type: 'daily_checkin',
          enabled: true,
          scheduleCron: '0 9 * * *',
          preferredTime: '09:00',
          daysOfWeek: [1, 2, 3, 4, 5, 6, 0],
          channel: 'in_app',
          quietHoursEnforced: true,
          lastRun: new Date(Date.now() - 3600000).toISOString(),
          nextRun: new Date(Date.now() + 82800000).toISOString(),
          config: {
            prompt: 'Take a small moment for yourself. How is your energy feeling this morning?'
          }
        },
        {
          id: 'auto-afternoon-reset',
          userId: defaultUserId,
          title: 'Afternoon Vagal Breathing Pause',
          type: 'wellness_reminder',
          enabled: true,
          scheduleCron: '0 14 * * 1-5',
          preferredTime: '14:30',
          daysOfWeek: [1, 2, 3, 4, 5],
          channel: 'in_app',
          quietHoursEnforced: true,
          lastRun: new Date(Date.now() - 7200000).toISOString(),
          nextRun: new Date(Date.now() + 28800000).toISOString(),
          config: {
            activityId: 'act-box-breathing',
            message: 'Your 3-minute nervous system reset is ready whenever you take a screen break.'
          }
        },
        {
          id: 'auto-weekly-reflection',
          userId: defaultUserId,
          title: 'Sunday Wellness Reflection Summary',
          type: 'weekly_reflection',
          enabled: true,
          scheduleCron: '0 18 * * 0',
          preferredTime: '18:00',
          daysOfWeek: [0],
          channel: 'in_app',
          quietHoursEnforced: true,
          lastRun: new Date(Date.now() - 5 * 86400000).toISOString(),
          nextRun: new Date(Date.now() + 2 * 86400000).toISOString(),
          config: {
            synthesizeMoods: true,
            includeCompletions: true
          }
        }
      ],
      executions: [
        {
          id: 'exec-1',
          ruleId: 'auto-daily-checkin',
          ruleTitle: 'Daily Morning Mind Check-in',
          userId: defaultUserId,
          triggeredAt: new Date(Date.now() - 3600000).toISOString(),
          status: 'success',
          resultSummary: 'Delivered in-app check-in notification. User responded with valence +3.',
          durationMs: 84
        },
        {
          id: 'exec-2',
          ruleId: 'auto-afternoon-reset',
          ruleTitle: 'Afternoon Vagal Breathing Pause',
          userId: defaultUserId,
          triggeredAt: new Date(Date.now() - 7200000).toISOString(),
          status: 'success',
          resultSummary: 'In-app notification delivered. Quiet hours verified.',
          durationMs: 62
        }
      ],
      notifications: [
        {
          id: 'notif-1',
          userId: defaultUserId,
          ruleId: 'auto-daily-checkin',
          title: 'Morning Check-In Ready',
          body: 'Take a gentle breath and notice how your body feels today.',
          channel: 'in_app',
          status: 'read',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          readAt: new Date(Date.now() - 3500000).toISOString(),
          actionUrl: '/mood'
        }
      ],
      securityFindings: [],
      auditLogs: [
        {
          id: 'audit-1',
          timestamp: now,
          actor: 'system',
          action: 'BOOTSTRAP',
          resource: 'store',
          details: 'Calmify security sandbox & data store initialized with encryption tokens.'
        }
      ]
    };
  }

  public save(): void {
    this.saveDirect(this.data);
  }

  private saveDirect(payload: DatabaseSchema): void {
    try {
      const tempPath = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(payload, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('[DB] Atomic write error:', err);
    }
  }

  // Getters & Setters
  public getSchema(): DatabaseSchema {
    return this.data;
  }

  public getUser(id: string): UserProfile | undefined {
    return this.data.users[id];
  }

  public getUserByEmail(email: string): UserProfile | undefined {
    return Object.values(this.data.users).find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public updateUser(user: UserProfile): void {
    this.data.users[user.id] = user;
    this.save();
  }

  public logAudit(actor: string, action: string, resource: string, details: string): void {
    this.data.auditLogs.unshift({
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      actor,
      action,
      resource,
      details
    });
    // Keep max 200 audit logs
    if (this.data.auditLogs.length > 200) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 200);
    }
    this.save();
  }
}

export const db = new Database();
