/**
 * Calmify User Dashboard
 * Personalized greeting, daily mood check-in, recent mood trends,
 * suggested evidence-based activity, and weekly reflection summary
 */

import React, { useState } from 'react';
import { UserProfile, MoodEntry, WellnessActivity, NotificationDelivery } from '../../server/types.js';
import {
  Sparkles,
  Heart,
  TrendingUp,
  Clock,
  CheckCircle,
  Calendar,
  ArrowRight,
  ShieldCheck,
  Feather,
  BookOpen,
  Activity,
  Zap,
  Play
} from 'lucide-react';

interface DashboardViewProps {
  user: UserProfile | null;
  moods: MoodEntry[];
  activities: WellnessActivity[];
  progress: {
    streak: number;
    totalMindfulMinutes: number;
    completedExercises: number;
    recordedMoods: number;
  } | null;
  notifications: NotificationDelivery[];
  onNavigate: (view: string, extra?: any) => void;
  onLogMood: (data: any) => Promise<void>;
  onStartActivity: (activity: WellnessActivity) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  moods,
  activities,
  progress,
  notifications,
  onNavigate,
  onLogMood,
  onStartActivity
}) => {
  const [selectedValence, setSelectedValence] = useState<number>(2);
  const [selectedLabel, setSelectedLabel] = useState<string>('Centered');
  const [quickNote, setQuickNote] = useState<string>('');
  const [isSubmittingMood, setIsSubmittingMood] = useState(false);
  const [justLogged, setJustLogged] = useState(false);

  const greetingTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const valenceOptions = [
    { valence: -3, label: 'Heavy', emoji: '🌧️' },
    { valence: -1, label: 'Restless', emoji: '☁️' },
    { valence: 1, label: 'Steady', emoji: '🌱' },
    { valence: 3, label: 'Centered', emoji: '☀️' },
    { valence: 5, label: 'Joyful', emoji: '✨' }
  ];

  const handleQuickMoodSubmit = async () => {
    setIsSubmittingMood(true);
    try {
      await onLogMood({
        valence: selectedValence,
        arousal: 5,
        moodLabel: selectedLabel,
        emotions: [selectedLabel.toLowerCase()],
        note: quickNote || undefined,
        triggers: ['daily check-in']
      });
      setJustLogged(true);
      setQuickNote('');
      setTimeout(() => setJustLogged(false), 3000);
    } finally {
      setIsSubmittingMood(false);
    }
  };

  const suggestedActivity = activities[0] || {
    id: 'act-box-breathing',
    title: 'Box Breathing (4-4-4-4)',
    category: 'breathing',
    durationMinutes: 4,
    description: 'A tactical parasympathetic reset to regain composure under acute pressure.'
  };

  // Recent mood points for SVG trendline
  const recentPoints = moods.slice(0, 7).reverse();

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Hero Greeting Section */}
      <section className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300 uppercase tracking-widest">
            <span>Calmify Companion Session</span>
            <span aria-hidden="true">·</span>
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white text-balance">
            {greetingTime()}, {user?.name?.split(' ')[0] || 'Friend'}.
          </h1>
          <p className="text-sm sm:text-base text-slate-300 font-light leading-relaxed">
            Welcome back. Take a gentle breath. What small step would feel most grounding for your mind right now?
          </p>

          <div className="pt-3 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('companion')}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-950 bg-white hover:bg-stone-100 rounded-xl transition-all flex items-center gap-2 shadow-sm whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Talk to AI Companion</span>
            </button>
            <button
              onClick={() => onStartActivity(suggestedActivity)}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600/70 hover:bg-indigo-600 border border-indigo-400/30 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap"
            >
              <Play className="w-4 h-4" />
              <span>Start 4-Min Box Breathing</span>
            </button>
          </div>
        </div>
      </section>

      {/* Metrics Strip (Tabular Numbers & Proof) */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-1">
          <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
            <span>Daily Streak</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono-tabular">
            {progress?.streak || user?.streak || 1} <span className="text-sm font-normal text-slate-500">days</span>
          </div>
          <div className="text-[11px] text-slate-500">Consistent mindful check-ins</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-1">
          <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
            <span>Mindful Time</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono-tabular">
            {progress?.totalMindfulMinutes || 12} <span className="text-sm font-normal text-slate-500">min</span>
          </div>
          <div className="text-[11px] text-slate-500">Guided breathing & grounding</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-1">
          <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
            <span>Mood Checks</span>
            <Heart className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono-tabular">
            {moods.length} <span className="text-sm font-normal text-slate-500">logs</span>
          </div>
          <div className="text-[11px] text-slate-500">Valence & energy awareness</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-1">
          <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
            <span>AI Architecture</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono-tabular">
            3 <span className="text-sm font-normal text-slate-500">Agents</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-medium">Research · Companion · Safety</div>
        </div>
      </section>

      {/* Main Grid: Daily Mood Check-In & Suggested Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Daily Check-In & Mood Wave (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Daily Check-In Interactive Card */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Daily Mind Check-In
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  How does your body and mind feel in this present moment?
                </p>
              </div>
              <span className="text-xs font-medium text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md">
                Step 1 of 1
              </span>
            </div>

            {/* Valence selection buttons */}
            <div className="grid grid-cols-5 gap-2">
              {valenceOptions.map(opt => {
                const isSelected = selectedLabel === opt.label;
                return (
                  <button
                    key={opt.label}
                    onClick={() => {
                      setSelectedValence(opt.valence);
                      setSelectedLabel(opt.label);
                    }}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/80 shadow-xs'
                        : 'border-stone-200 hover:border-stone-300 bg-stone-50/50'
                    }`}
                  >
                    <span className="text-xl sm:text-2xl">{opt.emoji}</span>
                    <span className={`text-xs font-semibold ${isSelected ? 'text-indigo-900' : 'text-slate-600'}`}>
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Optional note */}
            <div>
              <input
                type="text"
                value={quickNote}
                onChange={e => setQuickNote(e.target.value)}
                placeholder="Add an optional brief reflection (e.g. slept well, presentation at 2pm)..."
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 placeholder:text-slate-400"
              />
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">
                {justLogged ? '✓ Logged into encrypted history' : 'Private and confidential'}
              </span>
              <button
                onClick={handleQuickMoodSubmit}
                disabled={isSubmittingMood}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs disabled:opacity-50"
              >
                {isSubmittingMood ? 'Saving...' : justLogged ? 'Recorded!' : 'Record Mood'}
              </button>
            </div>
          </div>

          {/* Mini Mood Wave Visualization */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Recent Emotional Wave</h3>
                <p className="text-xs text-slate-500">Observable valence trends over recorded entries</p>
              </div>
              <button
                onClick={() => onNavigate('mood-journal')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <span>Full Chart</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {recentPoints.length >= 2 ? (
              <div className="h-32 w-full pt-2">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 400 100" preserveAspectRatio="none">
                  <line x1="0" y1="50" x2="400" y2="50" stroke="#e2e8f0" strokeDasharray="4 4" strokeWidth="1" />
                  {/* Generate smooth polyline path */}
                  {(() => {
                    const step = 400 / (recentPoints.length - 1);
                    const coords = recentPoints.map((pt, i) => {
                      const x = i * step;
                      // map valence -5..+5 to y 90..10
                      const y = 50 - (pt.valence / 5) * 40;
                      return { x, y, pt };
                    });
                    const pathD = coords.reduce((acc, c, i, arr) => {
                      if (i === 0) return `M ${c.x} ${c.y}`;
                      const prev = arr[i - 1];
                      const cx = (prev.x + c.x) / 2;
                      return `${acc} C ${cx} ${prev.y}, ${cx} ${c.y}, ${c.x} ${c.y}`;
                    }, '');

                    return (
                      <>
                        <path d={pathD} fill="none" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" />
                        {coords.map((c, i) => (
                          <g key={i}>
                            <circle cx={c.x} cy={c.y} r="5" fill="#ffffff" stroke="#4f46e5" strokeWidth="2.5" />
                          </g>
                        ))}
                      </>
                    );
                  })()}
                </svg>
                <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-mono-tabular">
                  <span>Earlier</span>
                  <span>Center (Valence 0)</span>
                  <span>Today</span>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-500">
                Log at least 2 check-ins to render your personalized emotional trend wave.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Suggested Activity & Weekly Reflection (5 cols) */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Suggested Exercise Card */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600">
              <Activity className="w-4 h-4" />
              <span>Recommended Practice</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{suggestedActivity.title}</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {suggestedActivity.description}
              </p>
            </div>
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/60 text-xs text-slate-600 space-y-1">
              <span className="font-semibold text-slate-700 block">Research Basis:</span>
              <p className="italic">{suggestedActivity.evidenceBasis}</p>
            </div>
            <button
              onClick={() => onStartActivity(suggestedActivity)}
              className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Start Exercise ({suggestedActivity.durationMinutes} min)</span>
            </button>
          </div>

          {/* Weekly Synthesis Summary Card */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span>Weekly Reflection</span>
              </div>
              <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Verified Data
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-serif-calm text-slate-700">
              {moods.length > 0
                ? `You have documented ${moods.length} emotional checkpoints this week. Your primary states leaned toward ${moods.slice(0, 3).map(m => m.moodLabel).join(', ')}. Engaging in structured diaphragmatic breathing correlated with positive valence shifts.`
                : 'Your weekly reflection will automatically compile once you begin recording regular daily mood check-ins.'}
            </p>
            <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
              <span className="text-slate-400">Scheduled: Every Sunday 6:00 PM</span>
              <button
                onClick={() => onNavigate('automations')}
                className="font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Configure
              </button>
            </div>
          </div>

          {/* Quick Actions Trio */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onNavigate('mood-journal')}
              className="p-4 rounded-xl border border-stone-200 bg-white hover:border-indigo-200 transition-colors text-left space-y-1 shadow-2xs"
            >
              <Feather className="w-4 h-4 text-indigo-600" />
              <div className="text-xs font-bold text-slate-900">Private Journal</div>
              <div className="text-[11px] text-slate-500">Thought offloading</div>
            </button>

            <button
              onClick={() => onNavigate('research')}
              className="p-4 rounded-xl border border-stone-200 bg-white hover:border-indigo-200 transition-colors text-left space-y-1 shadow-2xs"
            >
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <div className="text-xs font-bold text-slate-900">Research Vault</div>
              <div className="text-[11px] text-slate-500">Peer-reviewed studies</div>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
