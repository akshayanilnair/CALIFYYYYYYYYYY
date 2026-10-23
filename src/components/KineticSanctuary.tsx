/**
 * Calmify Kinetic Sanctuary
 * Moving, fluid, interactive animated centerpiece:
 * - Living Resonance Orb with 60fps organic expansion
 * - Interactive floating mood stones that shift ambient lighting & tempo
 * - Generative 432Hz ambient soundscape toggle with animated sound bars
 * - Real-time acoustic singing bowl feedback
 */

import React, { useState, useEffect } from 'react';
import { UserProfile, MoodEntry, WellnessActivity } from '../../server/types.js';
import { sound } from '../utils/audio.js';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Heart,
  Feather,
  BookOpen,
  Activity,
  Zap,
  ShieldAlert,
  Moon
} from 'lucide-react';

interface KineticSanctuaryProps {
  user: UserProfile | null;
  moodTheme: 'indigo' | 'sage' | 'amber' | 'slate' | 'teal';
  onSelectMoodTheme: (theme: 'indigo' | 'sage' | 'amber' | 'slate' | 'teal', label: string, valence: number) => void;
  onOpenCompanion: () => void;
  onOpenJournal: () => void;
  onOpenGrounding: () => void;
  onOpenAutomations: () => void;
  onOpenResearch: () => void;
  onOpenCrisis: () => void;
  onOpenLanding: () => void;
  onBreathingScaleChange: (scale: number) => void;
}

