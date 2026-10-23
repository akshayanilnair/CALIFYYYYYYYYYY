/**
 * Calmify Wellness Activities Center
 * Features:
 * - Interactive Animated Breathing Guide with Web Audio Chimes
 * - Tactile 5-4-3-2-1 Sensory Grounding Checklist
 * - Cognitive Reframing 4-Step Worksheet
 * - Evening Offloading Tool
 */

import React, { useState, useEffect } from 'react';
import { WellnessActivity, UserProfile } from '../../server/types.js';
import { sound } from '../utils/audio.js';
import {
  Activity,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  CheckCircle,
  Sparkles,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';

interface ActivitiesViewProps {
  user: UserProfile | null;
  activities: WellnessActivity[];
  selectedActivity?: WellnessActivity | null;
  onCompleteActivity: (id: string, data: { durationSeconds: number; moodBefore?: number; moodAfter?: number }) => Promise<void>;
}

export const ActivitiesView: React.FC<ActivitiesViewProps> = ({
  user,
  activities,
  selectedActivity,
  onCompleteActivity
}) => {
  const [activeTab, setActiveTab] = useState<'breathing' | 'grounding' | 'reframing' | 'all'>('breathing');

  // Breathing State
  const [breathingPace, setBreathingPace] = useState<'box' | '4-7-8' | 'calm'>('box');
  const [isBreathingActive, setIsBreathingActive] = useState<boolean>(false);
  const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Hold Post-Exhale'>('Inhale');
  const [phaseProgress, setPhaseProgress] = useState<number>(0);
  const [cycleCount, setCycleCount] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [moodBefore, setMoodBefore] = useState<number>(0);
  const [moodAfter, setMoodAfter] = useState<number>(2);
  const [showCompletionModal, setShowCompletionModal] = useState<boolean>(false);

  // Grounding State
  const [groundingSteps, setGroundingSteps] = useState<{ [key: number]: boolean }>({});

  // Reframing State
  const [autoThought, setAutoThought] = useState<string>('');
  const [distortion, setDistortion] = useState<string>('Catastrophizing');
  const [evidenceAgainst, setEvidenceAgainst] = useState<string>('');
  const [reframeThought, setReframeThought] = useState<string>('');
  const [reframingDone, setReframingDone] = useState<boolean>(false);

  // Breathing timings config
  const paceConfigs = {
    box: { name: 'Box Breathing (4-4-4-4)', inhale: 4, hold1: 4, exhale: 4, hold2: 4 },
    '4-7-8': { name: 'Vagal Nerve (4-7-8)', inhale: 4, hold1: 7, exhale: 8, hold2: 0 },
    calm: { name: 'Gentle Calm (4-6)', inhale: 4, hold1: 0, exhale: 6, hold2: 0 }
  };

  const currentPace = paceConfigs[breathingPace];

  // Breathing Engine Loop
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isBreathingActive) {
      const stepMs = 100;
      let curPhaseTime = 0;
      let currentPhaseIdx = 0; // 0: inhale, 1: hold1, 2: exhale, 3: hold2

      // Play initial chime
      if (!isMuted) sound.playBreathTick('inhale');

      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + stepMs / 1000);
        curPhaseTime += stepMs / 1000;

        let phaseDuration = currentPace.inhale;
        let phaseName: typeof phase = 'Inhale';

        if (currentPhaseIdx === 0) {
          phaseDuration = currentPace.inhale;
          phaseName = 'Inhale';
        } else if (currentPhaseIdx === 1) {
          phaseDuration = currentPace.hold1;
          phaseName = 'Hold';
        } else if (currentPhaseIdx === 2) {
          phaseDuration = currentPace.exhale;
          phaseName = 'Exhale';
        } else if (currentPhaseIdx === 3) {
          phaseDuration = currentPace.hold2;
          phaseName = 'Hold Post-Exhale';
        }

        const pct = Math.min(100, (curPhaseTime / phaseDuration) * 100);
        setPhaseProgress(pct);
        setPhase(phaseName);

        if (curPhaseTime >= phaseDuration) {
          curPhaseTime = 0;
          let nextIdx = currentPhaseIdx + 1;

          // Skip zero duration holds
          if (nextIdx === 1 && currentPace.hold1 === 0) nextIdx = 2;
          if (nextIdx === 3 && currentPace.hold2 === 0) nextIdx = 4;

          if (nextIdx >= 4) {
            nextIdx = 0;
            setCycleCount(c => c + 1);
          }

          currentPhaseIdx = nextIdx;
          const nextName = nextIdx === 0 ? 'inhale' : nextIdx === 2 ? 'exhale' : 'hold';
          if (!isMuted) sound.playBreathTick(nextName as any);
        }
      }, stepMs);
    }

    return () => clearInterval(interval);
  }, [isBreathingActive, breathingPace, isMuted]);

  const handleStopBreathing = () => {
    setIsBreathingActive(false);
    if (elapsedSeconds > 30) {
      setShowCompletionModal(true);
    }
  };

  const handleFinishCompletion = async () => {
    await onCompleteActivity('act-box-breathing', {
      durationSeconds: Math.round(elapsedSeconds),
      moodBefore,
      moodAfter
    });
    setShowCompletionModal(false);
    setElapsedSeconds(0);
    setCycleCount(0);
    setPhaseProgress(0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Wellness Practice Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Research-grounded somatic regulation, breathwork, and cognitive grounding tools.
          </p>
        </div>

        {/* Practice Mode Selector */}
        <div className="flex items-center p-1 bg-stone-100 rounded-xl border border-stone-200/80 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('breathing')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'breathing' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
            }`}
          >
            Breathing Pacer
          </button>
          <button
            onClick={() => setActiveTab('grounding')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'grounding' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
            }`}
          >
            5-4-3-2-1 Grounding
          </button>
          <button
            onClick={() => setActiveTab('reframing')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'reframing' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
            }`}
          >
            Cognitive Reframe
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'all' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
            }`}
          >
            All Protocols
          </button>
        </div>
      </div>

      {/* MODE 1: ANIMATED BREATHING GUIDE */}
      {activeTab === 'breathing' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Animated Sphere Container (7 cols) */}
          <div className="lg:col-span-7 bg-gradient-to-b from-stone-900 to-indigo-950 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col items-center justify-between min-h-[460px] relative overflow-hidden">
            
            {/* Top Bar inside breathing studio */}
            <div className="w-full flex items-center justify-between text-xs text-slate-300 z-10 font-mono-tabular">
              <span className="font-semibold">{currentPace.name}</span>
              <div className="flex items-center gap-3">
                <span>Cycles: {cycleCount}</span>
                <span>Time: {Math.floor(elapsedSeconds / 60)}:{(Math.floor(elapsedSeconds % 60)).toString().padStart(2, '0')}</span>
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-1 text-slate-300 hover:text-white"
                  title={isMuted ? 'Unmute bowl chime' : 'Mute audio'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Pulsing Breathing Sphere */}
            <div className="relative my-8 flex items-center justify-center">
              {/* Expanding outer aura */}
              <div
                className="w-56 h-56 rounded-full bg-indigo-500/20 blur-xl transition-all duration-700 pointer-events-none"
                style={{
                  transform: `scale(${
                    phase === 'Inhale'
                      ? 1 + (phaseProgress / 100) * 0.4
                      : phase === 'Hold' || phase === 'Hold Post-Exhale'
                      ? 1.4
                      : 1.4 - (phaseProgress / 100) * 0.4
                  })`
                }}
              />

              {/* Main Sphere Body */}
              <div
                className="w-44 h-44 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-300 shadow-2xl flex flex-col items-center justify-center text-center p-4 transition-all duration-300 z-10"
                style={{
                  transform: `scale(${
                    phase === 'Inhale'
                      ? 0.85 + (phaseProgress / 100) * 0.35
                      : phase === 'Hold' || phase === 'Hold Post-Exhale'
                      ? 1.2
                      : 1.2 - (phaseProgress / 100) * 0.35
                  })`
                }}
              >
                <span className="text-xl sm:text-2xl font-bold tracking-tight text-white drop-shadow-sm">
                  {isBreathingActive ? phase : 'Ready'}
                </span>
                {isBreathingActive && (
                  <span className="text-xs font-medium text-indigo-100 mt-1 font-mono-tabular">
                    {Math.round(phaseProgress)}%
                  </span>
                )}
              </div>
            </div>

            {/* Instruction Cue & Controls */}
            <div className="w-full flex flex-col items-center gap-4 z-10">
              <p className="text-xs text-slate-300 text-center max-w-sm">
                {isBreathingActive
                  ? phase === 'Inhale'
                    ? 'Inhale gently through your nose, expanding your lower ribs.'
                    : phase === 'Exhale'
                    ? 'Slowly release through your mouth, letting your shoulders drop.'
                    : 'Gently suspend breath without straining.'
                  : 'Press Start to begin audio-guided respiratory regulation.'}
              </p>

              <div className="flex items-center gap-3">
                {!isBreathingActive ? (
                  <button
                    onClick={() => setIsBreathingActive(true)}
                    className="px-6 py-2.5 text-xs sm:text-sm font-semibold text-slate-950 bg-white hover:bg-stone-100 rounded-xl transition-colors shadow-md flex items-center gap-2"
                  >
                    <Play className="w-4 h-4 text-indigo-600 fill-current" />
                    <span>Begin Session</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setIsBreathingActive(false)}
                      className="px-4 py-2 text-xs font-semibold text-white bg-white/20 hover:bg-white/30 rounded-xl transition-colors flex items-center gap-1.5"
                    >
                      <Pause className="w-4 h-4" />
                      <span>Pause</span>
                    </button>
                    <button
                      onClick={handleStopBreathing}
                      className="px-4 py-2 text-xs font-semibold text-rose-100 bg-rose-600/80 hover:bg-rose-600 rounded-xl transition-colors"
                    >
                      Complete Session
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Configuration & Scientific Rationale (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                Pacing Protocol
              </h3>

              <div className="space-y-2">
                {[
                  { id: 'box', name: 'Box Breathing (4-4-4-4)', desc: 'Equitempo tactical calm used for acute pressure reset.' },
                  { id: '4-7-8', name: 'Vagal Nerve (4-7-8)', desc: 'Prolonged exhalation directly engages parasympathetic brake.' },
                  { id: 'calm', name: 'Gentle Calm (4-6)', desc: 'Subtle 1:1.5 ratio for everyday desk decompression.' }
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setBreathingPace(p.id as any);
                      setIsBreathingActive(false);
                    }}
                    className={`w-full p-3.5 rounded-xl border text-left transition-colors flex flex-col gap-1 ${
                      breathingPace === p.id
                        ? 'border-indigo-600 bg-indigo-50/70 shadow-2xs'
                        : 'border-stone-200 hover:border-stone-300 bg-stone-50/40'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                      <span>{p.name}</span>
                      {breathingPace === p.id && <Check className="w-4 h-4 text-indigo-600" />}
                    </div>
                    <div className="text-[11px] text-slate-500">{p.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Scientific Evidence Card */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Empirical Evidence Basis</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed italic">
                "Gerritsen & Band (2018) Frontiers in Human Neuroscience: Respiration with prolonged expiration stimulates pulmonary stretch receptors, accelerating vagal acetylcholine release and decelerating sympathetic heart rate within 90 seconds."
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: 5-4-3-2-1 SENSORY GROUNDING */}
      {activeTab === 'grounding' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-2xs space-y-6 max-w-3xl mx-auto">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              5-4-3-2-1 Somatosensory Grounding Protocol
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Engage thalamic sensory gating to redirect acute anxiety away from panic loops into physical reality.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { count: 5, sense: 'SEE', prompt: 'Acknowledge 5 distinct objects you see around you (colors, patterns, light reflections).' },
              { count: 4, sense: 'TOUCH', prompt: 'Touch 4 physical textures (your sleeve, the chair edge, cool phone glass, your hair).' },
              { count: 3, sense: 'HEAR', prompt: 'Notice 3 subtle ambient sounds (air circulation, outdoor breeze, your breath).' },
              { count: 2, sense: 'SMELL', prompt: 'Notice 2 aromas (fresh air, coffee, skin scent, paper).' },
              { count: 1, sense: 'TASTE', prompt: 'Notice 1 taste or take a slow sip of cool water.' }
            ].map(step => {
              const isChecked = !!groundingSteps[step.count];
              return (
                <div
                  key={step.count}
                  onClick={() =>
                    setGroundingSteps(prev => ({ ...prev, [step.count]: !prev[step.count] }))
                  }
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                    isChecked
                      ? 'border-emerald-300 bg-emerald-50/50'
                      : 'border-stone-200 hover:border-indigo-200 bg-stone-50/40'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold font-mono-tabular transition-colors ${
                      isChecked
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white border border-stone-300 text-slate-700'
                    }`}
                  >
                    {isChecked ? <Check className="w-3.5 h-3.5" /> : step.count}
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-900 tracking-wide uppercase">
                      {step.count} Things You {step.sense}
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed">{step.prompt}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {Object.values(groundingSteps).filter(Boolean).length} of 5 steps completed
            </span>
            <button
              onClick={() => {
                onCompleteActivity('act-54321-grounding', {
                  durationSeconds: 180,
                  moodBefore: 0,
                  moodAfter: 2
                });
                setGroundingSteps({});
                alert('Grounding exercise logged! Great work centering your attention.');
              }}
              disabled={Object.values(groundingSteps).filter(Boolean).length < 5}
              className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-40 rounded-xl transition-colors shadow-xs"
            >
              Finish & Record Exercise
            </button>
          </div>
        </div>
      )}

      {/* MODE 3: COGNITIVE REFRAME WORKSHEET */}
      {activeTab === 'reframing' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-2xs space-y-6 max-w-3xl mx-auto">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Cognitive Restructuring & Reframe Protocol
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Derived from CBT meta-analyses (Hofmann et al. 2012) to test automatic negative distortions against objective evidence.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Step 1: Automatic Distressing Thought
              </label>
              <input
                type="text"
                value={autoThought}
                onChange={e => setAutoThought(e.target.value)}
                placeholder="e.g., 'If I make one mistake in this meeting, I will be seen as incompetent'..."
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-stone-200 bg-stone-50/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Step 2: Identify the Cognitive Distortion
              </label>
              <select
                value={distortion}
                onChange={e => setDistortion(e.target.value)}
                className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-stone-200 bg-white"
              >
                <option value="Catastrophizing">Catastrophizing (Assuming the absolute worst outcome)</option>
                <option value="All-or-Nothing">All-or-Nothing Thinking (Black and white evaluation)</option>
                <option value="Mind-Reading">Mind-Reading (Assuming you know what others think)</option>
                <option value="Emotional-Reasoning">Emotional Reasoning ("I feel afraid, therefore I am in danger")</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Step 3: Objective Evidence Against this Thought
              </label>
              <textarea
                value={evidenceAgainst}
                onChange={e => setEvidenceAgainst(e.target.value)}
                rows={2}
                placeholder="What facts or past experiences contradict this thought? (e.g., 'Colleagues make minor slips and move on without issue')..."
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-stone-200 bg-stone-50/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Step 4: Balanced, Grounded Perspective
              </label>
              <textarea
                value={reframeThought}
                onChange={e => setReframeThought(e.target.value)}
                rows={2}
                placeholder="e.g., 'This meeting is important, but a minor slip does not define my capability. I can handle unexpected questions one at a time.'..."
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-stone-200 bg-stone-50/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => {
                onCompleteActivity('act-thought-reframing', {
                  durationSeconds: 360,
                  moodBefore: -1,
                  moodAfter: 2
                });
                alert('Reframing exercise saved to your progress history!');
                setAutoThought('');
                setEvidenceAgainst('');
                setReframeThought('');
              }}
              disabled={!autoThought || !reframeThought}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl transition-colors shadow-xs"
            >
              Complete Reframe & Save
            </button>
          </div>
        </div>
      )}

      {/* MODE 4: ALL PROTOCOLS DIRECTORY */}
      {activeTab === 'all' && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activities.map(act => (
            <div
              key={act.id}
              className="p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs hover:border-indigo-200 transition-colors flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-indigo-700 uppercase tracking-wider text-[10px]">
                    {act.category}
                  </span>
                  <span className="text-slate-500 font-mono-tabular">{act.durationMinutes} min</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">{act.title}</h3>
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {act.description}
                </p>
                <div className="text-[11px] text-slate-500 italic bg-stone-50 p-2 rounded-lg">
                  {act.evidenceBasis}
                </div>
              </div>

              <button
                onClick={() => {
                  if (act.category === 'breathing') setActiveTab('breathing');
                  else if (act.category === 'grounding') setActiveTab('grounding');
                  else setActiveTab('reframing');
                }}
                className="w-full py-2 text-xs font-semibold text-slate-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Launch Exercise</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200 space-y-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Session Complete</h3>
              <p className="text-xs text-slate-500">
                You practiced {Math.round(elapsedSeconds)} seconds of guided respiration.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-xs font-semibold text-slate-700 block">
                How do you feel after this session? (-5 to +5)
              </label>
              <input
                type="range"
                min="-5"
                max="5"
                step="1"
                value={moodAfter}
                onChange={e => setMoodAfter(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-xs font-mono-tabular text-slate-500">
                <span>Heavy</span>
                <span className="font-bold text-indigo-700">{moodAfter > 0 ? `+${moodAfter}` : moodAfter}</span>
                <span>Calm</span>
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <button
                onClick={handleFinishCompletion}
                className="w-full py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-xs"
              >
                Save Completion & Return
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
