/**
 * Calmify Navigation Bar
 * Follows strict Top Bar Contract:
 * [Wordmark Brand] | [Single-line Nav Links] | [Crisis Action & Profile]
 */

import React from 'react';
import { UserProfile, NotificationDelivery } from '../../server/types.js';
import { ShieldAlert, Bell, Sparkles, User, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  user: UserProfile | null;
  notifications: NotificationDelivery[];
  onOpenCrisis: () => void;
  onSwitchRole: (role: 'user' | 'reviewer' | 'admin') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  user,
  notifications,
  onOpenCrisis,
  onSwitchRole
}) => {
  const unreadCount = notifications.filter(n => n.status === 'delivered').length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'companion', label: 'AI Companion' },
    { id: 'mood-journal', label: 'Mood & Journal' },
    { id: 'activities', label: 'Activities' },
    { id: 'automations', label: 'Automations' },
    { id: 'research', label: 'Research Library' },
    { id: 'security', label: '20-Point Security' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        
        {/* Zone 1: Single element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2.5 text-left focus:outline-none group"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 block leading-tight">
                Calmify
              </span>
              <span className="text-[10px] tracking-wide text-slate-600 block uppercase font-medium">
                Research-Grounded Wellness
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navItems.map(item => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-stone-100 text-indigo-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-stone-50'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Crisis Action, Role Switcher & Profile */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Emergency Crisis Button */}
          <button
            onClick={onOpenCrisis}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors whitespace-nowrap shrink-0 shadow-xs"
            title="Immediate 24/7 Crisis Support"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            <span>24/7 Crisis Helplines</span>
          </button>

          {/* Role switcher for demo testing */}
          <div className="relative group hidden sm:block">
            <button
              className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap"
              title="Switch role to test Admin or Reviewer workflows"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span className="capitalize">{user?.role || 'user'}</span>
            </button>
            <div className="absolute right-0 mt-1 w-36 bg-white border border-stone-200 rounded-lg shadow-lg py-1 hidden group-hover:block z-50">
              <div className="px-3 py-1 text-[10px] text-slate-600 uppercase font-bold tracking-wider">
                Simulate Role
              </div>
              <button
                onClick={() => onSwitchRole('user')}
                className={`w-full text-left px-3 py-1.5 text-xs hover:bg-stone-50 ${user?.role === 'user' ? 'text-indigo-600 font-bold' : 'text-slate-700'}`}
              >
                User (Member)
              </button>
              <button
                onClick={() => onSwitchRole('reviewer')}
                className={`w-full text-left px-3 py-1.5 text-xs hover:bg-stone-50 ${user?.role === 'reviewer' ? 'text-indigo-600 font-bold' : 'text-slate-700'}`}
              >
                Clinical Reviewer
              </button>
              <button
                onClick={() => onSwitchRole('admin')}
                className={`w-full text-left px-3 py-1.5 text-xs hover:bg-stone-50 ${user?.role === 'admin' ? 'text-indigo-600 font-bold' : 'text-slate-700'}`}
              >
                Administrator
              </button>
            </div>
          </div>

          {/* Profile shortcut */}
          <button
            onClick={() => onNavigate('profile')}
            className={`p-2 rounded-lg border transition-colors ${
              currentView === 'profile'
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                : 'text-slate-600 hover:text-slate-900 border-stone-200 hover:bg-stone-50'
            }`}
            title="Privacy and Account Settings"
          >
            <User className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile nav drawer strip */}
      <div className="lg:hidden border-t border-stone-100 px-4 py-2 flex items-center gap-2 overflow-x-auto">
        {navItems.map(item => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 ${
                isActive ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-stone-100'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