export const KineticSanctuary: React.FC<KineticSanctuaryProps> = ({
  user,
  moodTheme,
  onSelectMoodTheme,
  onOpenCompanion,
  onOpenJournal,
  onOpenGrounding,
  onOpenAutomations,
  onOpenResearch,
  onOpenCrisis,
  onOpenLanding,
  onBreathingScaleChange
}) => {
  // Breathing Engine State
  const [isActive, setIsActive] = useState<boolean>(true);
  const [breathingPattern, setBreathingPattern] = useState<'4-7-8' | 'box' | 'calm' | 'sigh'>('4-7-8');
  const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Sigh Exhale' | 'Rest'>('Inhale');
  const [phaseProgress, setPhaseProgress] = useState<number>(0);
  const [cyclesCompleted, setCyclesCompleted] = useState<number>(0);
  const [isSoundscapeOn, setIsSoundscapeOn] = useState<boolean>(false);
  const [isChimeMuted, setIsChimeMuted] = useState<boolean>(false);

  // Pattern timing configurations (in seconds)
  const patterns = {
    '4-7-8': {
      name: 'Vagal Nerve 4-7-8',
      desc: 'Prolonged exhalation stimulates vagal cholinergic pathways to decelerate racing thoughts.',
      inhale: 4,
      hold1: 7,
      exhale: 8,
      hold2: 0
    },
    box: {
      name: 'Box Breathing 4-4-4-4',
      desc: 'Equitempo diaphragmatic regulation for acute focus and emotional composure.',
      inhale: 4,
      hold1: 4,
      exhale: 4,
      hold2: 4
    },
    calm: {
      name: 'Gentle Flow 4-6',
      desc: 'Soft resting ratio for unhurried everyday decompression.',
      inhale: 4,
      hold1: 0,
      exhale: 6,
      hold2: 0
    },
    sigh: {
      name: 'Physiological Sigh',
      desc: 'Double nasal inhale followed by prolonged oral exhale to rapidly vent CO2.',
      inhale: 3,
      hold1: 1,
      exhale: 6,
      hold2: 0
    }
  };

  const currentPattern = patterns[breathingPattern];

  // Continuous breathing motion loop
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive) {
      const stepMs = 50;
      let phaseTime = 0;
      let phaseIndex = 0; // 0: inhale, 1: hold1, 2: exhale, 3: hold2

      if (!isChimeMuted) sound.playBreathTick('inhale');

      interval = setInterval(() => {
        phaseTime += stepMs / 1000;

        let duration = currentPattern.inhale;
        let currentPhaseName: typeof phase = 'Inhale';

        if (phaseIndex === 0) {
          duration = currentPattern.inhale;
          currentPhaseName = 'Inhale';
          const scale = 0.85 + (phaseTime / duration) * 0.45;
          onBreathingScaleChange(scale);
        } else if (phaseIndex === 1) {
          duration = currentPattern.hold1;
          currentPhaseName = 'Hold';
          onBreathingScaleChange(1.3);
        } else if (phaseIndex === 2) {
          duration = currentPattern.exhale;
          currentPhaseName = breathingPattern === 'sigh' ? 'Sigh Exhale' : 'Exhale';
          const scale = 1.3 - (phaseTime / duration) * 0.45;
          onBreathingScaleChange(scale);
        } else if (phaseIndex === 3) {
          duration = currentPattern.hold2;
          currentPhaseName = 'Rest';
          onBreathingScaleChange(0.85);
        }

        const pct = Math.min(100, (phaseTime / duration) * 100);
        setPhaseProgress(pct);
        setPhase(currentPhaseName);

        if (phaseTime >= duration) {
          phaseTime = 0;
          let nextIdx = phaseIndex + 1;

          // Skip 0-duration holds
          if (nextIdx === 1 && currentPattern.hold1 === 0) nextIdx = 2;
          if (nextIdx === 3 && currentPattern.hold2 === 0) nextIdx = 4;

          if (nextIdx >= 4) {
            nextIdx = 0;
            setCyclesCompleted(c => c + 1);
          }

          phaseIndex = nextIdx;
          const nextTickType = nextIdx === 0 ? 'inhale' : nextIdx === 2 ? 'exhale' : 'hold';
          if (!isChimeMuted) sound.playBreathTick(nextTickType as any);
        }
      }, stepMs);
    } else {
      onBreathingScaleChange(1.0);
    }

    return () => clearInterval(interval);
  }, [isActive, breathingPattern, isChimeMuted]);

  const handleToggleSoundscape = () => {
    const isPlaying = sound.toggleAmbience();
    setIsSoundscapeOn(isPlaying);
  };

  const moodStones = [
    {
      id: 'indigo',
      label: 'Deep Peace',
      valence: 3,
      glow: 'from-indigo-500/80 to-purple-600/80',
      border: 'border-indigo-400/50',
      pattern: '4-7-8' as const
    },
    {
      id: 'sage',
      label: 'Grounded Clarity',
      valence: 4,
      glow: 'from-emerald-500/80 to-teal-600/80',
      border: 'border-emerald-400/50',
      pattern: 'box' as const
    },
    {
      id: 'amber',
      label: 'Golden Warmth',
      valence: 5,
      glow: 'from-amber-500/80 to-orange-600/80',
      border: 'border-amber-400/50',
      pattern: 'calm' as const
    },
    {
      id: 'teal',
      label: 'Still Waters',
      valence: 2,
      glow: 'from-teal-500/80 to-cyan-600/80',
      border: 'border-teal-400/50',
      pattern: '4-7-8' as const
    },
    {
      id: 'slate',
      label: 'Storm Release',
      valence: 1,
      glow: 'from-slate-500/80 to-slate-700/80',
      border: 'border-slate-400/50',
      pattern: 'sigh' as const
    }
  ];

  return (
    <div className="relative z-10 min-h-screen flex flex-col justify-between text-white p-4 sm:p-8 select-none">
      
      {/* Top Atmospheric Header */}
      <header className="flex items-center justify-between gap-4 max-w-7xl mx-auto w-full">
        {/* Wordmark (Returns to Landing Page) */}
        <button
          onClick={onOpenLanding}
          className="flex items-center gap-3 text-left focus:outline-none group cursor-pointer"
          title="Return to Introduction / Landing"
        >
          <div className="w-9 h-9 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-lg shadow-black/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4 text-indigo-300" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white block leading-none">
              Calmify
            </span>
            <span className="text-[10px] tracking-widest text-white/60 block uppercase font-medium mt-1 group-hover:text-white transition-colors">
              Return to Home
            </span>
          </div>
        </button>

        {/* Ambient Drone Equalizer & Controls */}
        <div className="flex items-center gap-3">
          {/* Ambient Soundscape Toggle with live animated bars */}
          <button
            onClick={handleToggleSoundscape}
            className={`px-3.5 py-1.5 rounded-full border text-xs font-medium backdrop-blur-md transition-all flex items-center gap-2 ${
              isSoundscapeOn
                ? 'bg-indigo-500/30 border-indigo-400/60 text-white shadow-lg shadow-indigo-500/20'
                : 'bg-white/10 border-white/15 text-white/70 hover:bg-white/15 hover:text-white'
            }`}
            title="Toggle 432Hz ambient solfeggio drone and pink noise"
          >
            {isSoundscapeOn ? (
              <>
                <div className="flex items-end gap-0.5 h-3">
                  <span className="w-0.5 h-full bg-indigo-300 animate-pulse" />
                  <span className="w-0.5 h-2 bg-indigo-300 animate-pulse delay-75" />
                  <span className="w-0.5 h-3 bg-indigo-300 animate-pulse delay-150" />
                </div>
                <span>432Hz Ambience Playing</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5" />
                <span>Play Soundscape</span>
              </>
            )}
          </button>

          {/* 24/7 Crisis Access */}
          <button
            onClick={onOpenCrisis}
            className="px-3 py-1.5 text-xs font-semibold text-rose-300 bg-rose-950/40 border border-rose-500/30 rounded-full hover:bg-rose-900/50 backdrop-blur-md transition-all flex items-center gap-1.5"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">24/7 Crisis Support</span>
          </button>
        </div>
      </header>

      {/* Centerpiece: The Living Resonance Breathing Orb */}
      <main className="flex-1 flex flex-col items-center justify-center my-6 relative">
        
        {/* Pattern Switcher (Tabs) */}
        <div className="flex items-center gap-1 p-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 mb-8 text-xs z-20">
          {(['4-7-8', 'box', 'calm', 'sigh'] as const).map(p => (
            <button
              key={p}
              onClick={() => {
                setBreathingPattern(p);
                setPhaseProgress(0);
              }}
              className={`px-3 py-1 rounded-full transition-all text-xs font-medium ${
                breathingPattern === p
                  ? 'bg-white text-slate-900 shadow-md font-semibold'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              {p === '4-7-8' ? 'Vagal 4-7-8' : p === 'box' ? 'Box 4-4-4-4' : p === 'calm' ? 'Calm 4-6' : 'Physiological Sigh'}
            </button>
          ))}
        </div>

        {/* The Animated Sphere Core */}
        <div
          onClick={() => setIsActive(!isActive)}
          className="relative cursor-pointer group flex items-center justify-center select-none"
        >
          {/* Animated Multiple Radial Aura Rings */}
          <div
            className="absolute w-80 h-80 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-indigo-500/20 via-purple-500/10 to-transparent blur-2xl transition-transform duration-700 pointer-events-none"
            style={{
              transform: `scale(${
                phase === 'Inhale'
                  ? 1 + (phaseProgress / 100) * 0.4
                  : phase === 'Hold' || phase === 'Rest'
                  ? 1.4
                  : 1.4 - (phaseProgress / 100) * 0.4
              })`
            }}
          />

          {/* Rotating Constellation Ring */}
          <div
            className="absolute w-72 h-72 sm:w-84 sm:h-84 rounded-full border border-white/20 border-dashed animate-[spin_35s_linear_infinite] pointer-events-none"
            style={{
              transform: `scale(${
                phase === 'Inhale'
                  ? 0.9 + (phaseProgress / 100) * 0.3
                  : phase === 'Hold' || phase === 'Rest'
                  ? 1.2
                  : 1.2 - (phaseProgress / 100) * 0.3
              })`
            }}
          />

          {/* The Living Sphere */}
          <div
            className="w-56 h-56 sm:w-64 sm:h-64 rounded-full bg-gradient-to-tr from-white/30 via-indigo-400/50 to-violet-300/60 backdrop-blur-2xl border border-white/40 shadow-[0_0_80px_rgba(99,102,241,0.5)] flex flex-col items-center justify-center p-6 text-center transition-all duration-300 transform group-hover:scale-105 active:scale-95"
            style={{
              transform: `scale(${
                phase === 'Inhale'
                  ? 0.85 + (phaseProgress / 100) * 0.35
                  : phase === 'Hold' || phase === 'Rest'
                  ? 1.2
                  : 1.2 - (phaseProgress / 100) * 0.35
              })`
            }}
          >
            {/* Phase Name */}
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-md">
              {isActive ? phase : 'Paused'}
            </span>

            {/* Subtitle / Counter */}
            <span className="text-xs font-mono-tabular font-medium text-white/80 mt-1">
              {isActive ? `${Math.round(phaseProgress)}%` : 'Tap to Resume'}
            </span>

            {/* Cycle indicator */}
            <span className="text-[11px] font-medium text-indigo-100/70 mt-2">
              Cycle {cyclesCompleted}
            </span>
          </div>
        </div>

        {/* Dynamic Instructional Guidance */}
        <div className="text-center max-w-md mt-8 space-y-1 z-10 px-4">
          <p className="text-sm font-medium text-white/90">
            {phase === 'Inhale'
              ? 'Breathe in slowly through your nose, expanding your belly.'
              : phase === 'Hold'
              ? 'Suspend gently without tension in your jaw or shoulders.'
              : phase === 'Sigh Exhale'
              ? 'Release fully through your mouth with a soft natural sigh.'
              : phase === 'Exhale'
              ? 'Release unhurriedly through your mouth, letting gravity hold you.'
              : 'Rest quietly in empty stillness.'}
          </p>
          <p className="text-xs text-white/50 font-light">
            {currentPattern.desc}
          </p>
        </div>

      </main>

      {/* Bottom Area: Interactive Mood Ripple Stones & Kinetic Dock */}
      <footer className="space-y-6 max-w-7xl mx-auto w-full z-20">
        
        {/* Kinetic Mood Shift Stones */}
        <div className="flex flex-col items-center space-y-2">
          <span className="text-[10px] uppercase tracking-widest text-white/60 font-medium">
            Touch an energy resonance to shift the environment
          </span>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {moodStones.map(stone => {
              const isSelected = moodTheme === stone.id;
              return (
                <button
                  key={stone.id}
                  onClick={() => {
                    onSelectMoodTheme(stone.id as any, stone.label, stone.valence);
                    setBreathingPattern(stone.pattern);
                    sound.playBowlChime(stone.valence * 50 + 350, 2.5);
                  }}
                  className={`px-4 py-2 rounded-2xl border backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? `bg-gradient-to-r ${stone.glow} ${stone.border} text-white shadow-lg scale-105`
                      : 'bg-white/10 border-white/15 text-white/80 hover:bg-white/20 hover:scale-102'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-white/90 shadow-sm" />
                  <span className="text-xs font-semibold">{stone.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Floating Kinetic Glass Dock (Navigation MVC) */}
        <nav
          aria-label="Sanctuary Navigation"
          className="mx-auto max-w-2xl bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-2 shadow-2xl flex items-center justify-around gap-1"
        >
          <button
            onClick={() => {}}
            className="px-3.5 py-2 rounded-2xl bg-white/20 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition-transform active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-indigo-300" />
            <span>Sanctuary</span>
          </button>

          <button
            onClick={onOpenCompanion}
            className="px-3.5 py-2 rounded-2xl hover:bg-white/10 text-white/80 hover:text-white font-medium text-xs flex items-center gap-2 transition-transform active:scale-95"
          >
            <Heart className="w-4 h-4 text-violet-300" />
            <span>AI Companion</span>
          </button>

          <button
            onClick={onOpenJournal}
            className="px-3.5 py-2 rounded-2xl hover:bg-white/10 text-white/80 hover:text-white font-medium text-xs flex items-center gap-2 transition-transform active:scale-95"
          >
            <Feather className="w-4 h-4 text-amber-300" />
            <span>Journal</span>
          </button>

          <button
            onClick={onOpenGrounding}
            className="px-3.5 py-2 rounded-2xl hover:bg-white/10 text-white/80 hover:text-white font-medium text-xs flex items-center gap-2 transition-transform active:scale-95"
          >
            <Activity className="w-4 h-4 text-emerald-300" />
            <span>5-4-3-2-1 Ground</span>
          </button>

          <button
            onClick={onOpenAutomations}
            className="px-3.5 py-2 rounded-2xl hover:bg-white/10 text-white/80 hover:text-white font-medium text-xs flex items-center gap-2 transition-transform active:scale-95"
          >
            <Moon className="w-4 h-4 text-sky-300" />
            <span>Flow & Rest</span>
          </button>

          <button
            onClick={onOpenResearch}
            className="px-3.5 py-2 rounded-2xl hover:bg-white/10 text-white/80 hover:text-white font-medium text-xs flex items-center gap-2 transition-transform active:scale-95"
          >
            <BookOpen className="w-4 h-4 text-teal-300" />
            <span>Research</span>
          </button>
        </nav>

      </footer>

    </div>
  );
};
