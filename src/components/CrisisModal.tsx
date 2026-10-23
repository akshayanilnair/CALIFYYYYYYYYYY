/**
 * Instant 24/7 Crisis Support Center Modal
 * Verified regional helplines (India, US, UK, International)
 */

import React from 'react';
import { ShieldAlert, X, Phone, Globe, Heart, Shield } from 'lucide-react';

interface CrisisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CrisisModal: React.FC<CrisisModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const helplines = [
    {
      country: 'India',
      name: 'Tele-MANAS (Govt of India)',
      number: '14416 or 1800-891-4416',
      badge: '24/7 Toll-Free',
      description: 'Ministry of Health & Family Welfare national tele-mental health helpline. Multilingual support across 20+ regional languages.'
    },
    {
      country: 'India',
      name: 'KIRAN Helpline',
      number: '1800-599-0019',
      badge: '24/7 Toll-Free',
      description: 'Department of Empowerment of Persons with Disabilities. Psychological first aid, distress management, and mental health counseling.'
    },
    {
      country: 'India',
      name: 'Vandrevala Foundation',
      number: '+91 9999 666 555',
      badge: '24/7 Free',
      description: 'Experienced mental health professionals providing immediate crisis counseling and emotional intervention.'
    },
    {
      country: 'United States & Canada',
      name: '988 Suicide & Crisis Lifeline',
      number: 'Dial or Text 988',
      badge: '24/7 Free & Confidential',
      description: 'Immediate, compassionate crisis support for anyone experiencing distress or suicidal thoughts.'
    },
    {
      country: 'United Kingdom',
      name: 'Samaritans',
      number: '116 123',
      badge: '24/7 Free',
      description: 'Free, confidential listening support whatever you are going through.'
    },
    {
      country: 'International',
      name: 'Befrienders Worldwide / Find A Helpline',
      number: 'findahelpline.com',
      badge: '130+ Countries',
      description: 'Free, confidential support from local crisis lines in your specific region.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="crisis-title"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-200 flex items-start justify-between bg-rose-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 id="crisis-title" className="text-lg font-bold text-slate-900">
                24/7 Emergency & Crisis Support
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Your safety and well-being come first. Free, confidential human care is available right now.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-800 hover:bg-stone-200/60 transition-colors"
            aria-label="Close crisis support modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Grounding Callout */}
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 flex items-start gap-3">
            <Heart className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-700 space-y-1">
              <p className="font-semibold text-slate-900">Take an unhurried breath with us</p>
              <p>
                You do not have to carry everything alone. If you are experiencing overwhelming feelings or thoughts of harming yourself, connecting with a trained, compassionate human counselor can give you immediate relief.
              </p>
            </div>
          </div>

          {/* Regional Directory */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Verified Regional Crisis Lines
            </h3>

            <div className="grid gap-3 sm:grid-cols-2">
              {helplines.map((h, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl border border-stone-200 bg-white hover:border-indigo-200 transition-colors shadow-2xs space-y-2"
                >
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span className="font-medium text-slate-700">{h.country}</span>
                    <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      {h.badge}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{h.name}</h4>
                    <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{h.description}</p>
                  </div>
                  <div className="pt-1 flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-rose-600" />
                    <span className="text-sm font-bold text-rose-700 tracking-wide font-mono-tabular">
                      {h.number}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Boundaries Disclaimer */}
          <div className="p-3.5 rounded-lg bg-stone-100/80 border border-stone-200 text-[11px] text-slate-600 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700">
              <Shield className="w-3.5 h-3.5 text-slate-700" />
              <span>Calmify Product Boundary Notice</span>
            </div>
            <p>
              Calmify provides self-directed psychological wellness guidance and everyday coping tools. It is not an emergency response system, clinical psychiatry provider, or replacement for qualified medical and psychological diagnostic assessment.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
          >
            Return to Calmify
          </button>
        </div>
      </div>
    </div>
  );
};
