/**
 * Calmify AI Companion Chat View
 * Integrates the Three-Agent Architecture:
 * - Agent 1: Research & Evidence Agent (Passages & Citations)
 * - Agent 2: Personalized Companion Agent (Guidance)
 * - Agent 3: Safety & Response Validation Agent (Guardrails)
 * Includes Interactive Agent Execution Tracing Drawer
 */

import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, Conversation, WellnessActivity, UserProfile } from '../../server/types.js';
import { api } from '../utils/api.js';
import {
  Send,
  Sparkles,
  ShieldCheck,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  ThumbsDown,
  Activity,
  Plus,
  Trash2,
  Clock,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';

interface CompanionViewProps {
  user: UserProfile | null;
  onStartActivity: (activity: WellnessActivity) => void;
  onOpenCrisis: () => void;
}

export const CompanionView: React.FC<CompanionViewProps> = ({
  user,
  onStartActivity,
  onOpenCrisis
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [expandedTraceMsgId, setExpandedTraceMsgId] = useState<string | null>(null);
  const [expandedCitationMsgId, setExpandedCitationMsgId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const data = await api.getConversations();
      setConversations(data.conversations);
      if (data.conversations.length > 0 && !activeConvId) {
        selectConversation(data.conversations[0].id);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  };

  const selectConversation = async (id: string) => {
    setActiveConvId(id);
    try {
      const data = await api.getConversation(id);
      setMessages(data.messages);
    } catch (err) {
      console.error('Failed to load conversation messages:', err);
    }
  };

  const startNewConversation = () => {
    const newId = `conv-${Date.now()}`;
    setActiveConvId(newId);
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        conversationId: newId,
        role: 'assistant',
        content: `Hi ${user?.name?.split(' ')[0] || 'there'}. I am right here with you.\n\nHow are you feeling right now? Tell me what is on your mind, or let me know if you would like a quick breathing reset together.`,
        timestamp: new Date().toISOString()
      }
    ]);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const query = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    // Optimistically show user message
    const tempUserMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      conversationId: activeConvId || 'new',
      role: 'user',
      content: query,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const res = await api.sendChatMessage(query, activeConvId || undefined);
      if (!activeConvId) {
        setActiveConvId(res.conversationId);
      }
      setMessages(prev => {
        const withoutTemp = prev.filter(m => m.id !== tempUserMsg.id);
        return [...withoutTemp, res.userMessage, res.assistantMessage];
      });
      loadConversations();
    } catch (err: unknown) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        conversationId: activeConvId || 'new',
        role: 'assistant',
        content: `I encountered an unexpected issue while retrieving guidance. ${err instanceof Error ? err.message : String(err)}. Please try again in a moment.`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleFeedback = async (messageId: string, feedback: 'helpful' | 'unhelpful') => {
    if (!activeConvId) return;
    try {
      await api.sendFeedback(activeConvId, messageId, feedback);
      setMessages(prev =>
        prev.map(m => (m.id === messageId ? { ...m, feedback } : m))
      );
    } catch (err) {
      console.error('Feedback failed:', err);
    }
  };

  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.deleteConversation(id);
      const remaining = conversations.filter(c => c.id !== id);
      setConversations(remaining);
      if (activeConvId === id) {
        if (remaining.length > 0) {
          selectConversation(remaining[0].id);
        } else {
          startNewConversation();
        }
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-5rem)] flex flex-col">
      <div className="flex-1 bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
        
        {/* Sidebar: Conversation History (Desktop) */}
        <aside className="w-full md:w-72 bg-stone-50/70 border-r border-stone-200 flex flex-col">
          <div className="p-4 border-b border-stone-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Conversations
            </span>
            <button
              onClick={startNewConversation}
              className="p-1.5 rounded-lg bg-white border border-stone-200 text-slate-700 hover:text-indigo-600 hover:border-indigo-200 transition-colors shadow-2xs"
              title="New Conversation"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                No past conversations. Start a new session.
              </div>
            ) : (
              conversations.map(conv => {
                const isActive = conv.id === activeConvId;
                return (
                  <div
                    key={conv.id}
                    onClick={() => selectConversation(conv.id)}
                    className={`group w-full p-3 rounded-xl text-left transition-colors flex items-start justify-between cursor-pointer ${
                      isActive
                        ? 'bg-white border border-stone-200/80 shadow-2xs text-slate-900 font-medium'
                        : 'hover:bg-stone-100 text-slate-600'
                    }`}
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="text-xs font-semibold truncate">{conv.title}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(conv.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={e => handleDeleteConversation(conv.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition-opacity"
                      title="Delete conversation"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Three-Agent Status Indicator */}
          <div className="p-3 border-t border-stone-200/80 bg-white/60 text-[11px] text-slate-500 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Three-Agent Architecture</span>
            </div>
            <p className="text-[10px] text-slate-500">
              Research Agent · Companion Agent · Safety Validator
            </p>
          </div>
        </aside>

        {/* Chat Main Area */}
        <main className="flex-1 flex flex-col bg-white overflow-hidden">
          
          {/* Top Bar inside chat */}
          <div className="px-6 py-3 border-b border-stone-100 flex items-center justify-between bg-stone-50/40">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-xs font-semibold text-slate-800">
                Grounded Wellness Companion
              </span>
              <span className="text-slate-400 text-xs">·</span>
              <span className="text-[11px] text-slate-500">
                Peer-reviewed RAG pipeline active
              </span>
            </div>

            <button
              onClick={onOpenCrisis}
              className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Crisis Support</span>
            </button>
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {messages.map(msg => {
              const isUser = msg.role === 'user';
              const isTraceExpanded = expandedTraceMsgId === msg.id;
              const isCitationExpanded = expandedCitationMsgId === msg.id;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-2`}
                >
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 px-1 font-mono-tabular">
                    <span>{isUser ? 'You' : 'Calmify Companion'}</span>
                    <span aria-hidden="true">·</span>
                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`max-w-2xl rounded-2xl px-5 py-4 text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'bg-slate-900 text-white rounded-br-xs'
                        : 'bg-stone-50 border border-stone-200 text-slate-800 rounded-bl-xs'
                    }`}
                  >
                    <div className="whitespace-pre-line space-y-2 font-normal">
                      {msg.content}
                    </div>

                    {/* Citations Box (Agent 1) */}
                    {!isUser && msg.citations && msg.citations.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-stone-200/80">
                        <button
                          onClick={() => setExpandedCitationMsgId(isCitationExpanded ? null : msg.id)}
                          className="flex items-center justify-between w-full text-xs font-semibold text-indigo-700 hover:text-indigo-900"
                        >
                          <span className="flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>{msg.citations.length} Peer-Reviewed Citations</span>
                          </span>
                          {isCitationExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {isCitationExpanded && (
                          <div className="mt-2 space-y-2 pt-1">
                            {msg.citations.map((c, idx) => (
                              <div
                                key={idx}
                                className="p-2.5 rounded-lg bg-white border border-stone-200 text-[11px] space-y-1"
                              >
                                <div className="font-bold text-slate-900">{c.title}</div>
                                <div className="text-slate-500">
                                  {c.authors.join(', ')} ({c.year})
                                </div>
                                <p className="text-slate-600 italic bg-stone-50 p-1.5 rounded">
                                  "{c.passageSnippet}"
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Suggested Activities Chips */}
                    {!isUser && msg.suggestedActivities && msg.suggestedActivities.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-stone-200/80 flex flex-wrap gap-2 items-center">
                        <span className="text-[11px] font-semibold text-slate-500">
                          Recommended practice:
                        </span>
                        {msg.suggestedActivities.map((actTitle, idx) => (
                          <button
                            key={idx}
                            onClick={() =>
                              onStartActivity({
                                id: 'act-custom',
                                title: actTitle,
                                category: 'breathing',
                                durationMinutes: 4,
                                description: 'Guided practice recommended by your AI Companion.',
                                instructions: [
                                  'Find a comfortable posture.',
                                  'Follow the calm pacing prompts.'
                                ],
                                evidenceBasis: 'Empirical relaxation training protocol.'
                              })
                            }
                            className="px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors flex items-center gap-1"
                          >
                            <Activity className="w-3 h-3" />
                            <span>{actTitle}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions & Agent Trace Drawer Toggle */}
                  {!isUser && (
                    <div className="flex items-center gap-3 px-1">
                      {/* Agent Trace Drawer button */}
                      {msg.trace && (
                        <button
                          onClick={() => setExpandedTraceMsgId(isTraceExpanded ? null : msg.id)}
                          className="text-[11px] font-medium text-slate-500 hover:text-indigo-600 flex items-center gap-1"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Inspect 3-Agent Trace</span>
                          {isTraceExpanded ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                        </button>
                      )}

                      {/* Feedback buttons */}
                      <div className="flex items-center gap-1 text-slate-400">
                        <button
                          onClick={() => handleFeedback(msg.id, 'helpful')}
                          className={`p-1 rounded hover:text-slate-600 ${msg.feedback === 'helpful' ? 'text-indigo-600' : ''}`}
                          title="Mark helpful"
                        >
                          <ThumbsUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleFeedback(msg.id, 'unhelpful')}
                          className={`p-1 rounded hover:text-slate-600 ${msg.feedback === 'unhelpful' ? 'text-rose-600' : ''}`}
                          title="Mark unhelpful"
                        >
                          <ThumbsDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Detailed Three-Agent Execution Trace Drawer */}
                  {!isUser && msg.trace && isTraceExpanded && (
                    <div className="w-full max-w-2xl bg-stone-50 border border-stone-200 rounded-xl p-4 text-xs space-y-3 font-mono-tabular">
                      <div className="flex items-center justify-between border-b border-stone-200/80 pb-2">
                        <span className="font-bold text-slate-800">
                          Execution Pipeline Verification
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Trace ID: {msg.trace.requestId}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                        <div className="p-2 bg-white rounded-lg border border-stone-200">
                          <span className="text-slate-500 block">Agent 1: Research</span>
                          <span className="font-bold text-indigo-700">
                            {msg.trace.retrievedCount} passages
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            {msg.trace.stepTimingsMs.researchRetrieval}ms
                          </span>
                        </div>

                        <div className="p-2 bg-white rounded-lg border border-stone-200">
                          <span className="text-slate-500 block">Agent 2: Companion</span>
                          <span className="font-bold text-slate-800">
                            {msg.trace.modelUsed}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            {msg.trace.stepTimingsMs.wellnessDraft}ms
                          </span>
                        </div>

                        <div className="p-2 bg-white rounded-lg border border-stone-200">
                          <span className="text-slate-500 block">Agent 3: Safety</span>
                          <span className="font-bold text-emerald-700 uppercase">
                            {msg.trace.safetyVerdict.status}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            {msg.trace.stepTimingsMs.safetyValidation}ms
                          </span>
                        </div>

                        <div className="p-2 bg-white rounded-lg border border-stone-200">
                          <span className="text-slate-500 block">Total Latency</span>
                          <span className="font-bold text-slate-900">
                            {msg.trace.stepTimingsMs.total}ms
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            Revisions: {msg.trace.revisedTimes}
                          </span>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-stone-200 space-y-1">
                        <div className="font-bold text-slate-700">Safety Guardrail Report:</div>
                        <div>Risk Level: <span className="font-semibold">{msg.trace.safetyVerdict.risk_level}</span></div>
                        <div>Evidence Supported: <span className="font-semibold">{msg.trace.safetyVerdict.evidence_supported ? 'Yes' : 'No'}</span></div>
                        {msg.trace.safetyVerdict.issues.length > 0 && (
                          <div className="text-rose-600">Issues Flagged: {msg.trace.safetyVerdict.issues.join('; ')}</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-slate-500 p-2">
                <Sparkles className="w-4 h-4 text-indigo-600 animate-spin" />
                <span>Consulting research library and synthesizing guidance...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div className="p-4 border-t border-stone-200 bg-white">
            <form onSubmit={handleSendMessage} className="relative">
              <textarea
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                rows={2}
                placeholder="Share your thoughts, stress factors, or ask about research-backed coping tools..."
                className="w-full resize-none text-xs sm:text-sm p-3.5 pr-20 rounded-xl border border-stone-200 bg-stone-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 placeholder:text-slate-400"
              />

              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="absolute right-3 bottom-3 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-40 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
            <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2 px-1">
              <span>Press Enter to send, Shift+Enter for new line</span>
              <span>Encrypted server proxy · Strictly non-clinical guidance</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
