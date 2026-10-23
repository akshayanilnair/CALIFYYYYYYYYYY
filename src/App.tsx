/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  UserProfile,
  MoodEntry,
  JournalEntry,
  WellnessActivity,
  AutomationRule,
  AutomationExecution,
  NotificationDelivery
} from '../server/types.js';
import { api } from './utils/api.js';
import { KineticCanvas } from './components/KineticCanvas.tsx';
import { KineticSanctuary } from './components/KineticSanctuary.tsx';
import { LandingView } from './components/LandingView.tsx';
import { CrisisModal } from './components/CrisisModal.tsx';
import { CompanionView } from './components/CompanionView.tsx';
import { MoodJournalView } from './components/MoodJournalView.tsx';
import { ActivitiesView } from './components/ActivitiesView.tsx';
import { AutomationView } from './components/AutomationView.tsx';
import { ResearchView } from './components/ResearchView.tsx';
import { ProfileView } from './components/ProfileView.tsx';
import { Bell, X, ArrowLeft } from 'lucide-react';

export default function App() {
  // Navigation: starts on the animated Landing Page
  const [currentView, setCurrentView] = useState<string>('landing');
  const [moodTheme, setMoodTheme] = useState<'indigo' | 'sage' | 'amber' | 'slate' | 'teal'>('indigo');
  const [breathingScale, setBreathingScale] = useState<number>(1.0);

  const [user, setUser] = useState<UserProfile | null>(null);
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [activities, setActivities] = useState<WellnessActivity[]>([]);
  const [automations, setAutomations] = useState<AutomationRule[]>([]);
  const [executions, setExecutions] = useState<AutomationExecution[]>([]);
  const [notifications, setNotifications] = useState<NotificationDelivery[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<WellnessActivity | null>(null);
  const [isCrisisOpen, setIsCrisisOpen] = useState<boolean>(false);
  const [activeToast, setActiveToast] = useState<NotificationDelivery | null>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [
        meData,
        moodsData,
        journalsData,
        activitiesData,
        automationsData,
        executionsData,
        notifsData
      ] = await Promise.all([
        api.getMe(),
        api.getMoods(),
        api.getJournals(),
        api.getActivities(),
        api.getAutomations(),
        api.getAutomationExecutions(),
        api.getNotifications()
      ]);

      setUser(meData.user);
      setMoods(moodsData.moods);
      setJournals(journalsData.journals);
      setActivities(activitiesData.activities);
      setAutomations(automationsData.automations);
      setExecutions(executionsData.executions);
      setNotifications(notifsData.notifications);

      const unread = notifsData.notifications.find(n => n.status === 'delivered');
      if (unread && Date.now() - new Date(unread.timestamp).getTime() < 300000) {
        setActiveToast(unread);
      }
    } catch (err) {
      console.error('Failed to load Calmify data:', err);
    }
  };

  const handleSelectMoodTheme = async (
    theme: 'indigo' | 'sage' | 'amber' | 'slate' | 'teal',
    label: string,
    valence: number
  ) => {
    setMoodTheme(theme);
    try {
      await api.createMood({
        valence,
        arousal: 5,
        moodLabel: label,
        emotions: [label.toLowerCase()],
        triggers: ['sanctuary resonance']
      });
      loadAllData();
    } catch (err) {
      console.error('Mood save error:', err);
    }
  };

  const handleSwitchRole = async (role: 'user' | 'reviewer' | 'admin') => {
    try {
      const data = await api.switchRole(role);
      setUser(data.user);
      loadAllData();
    } catch (err) {
      console.error('Role switch failed:', err);
    }
  };

  const handleLogMood = async (data: any) => {
    await api.createMood(data);
    await loadAllData();
  };

  const handleDeleteMood = async (id: string) => {
    await api.deleteMood(id);
    await loadAllData();
  };

  const handleCreateJournal = async (data: any) => {
    await api.createJournal(data);
    await loadAllData();
  };

  const handleUpdateJournal = async (id: string, data: any) => {
    await api.updateJournal(id, data);
    await loadAllData();
  };

  const handleDeleteJournal = async (id: string) => {
    await api.deleteJournal(id);
    await loadAllData();
  };

  const handleCompleteActivity = async (id: string, data: any) => {
    await api.completeActivity(id, data);
    await loadAllData();
  };

  const handleDismissToast = async (notifId: string) => {
    setActiveToast(null);
    await api.markNotificationRead(notifId);
    await loadAllData();
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* 60fps Generative Fluid Wave Background Canvas */}
      <KineticCanvas
        moodTheme={moodTheme}
        intensity={1.0}
        breathingScale={breathingScale}
      />

      {/* Gentle Scheduled In-App Notification Toast */}
      {activeToast && (
        <aside
          aria-label="In-app notification"
          className="fixed top-6 right-6 z-50 max-w-sm bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-4 flex items-start gap-3 text-white transition-all animate-in slide-in-from-top"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-500/30 text-indigo-200 flex items-center justify-center shrink-0">
            <Bell className="w-4 h-4" />
          </div>
          <div className="flex-1 space-y-0.5">
            <h4 className="text-xs font-bold">{activeToast.title}</h4>
            <p className="text-xs text-white/80 leading-snug">{activeToast.body}</p>
          </div>
          <button
            onClick={() => handleDismissToast(activeToast.id)}
            className="text-white/60 hover:text-white p-0.5"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </aside>
      )}

      {/* If current view is 'landing', render the Landing Page */}
      {currentView === 'landing' && (
        <LandingView
          onStart={() => setCurrentView('sanctuary')}
          onExploreResearch={() => setCurrentView('research')}
          onOpenCrisis={() => setIsCrisisOpen(true)}
        />
      )}

      {/* If current view is 'sanctuary', render the moving Living Resonance Orb */}
      {currentView === 'sanctuary' && (
        <KineticSanctuary
          user={user}
          moodTheme={moodTheme}
          onSelectMoodTheme={handleSelectMoodTheme}
          onOpenCompanion={() => setCurrentView('companion')}
          onOpenJournal={() => setCurrentView('mood-journal')}
          onOpenGrounding={() => setCurrentView('grounding')}
          onOpenAutomations={() => setCurrentView('automations')}
          onOpenResearch={() => setCurrentView('research')}
          onOpenCrisis={() => setIsCrisisOpen(true)}
          onOpenLanding={() => setCurrentView('landing')}
          onBreathingScaleChange={setBreathingScale}
        />
      )}

      {/* Floating Modal/Drawer Overlay for Active Modules */}
      {currentView !== 'landing' && currentView !== 'sanctuary' && (
        <div className="relative z-20 min-h-screen flex flex-col backdrop-blur-xl bg-slate-950/70 text-slate-900 animate-in fade-in duration-300">
          
          {/* Top Bar to Return to Sanctuary */}
          <div className="sticky top-0 z-30 px-4 sm:px-8 py-3.5 bg-white/95 backdrop-blur-md border-b border-stone-200 flex items-center justify-between">
            <button
              onClick={() => setCurrentView('sanctuary')}
              className="flex items-center gap-2 text-xs font-bold text-slate-800 hover:text-indigo-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Living Sanctuary</span>
            </button>

            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-600 capitalize">
                {currentView.replace('-', ' ')}
              </span>
              <button
                onClick={() => setIsCrisisOpen(true)}
                className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors"
              >
                Crisis Support
              </button>
            </div>
          </div>

          {/* Module Content */}
          <div className="flex-1 bg-stone-50">
            {currentView === 'companion' && (
              <CompanionView
                user={user}
                onStartActivity={act => {
                  setSelectedActivity(act);
                  setCurrentView('activities');
                }}
                onOpenCrisis={() => setIsCrisisOpen(true)}
              />
            )}

            {currentView === 'mood-journal' && (
              <MoodJournalView
                user={user}
                moods={moods}
                journals={journals}
                onLogMood={handleLogMood}
                onDeleteMood={handleDeleteMood}
                onCreateJournal={handleCreateJournal}
                onUpdateJournal={handleUpdateJournal}
                onDeleteJournal={handleDeleteJournal}
              />
            )}

            {currentView === 'grounding' && (
              <ActivitiesView
                user={user}
                activities={activities}
                selectedActivity={selectedActivity}
                onCompleteActivity={handleCompleteActivity}
              />
            )}

            {currentView === 'activities' && (
              <ActivitiesView
                user={user}
                activities={activities}
                selectedActivity={selectedActivity}
                onCompleteActivity={handleCompleteActivity}
              />
            )}

            {currentView === 'automations' && (
              <AutomationView
                user={user}
                automations={automations}
                executions={executions}
                onRefresh={loadAllData}
              />
            )}

            {currentView === 'research' && (
              <ResearchView
                user={user}
                onRefresh={loadAllData}
              />
            )}

            {currentView === 'profile' && (
              <ProfileView
                user={user}
                onRefreshUser={loadAllData}
                onSwitchRole={handleSwitchRole}
              />
            )}
          </div>
        </div>
      )}

      {/* 24/7 Regional Crisis Support Modal */}
      <CrisisModal
        isOpen={isCrisisOpen}
        onClose={() => setIsCrisisOpen(false)}
      />

    </div>
  );
}
