/**
 * Calmify Automation Center
 * Persistent Scheduler, Quiet Hours enforcement,
 * Trigger-on-demand testing, and Execution history logs
 */

import React, { useState } from 'react';
import { AutomationRule, AutomationExecution, UserProfile } from '../../server/types.js';
import { api } from '../utils/api.js';
import {
  Zap,
  Play,
  Clock,
  Moon,
  Bell,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Check,
  Calendar,
  ShieldCheck
} from 'lucide-react';

interface AutomationViewProps {
  user: UserProfile | null;
  automations: AutomationRule[];
  executions: AutomationExecution[];
  onRefresh: () => Promise<void>;
}

export const AutomationView: React.FC<AutomationViewProps> = ({
  user,
  automations,
  executions,
  onRefresh
}) => {
  const [runningRuleId, setRunningRuleId] = useState<string | null>(null);
  const [runMessage, setRunMessage] = useState<{ id: string; text: string; status: string } | null>(null);

  const handleToggle = async (rule: AutomationRule) => {
    try {
      await api.toggleAutomation(rule.id, !rule.enabled);
      await onRefresh();
    } catch (err) {
      console.error('Failed to toggle automation:', err);
    }
  };

  const handleRunNow = async (ruleId: string) => {
    setRunningRuleId(ruleId);
    setRunMessage(null);
    try {
      const res = await api.runAutomation(ruleId);
      setRunMessage({
        id: ruleId,
        text: res.execution.resultSummary,
        status: res.execution.status
      });
      await onRefresh();
    } catch (err: unknown) {
      setRunMessage({
        id: ruleId,
        text: `Execution failed: ${err instanceof Error ? err.message : String(err)}`,
        status: 'failed'
      });
    } finally {
      setRunningRuleId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="pb-2 border-b border-stone-200">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Workflow Automation Center
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Durable, scheduled self-care check-ins and evidence-informed reflections with strict quiet-hours gating.
        </p>
      </div>

      {/* Quiet Hours & Policy Summary Banner */}
      <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 border border-indigo-100">
            <Moon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900">
              Quiet Hours Active: {user?.preferences.quietHoursStart || '22:00'} to {user?.preferences.quietHoursEnd || '07:30'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Automations are automatically held during your rest window to respect your sleep architecture.
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-mono-tabular shrink-0">
          Timezone: <span className="font-semibold text-slate-800">{user?.timezone || 'America/New_York'}</span>
        </div>
      </div>

      {/* Active Workflows Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Configured Automations ({automations.length})
          </h2>
          <span className="text-xs text-slate-500">Persistent across restarts</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {automations.map(rule => (
            <div
              key={rule.id}
              className={`p-6 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                rule.enabled
                  ? 'bg-white border-stone-200 shadow-2xs'
                  : 'bg-stone-50/60 border-stone-200/80 opacity-70'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-wider">
                    {rule.type.replace('_', ' ')}
                  </span>
                  
                  {/* Enable / Disable toggle */}
                  <button
                    onClick={() => handleToggle(rule)}
                    className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                      rule.enabled ? 'bg-indigo-600' : 'bg-stone-300'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        rule.enabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900">{rule.title}</h3>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 font-mono-tabular">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Scheduled: {rule.preferredTime || '09:00'} daily</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-600 bg-stone-50 p-2.5 rounded-xl border border-stone-100 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Channel:</span>
                    <span className="font-medium text-slate-700 uppercase text-[10px]">{rule.channel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Quiet Hours:</span>
                    <span className="font-medium text-slate-700">{rule.quietHoursEnforced ? 'Enforced' : 'Off'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Last Run:</span>
                    <span className="font-mono-tabular text-slate-700">
                      {rule.lastRun ? new Date(rule.lastRun).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Never'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Run Now Trigger Button */}
              <div className="space-y-2 pt-2 border-t border-stone-100">
                <button
                  onClick={() => handleRunNow(rule.id)}
                  disabled={runningRuleId === rule.id}
                  className="w-full py-2 px-3 text-xs font-semibold text-slate-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs disabled:opacity-50"
                >
                  <Play className="w-3 h-3 text-indigo-600 fill-current" />
                  <span>{runningRuleId === rule.id ? 'Executing...' : 'Run Automation Now'}</span>
                </button>

                {runMessage?.id === rule.id && (
                  <div
                    className={`text-[11px] p-2 rounded-lg ${
                      runMessage.status === 'success'
                        ? 'bg-emerald-50 text-emerald-800'
                        : runMessage.status === 'skipped_quiet_hours'
                        ? 'bg-amber-50 text-amber-800'
                        : 'bg-rose-50 text-rose-800'
                    }`}
                  >
                    {runMessage.text}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Execution History Table */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Automation Execution History
            </h3>
            <p className="text-xs text-slate-500">
              Audit log of scheduled and triggered jobs with delivery metrics
            </p>
          </div>
          <button
            onClick={onRefresh}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 text-slate-500 uppercase tracking-wider text-[10px]">
                <th className="py-2.5 font-semibold">Workflow Rule</th>
                <th className="py-2.5 font-semibold">Triggered At</th>
                <th className="py-2.5 font-semibold">Status</th>
                <th className="py-2.5 font-semibold">Duration</th>
                <th className="py-2.5 font-semibold">Result Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-mono-tabular">
              {executions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400">
                    No executions recorded yet. Trigger one with "Run Automation Now".
                  </td>
                </tr>
              ) : (
                executions.map(exec => (
                  <tr key={exec.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="py-3 font-sans font-bold text-slate-900">
                      {exec.ruleTitle}
                    </td>
                    <td className="py-3 text-slate-500">
                      {new Date(exec.triggeredAt).toLocaleString()}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          exec.status === 'success'
                            ? 'bg-emerald-50 text-emerald-700'
                            : exec.status === 'skipped_quiet_hours'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {exec.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 text-slate-600">
                      {exec.durationMs}ms
                    </td>
                    <td className="py-3 font-sans text-slate-600 max-w-xs truncate">
                      {exec.resultSummary}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
