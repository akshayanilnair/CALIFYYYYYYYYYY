/**
 * Calmify Mood Tracker & Digital Journal
 * Interactive Valence/Arousal circumplex, smooth SVG wave trends,
 * and realistic lined digital journal with prompt selector
 */

import React, { useState } from 'react';
import { MoodEntry, JournalEntry, UserProfile } from '../../server/types.js';
import {
  Heart,
  Feather,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  Search,
  Lock,
  Check,
  TrendingUp,
  Tag,
  ArrowRight
} from 'lucide-react';

interface MoodJournalViewProps {
  user: UserProfile | null;
  moods: MoodEntry[];
  journals: JournalEntry[];
  onLogMood: (data: any) => Promise<void>;
  onDeleteMood: (id: string) => Promise<void>;
  onCreateJournal: (data: any) => Promise<void>;
  onUpdateJournal: (id: string, data: any) => Promise<void>;
  onDeleteJournal: (id: string) => Promise<void>;
}

export const MoodJournalView: React.FC<MoodJournalViewProps> = ({
  user,
  moods,
  journals,
  onLogMood,
  onDeleteMood,
  onCreateJournal,
  onUpdateJournal,
  onDeleteJournal
}) => {
  const [activeTab, setActiveTab] = useState<'mood' | 'journal'>('mood');

  // Mood Form State
  const [valence, setValence] = useState<number>(2); // -5 to +5
  const [arousal, setArousal] = useState<number>(5); // 1 to 10
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>(['calm']);
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>(['work']);
  const [moodNote, setMoodNote] = useState<string>('');
  const [isSavingMood, setIsSavingMood] = useState<boolean>(false);

  // Journal Form State
  const [isComposing, setIsComposing] = useState<boolean>(false);
  const [journalTitle, setJournalTitle] = useState<string>('');
  const [journalContent, setJournalContent] = useState<string>('');
  const [journalPrompt, setJournalPrompt] = useState<string>('');
  const [searchJournal, setSearchJournal] = useState<string>('');
  const [isSavingJournal, setIsSavingJournal] = useState<boolean>(false);

  const emotionList = [
    'Calm', 'Grateful', 'Centered', 'Restless', 'Overwhelmed',
    'Focused', 'Hopeful', 'Exhausted', 'Anxious', 'Content'
  ];

  const triggerList = [
    'Work', 'Sleep', 'Family & Relationships', 'Physical Health',
    'Screen Time', 'Finance', 'Creative Flow', 'Solitude'
  ];

  const journalPrompts = [
    'What is one expectation you can gently soften for yourself today?',
    'Describe a physical sensation of comfort or steadiness in your body right now.',
    'What is one situation currently within your direct control, and what is outside it?',
    'What would you tell a dear friend who was experiencing the thoughts you have today?'
  ];

  // Derive Mood Label from circumplex (Valence x Arousal)
  const getDerivedMood = (val: number, aro: number) => {
    if (val >= 2 && aro >= 6) return { label: 'Energized & Joyful', emoji: '✨' };
    if (val >= 1 && aro <= 5) return { label: 'Peaceful & Centered', emoji: '🌿' };
    if (val <= -1 && aro >= 6) return { label: 'Tense & Overwhelmed', emoji: '⚡' };
    if (val <= -1 && aro <= 5) return { label: 'Depleted & Heavy', emoji: '🌧️' };
    return { label: 'Balanced & Steady', emoji: '🌱' };
  };

  const currentDerived = getDerivedMood(valence, arousal);

  const handleSaveMood = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingMood(true);
    try {
      await onLogMood({
        valence,
        arousal,
        moodLabel: currentDerived.label,
        emotions: selectedEmotions,
        triggers: selectedTriggers,
        note: moodNote.trim() || undefined
      });
      setMoodNote('');
    } finally {
      setIsSavingMood(false);
    }
  };

  const handleSaveJournal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalContent.trim()) return;
    setIsSavingJournal(true);
    try {
      await onCreateJournal({
        title: journalTitle.trim() || 'Untitled Reflection',
        content: journalContent.trim(),
        promptUsed: journalPrompt || undefined,
        sentimentTags: selectedEmotions.slice(0, 3)
      });
      setJournalTitle('');
      setJournalContent('');
      setJournalPrompt('');
      setIsComposing(false);
    } finally {
      setIsSavingJournal(false);
    }
  };

  const filteredJournals = journals.filter(j =>
    j.title.toLowerCase().includes(searchJournal.toLowerCase()) ||
    j.content.toLowerCase().includes(searchJournal.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {activeTab === 'mood' ? 'Mood & Emotional Wave' : 'Encrypted Digital Journal'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {activeTab === 'mood'
              ? 'Scientific valence-arousal tracking to observe emotional fluctuations without judgment.'
              : 'Private space for structured cognitive offloading and self-compassion writing.'}
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center p-1 bg-stone-100 rounded-xl border border-stone-200/80 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('mood')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'mood'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Mood Tracker</span>
          </button>
          <button
            onClick={() => setActiveTab('journal')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'journal'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Feather className="w-3.5 h-3.5" />
            <span>Digital Journal</span>
          </button>
        </div>
      </div>

      {/* TAB 1: MOOD TRACKER */}
      {activeTab === 'mood' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Mood Logging Pad (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">
                Log New Mood Check
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{currentDerived.emoji}</span>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md">
                  {currentDerived.label}
                </span>
              </div>
            </div>

            <form onSubmit={handleSaveMood} className="space-y-6">
              
              {/* Valence Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-700">Valence (Pleasantness)</span>
                  <span className="font-mono-tabular font-bold text-indigo-600">
                    {valence > 0 ? `+${valence}` : valence}
                  </span>
                </div>
                <input
                  type="range"
                  min="-5"
                  max="5"
                  step="1"
                  value={valence}
                  onChange={e => setValence(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-600">
                  <span>-5 Heavy / Distressed</span>
                  <span>0 Neutral</span>
                  <span>+5 Peaceful / Uplifted</span>
                </div>
              </div>

              {/* Arousal Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-700">Arousal (Energy Level)</span>
                  <span className="font-mono-tabular font-bold text-indigo-600">
                    {arousal} / 10
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={arousal}
                  onChange={e => setArousal(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-600">
                  <span>1 Still / Low Energy</span>
                  <span>5 Balanced</span>
                  <span>10 High Alert / Agitated</span>
                </div>
              </div>

              {/* Emotion Tags */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 block">
                  Specific Emotions (Select all that resonate)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {emotionList.map(em => {
                    const isSelected = selectedEmotions.includes(em.toLowerCase());
                    return (
                      <button
                        type="button"
                        key={em}
                        onClick={() => {
                          const lower = em.toLowerCase();
                          setSelectedEmotions(prev =>
                            prev.includes(lower) ? prev.filter(x => x !== lower) : [...prev, lower]
                          );
                        }}
                        className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-2xs'
                            : 'bg-stone-100 hover:bg-stone-200 text-slate-700'
                        }`}
                      >
                        {em}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Trigger Factors */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 block">
                  Contributing Factors / Triggers
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {triggerList.map(trig => {
                    const isSelected = selectedTriggers.includes(trig.toLowerCase());
                    return (
                      <button
                        type="button"
                        key={trig}
                        onClick={() => {
                          const lower = trig.toLowerCase();
                          setSelectedTriggers(prev =>
                            prev.includes(lower) ? prev.filter(x => x !== lower) : [...prev, lower]
                          );
                        }}
                        className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                          isSelected
                            ? 'bg-slate-900 text-white shadow-2xs'
                            : 'bg-stone-100 hover:bg-stone-200 text-slate-700'
                        }`}
                      >
                        {trig}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Reflection Note (Optional)
                </label>
                <textarea
                  value={moodNote}
                  onChange={e => setMoodNote(e.target.value)}
                  rows={2}
                  placeholder="What is happening in your environment right now?"
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-stone-200 bg-stone-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSavingMood}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl transition-colors shadow-xs"
                >
                  {isSavingMood ? 'Saving...' : 'Record Check-In'}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Interactive Emotional Wave Curve & History (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Smooth SVG Trendline */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Valence Waveform Analysis
                </h3>
                <p className="text-xs text-slate-500">
                  Descriptive trend over past entries (non-diagnostic)
                </p>
              </div>

              <div className="h-40 w-full pt-2">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 400 120" preserveAspectRatio="none">
                  {/* Baseline 0 */}
                  <line x1="0" y1="60" x2="400" y2="60" stroke="#cbd5e1" strokeDasharray="3 3" strokeWidth="1" />
                  {/* Top +5 and bottom -5 guidelines */}
                  <line x1="0" y1="15" x2="400" y2="15" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="0" y1="105" x2="400" y2="105" stroke="#f1f5f9" strokeWidth="1" />

                  {moods.length >= 2 && (() => {
                    const step = 400 / (moods.length - 1);
                    const coords = moods.slice().reverse().map((pt, i) => {
                      const x = i * step;
                      const y = 60 - (pt.valence / 5) * 45;
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
                        <path d={pathD} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" />
                        {coords.map((c, i) => (
                          <circle key={i} cx={c.x} cy={c.y} r="4" fill="#ffffff" stroke="#4338ca" strokeWidth="2" />
                        ))}
                      </>
                    );
                  })()}
                </svg>
                <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-mono-tabular">
                  <span>Earliest Log</span>
                  <span>Baseline</span>
                  <span>Latest Log</span>
                </div>
              </div>
            </div>

            {/* Recent Mood Logs */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Recent Check-Ins ({moods.length})
              </h3>
              
              <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                {moods.length === 0 ? (
                  <div className="py-4 text-center text-xs text-slate-400">
                    No moods logged yet.
                  </div>
                ) : (
                  moods.map(m => (
                    <div
                      key={m.id}
                      className="p-3 rounded-xl border border-stone-100 bg-stone-50/60 hover:bg-stone-50 transition-colors flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{m.moodLabel}</span>
                          <span className="font-mono-tabular font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded text-[10px]">
                            {m.valence > 0 ? `+${m.valence}` : m.valence}
                          </span>
                        </div>
                        {m.note && <p className="text-slate-600 italic">"{m.note}"</p>}
                        <div className="text-[10px] text-slate-400 font-mono-tabular">
                          {new Date(m.timestamp).toLocaleDateString()} at{' '}
                          {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>

                      <button
                        onClick={() => onDeleteMood(m.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                        title="Delete check-in"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 2: DIGITAL JOURNAL */}
      {activeTab === 'journal' && (
        <div className="space-y-6">
          
          {/* Top Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative max-w-sm w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchJournal}
                onChange={e => setSearchJournal(e.target.value)}
                placeholder="Search reflections and keywords..."
                className="w-full text-xs sm:text-sm pl-9 pr-4 py-2 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero-Knowledge Vault Storage</span>
              </div>
              {!isComposing && (
                <button
                  onClick={() => setIsComposing(true)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Write Reflection</span>
                </button>
              )}
            </div>
          </div>

          {/* New Journal Entry Paper Form */}
          {isComposing && (
            <div className="bg-amber-50/20 rounded-2xl border border-amber-200/80 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-amber-200/60 pb-3">
                <div className="flex items-center gap-2">
                  <Feather className="w-4 h-4 text-amber-700" />
                  <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                    New Private Journal Entry
                  </span>
                </div>
                <button
                  onClick={() => setIsComposing(false)}
                  className="text-xs font-medium text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
              </div>

              {/* Prompt Dropdown Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Select a Guided Inquiry Prompt (Optional)
                </label>
                <select
                  value={journalPrompt}
                  onChange={e => setJournalPrompt(e.target.value)}
                  className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">-- Choose a reflective prompt or write freely --</option>
                  {journalPrompts.map((p, i) => (
                    <option key={i} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              {/* Title & Ruled Sheet Writing Area */}
              <div className="space-y-3">
                <input
                  type="text"
                  value={journalTitle}
                  onChange={e => setJournalTitle(e.target.value)}
                  placeholder="Entry Title (e.g. Morning thoughts on releasing perfectionism)..."
                  className="w-full text-base sm:text-lg font-bold p-3 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-serif-calm"
                />

                <textarea
                  value={journalContent}
                  onChange={e => setJournalContent(e.target.value)}
                  rows={8}
                  placeholder="Write freely. Your journal is private and is never used for generic model training..."
                  className="w-full text-sm p-4 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-serif-calm leading-relaxed"
                />
              </div>

              {/* Footer bar */}
              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-slate-400 font-mono-tabular">
                  Words: {journalContent.trim().split(/\s+/).filter(Boolean).length}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsComposing(false)}
                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
                  >
                    Discard
                  </button>
                  <button
                    onClick={handleSaveJournal}
                    disabled={isSavingJournal || !journalContent.trim()}
                    className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-xl transition-colors shadow-xs"
                  >
                    {isSavingJournal ? 'Saving...' : 'Save to Vault'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Journal Entries List */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredJournals.length === 0 ? (
              <div className="col-span-full py-16 text-center text-xs text-slate-400 bg-white rounded-2xl border border-stone-200">
                No journal reflections found. Click "Write Reflection" above to begin.
              </div>
            ) : (
              filteredJournals.map(entry => (
                <div
                  key={entry.id}
                  className="p-5 rounded-2xl bg-white border border-stone-200 hover:border-indigo-200 shadow-2xs transition-colors space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-bold text-slate-900 font-serif-calm line-clamp-1">
                        {entry.title}
                      </h3>
                      <button
                        onClick={() => onDeleteJournal(entry.id)}
                        className="text-slate-300 hover:text-rose-600 transition-colors p-0.5"
                        title="Delete entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {entry.promptUsed && (
                      <p className="text-[11px] text-indigo-700 bg-indigo-50 p-2 rounded-lg line-clamp-2">
                        Prompt: {entry.promptUsed}
                      </p>
                    )}

                    <p className="text-xs text-slate-600 font-serif-calm line-clamp-4 leading-relaxed">
                      {entry.content}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-slate-400 font-mono-tabular">
                    <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
                    <span>{entry.wordCount} words</span>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      )}

    </div>
  );
};
