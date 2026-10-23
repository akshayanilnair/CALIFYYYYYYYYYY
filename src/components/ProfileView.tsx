/**
 * Calmify User Profile & Privacy Center
 * Consent management, Quiet Hours schedule,
 * GDPR/HIPAA-aligned data export, and irreversible account deletion
 */

import React, { useState } from 'react';
import { UserProfile } from '../../server/types.js';
import { api } from '../utils/api.js';
import {
  User,
  Shield,
  Download,
  Trash2,
  Moon,
  Clock,
  CheckCircle,
  AlertTriangle,
  Lock,
  Sparkles
} from 'lucide-react';

interface ProfileViewProps {
  user: UserProfile | null;
  onRefreshUser: () => Promise<void>;
  onSwitchRole: (role: 'user' | 'reviewer' | 'admin') => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  onRefreshUser,
  onSwitchRole
}) => {
  const [name, setName] = useState<string>(user?.name || '');
  const [quietStart, setQuietStart] = useState<string>(user?.preferences.quietHoursStart || '22:00');
  const [quietEnd, setQuietEnd] = useState<string>(user?.preferences.quietHoursEnd || '07:30');
  const [personalization, setPersonalization] = useState<boolean>(user?.preferences.personalizationConsent ?? true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string>('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage('');
    try {
      await api.updateProfile({
        name,
        preferences: {
          quietHoursStart: quietStart,
          quietHoursEnd: quietEnd,
          personalizationConsent: personalization
        }
      });
      await onRefreshUser();
      setSaveMessage('Profile and privacy preferences updated.');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err: unknown) {
      setSaveMessage(`Failed to update: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await api.deleteAccount();
      alert('All personal records and scheduled automations have been permanently deleted.');
      window.location.reload();
    } catch (err: unknown) {
      alert(`Deletion failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="pb-2 border-b border-stone-200">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Account & Privacy Vault
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your personal data, quiet hours schedule, consent boundaries, and GDPR export rights.
        </p>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSaveProfile} className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-2xs space-y-6">
        <h2 className="text-base font-bold text-slate-900">
          User Information & Role
        </h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-stone-200 bg-stone-50/50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">Email Address</label>
            <input
              type="email"
              disabled
              value={user?.email || 'alex.mindful@calmify.app'}
              className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-stone-200 bg-stone-100 text-slate-500 cursor-not-allowed"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">Timezone</label>
            <input
              type="text"
              disabled
              value={user?.timezone || 'America/New_York'}
              className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-stone-200 bg-stone-100 text-slate-500 cursor-not-allowed font-mono-tabular"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">Active Testing Role</label>
            <div className="flex items-center gap-2 pt-1">
              {(['user', 'reviewer', 'admin'] as const).map(r => (
                <button
                  type="button"
                  key={r}
                  onClick={() => onSwitchRole(r)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors ${
                    user?.role === r
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-stone-100 text-slate-700 hover:bg-stone-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quiet Hours Configuration */}
        <div className="pt-4 border-t border-stone-100 space-y-3">
          <div className="flex items-center gap-2">
            <Moon className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Quiet Hours Schedule
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            During quiet hours, scheduled check-in reminders and notifications are suppressed to protect your rest.
          </p>

          <div className="grid grid-cols-2 gap-4 max-w-sm">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600">Start Time</label>
              <input
                type="time"
                value={quietStart}
                onChange={e => setQuietStart(e.target.value)}
                className="w-full text-xs p-2 rounded-xl border border-stone-200 font-mono-tabular"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600">End Time</label>
              <input
                type="time"
                value={quietEnd}
                onChange={e => setQuietEnd(e.target.value)}
                className="w-full text-xs p-2 rounded-xl border border-stone-200 font-mono-tabular"
              />
            </div>
          </div>
        </div>

        {/* Consent Boundaries */}
        <div className="pt-4 border-t border-stone-100 space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Privacy & AI Consent Boundaries
            </h3>
          </div>

          <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl bg-stone-50 border border-stone-200/70 hover:bg-stone-100/60 transition-colors">
            <input
              type="checkbox"
              checked={personalization}
              onChange={e => setPersonalization(e.target.checked)}
              className="mt-0.5 accent-indigo-600 w-4 h-4"
            />
            <div className="text-xs space-y-0.5">
              <span className="font-bold text-slate-900 block">Personalized Guidance Consent</span>
              <span className="text-slate-500 block">
                Allow the Wellness Companion to adapt suggestions to your preferred breathing pace and recorded streak. Private journal texts are never sent to external AI services without your explicit prompt.
              </span>
            </div>
          </label>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-stone-100">
          <span className="text-xs text-emerald-600 font-medium">{saveMessage}</span>
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-xl transition-colors shadow-xs"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>

      {/* GDPR Data Export & Account Deletion (Check 20) */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-2xs space-y-4">
        <h2 className="text-base font-bold text-slate-900">
          Data Ownership & Deletion Rights
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          You have full ownership of your mental wellness records. In compliance with GDPR and modern data privacy standards, you can download your entire data payload as machine-readable JSON or permanently delete your account and all associated scheduled automations.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          {/* Download JSON button */}
          <a
            href={api.getExportUrl()}
            download
            className="px-4 py-2 text-xs font-semibold text-slate-900 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors flex items-center gap-2 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export All Data (JSON)</span>
          </a>

          {/* Delete Account button */}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Permanently Delete Account</span>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold text-slate-900">Irreversible Deletion</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              This will permanently delete all your mood entries, private journal entries, conversation transcripts, and scheduled automation rules. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs"
              >
                Yes, Delete Everything
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
