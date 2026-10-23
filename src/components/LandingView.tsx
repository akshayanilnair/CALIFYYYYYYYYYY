/**
 * Calmify Kinetic Landing Page
 * Opens as the initial entry point of the app
 * Features moving fluid animations, interactive hero resonance preview,
 * human copy without em dashes, and clear pathways to enter the sanctuary
 */

import React, { useState, useEffect } from 'react';
import { sound } from '../utils/audio.js';
import {
  Sparkles,
  ShieldCheck,
  BookOpen,
  ArrowRight,
  Heart,
  Activity,
  Moon,
  Clock,
  ShieldAlert,
  Volume2,
  VolumeX,
  Play
} from 'lucide-react';

interface LandingViewProps {
  onStart: () => void;
  onExploreResearch: () => void;
  onOpenCrisis: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onStart,
  onExploreResearch,
  onOpenCrisis
}) => {
  const [heroScale, setHeroScale] = useState(1);
  const [heroPhase, setHeroPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [isSoundOn, setIsSoundOn] = useState(false);

  // Gentle breathing animation for the hero orb preview
  useEffect(() => {
    let t = 0;
    const interval = setInterval(() => {
      t += 0.05;
      const sin = Math.sin(t);
      const scale = 0.9 + (sin + 1) * 0.18;
      setHeroScale(scale);
      if (sin > 0.4) setHeroPhase('Inhale');
      else if (sin < -0.4) setHeroPhase('Exhale');
      else setHeroPhase('Hold');
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const handleToggleSound = () => {
    const active = sound.toggleAmbience();
    setIsSoundOn(active);
  };

  return (
    <div className="relative z-10 min-h-screen text-white flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      
      {/* Top Navigation */}
      <header className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-lg">
            <Sparkles className="w-5 h-5 text-indigo-300" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white block leading-tight">
              Calmify
            </span>
            <span className="text-[10px] tracking-widest text-indigo-200 uppercase font-semibold block">
              A healthier mind, one day at a time
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Soundscape button */}
          <button
            onClick={handleToggleSound}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border backdrop-blur-md transition-all flex items-center gap-2 ${
              isSoundOn
                ? 'bg-indigo-500/30 border-indigo-400 text-white'
                : 'bg-white/10 border-white/20 text-white/70 hover:text-white hover:bg-white/20'
            }`}
          >
            {isSoundOn ? <Volume2 className="w-3.5 h-3.5 text-indigo-300" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isSoundOn ? 'Soundscape Active' : 'Soundscape'}</span>
          </button>

          {/* Crisis button */}
          <button
            onClick={onOpenCrisis}
            className="px-3 py-1.5 text-xs font-semibold text-rose-300 bg-rose-950/40 border border-rose-500/30 rounded-full hover:bg-rose-900/50 backdrop-blur-md transition-all flex items-center gap-1.5"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">24/7 Crisis Help</span>
          </button>

          {/* Main Primary CTA */}
          <button
            onClick={onStart}
            className="px-4 py-2 text-xs font-bold text-slate-950 bg-white hover:bg-stone-100 rounded-full transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <span>Enter Sanctuary</span>
            <ArrowRight className="w-3.5 h-3.5 text-indigo-600" />
          </button>
        </div>
      </header>

      {/* Main Hero Container */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-12 flex-1 flex flex-col lg:flex-row items-center justify-between gap-12">
        
        {/* Left Column: Headline and Call to Actions */}
        <div className="max-w-2xl space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-xs font-semibold text-indigo-200">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Three Specialized AI Agents Grounded in Clinical Research</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Understand your feelings. <br />
            <span className="bg-gradient-to-r from-indigo-300 via-violet-200 to-teal-200 bg-clip-text text-transparent">
              Find your next step.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 font-light leading-relaxed max-w-xl mx-auto lg:mx-0">
            A quiet digital sanctuary built around real psychological science. Guided by three distinct agents, peaceful kinetic breathing, and thoughtful quiet-hours automations.
          </p>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
            <button
              onClick={onStart}
              className="px-6 py-3.5 text-sm font-bold text-slate-950 bg-white hover:bg-stone-100 rounded-2xl transition-all shadow-xl flex items-center gap-2 cursor-pointer group"
            >
              <span>Begin Your Session</span>
              <ArrowRight className="w-4 h-4 text-indigo-600 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={onExploreResearch}
              className="px-6 py-3.5 text-sm font-semibold text-white bg-white/10 hover:bg-white/15 border border-white/20 rounded-2xl transition-all backdrop-blur-md flex items-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-indigo-300" />
              <span>Explore Research Library</span>
            </button>
          </div>

          <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-xs text-slate-400">
            <span>5 Peer-Reviewed Meta-Analyses</span>
            <span>·</span>
            <span>Zero-Knowledge Vault</span>
            <span>·</span>
            <span>Quiet-Hours Protected</span>
          </div>
        </div>

        {/* Right Column: Moving Interactive Resonance Orb Preview */}
        <div className="relative flex flex-col items-center justify-center">
          
          {/* Radial Glow */}
          <div
            className="w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-indigo-500/30 via-purple-500/20 to-transparent blur-3xl pointer-events-none transition-transform duration-500"
            style={{ transform: `scale(${heroScale * 1.2})` }}
          />

          {/* Interactive Hero Orb Card */}
          <div
            onClick={onStart}
            className="relative cursor-pointer group p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/15 shadow-2xl flex flex-col items-center space-y-6 transition-all hover:border-white/30"
          >
            {/* The Moving Animated Sphere */}
            <div
              className="w-44 h-44 sm:w-52 sm:h-52 rounded-full bg-gradient-to-tr from-white/30 via-indigo-400/50 to-violet-300/60 backdrop-blur-2xl border border-white/40 shadow-[0_0_60px_rgba(99,102,241,0.5)] flex flex-col items-center justify-center text-center p-4 transition-transform duration-300 group-hover:scale-105"
              style={{ transform: `scale(${heroScale})` }}
            >
              <span className="text-xl font-bold tracking-tight text-white drop-shadow-md">
                {heroPhase}
              </span>
              <span className="text-[11px] font-mono text-indigo-100/80 mt-1">
                Tap to Enter
              </span>
            </div>

            <div className="text-center space-y-1">
              <span className="text-xs font-bold text-white tracking-wide uppercase">
                Living Resonance Orb
              </span>
              <p className="text-[11px] text-slate-400 max-w-xs">
                Synchronize your breath with gentle 4-7-8 and box regulation protocols.
              </p>
            </div>
          </div>
        </div>

      </main>

      {/* Feature Pillars Strip */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-12 border-t border-white/10">
        <div className="grid gap-6 sm:grid-cols-3">
          
          <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 space-y-3">
            <BookOpen className="w-5 h-5 text-indigo-300" />
            <h3 className="text-sm font-bold text-white">Agent 1: Research & Evidence</h3>
            <p className="text-xs text-slate-300 leading-relaxed font-light">
              Indexed against approved studies on vagal nerve stimulation, cognitive behavioral therapy, and mindfulness. Every citation is traceable to verified publications.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 space-y-3">
            <Heart className="w-5 h-5 text-violet-300" />
            <h3 className="text-sm font-bold text-white">Agent 2: Personalized Companion</h3>
            <p className="text-xs text-slate-300 leading-relaxed font-light">
              Supportive guidance designed to explain psychological tools without clinical jargon. Suggests low-risk somatic practices and respectful questions.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 space-y-3">
            <ShieldCheck className="w-5 h-5 text-emerald-300" />
            <h3 className="text-sm font-bold text-white">Agent 3: Safety & Validation</h3>
            <p className="text-xs text-slate-300 leading-relaxed font-light">
              Screens incoming messages for distress signals. Immediately connects users in need to verified 24/7 regional hotlines including Tele-MANAS, KIRAN, and 988.
            </p>
          </div>

        </div>
      </section>

      {/* Natural Human Footer */}
      <footer className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <p>Calmify: A healthier mind, one day at a time.</p>
        <p className="text-[11px] text-slate-400 text-center sm:text-right">
          Calmify provides self-directed wellness guidance. Not a substitute for clinical psychiatric care or emergency services.
        </p>
      </footer>

    </div>
  );
};
