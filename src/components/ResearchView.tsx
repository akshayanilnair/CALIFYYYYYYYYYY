/**
 * Calmify Research Library & Administration Console
 * Real RAG evidence repository, passage retrieval inspection,
 * and peer-review approval pipeline
 */

import React, { useState, useEffect } from 'react';
import { ResearchDocument, UserProfile } from '../../server/types.js';
import { api } from '../utils/api.js';
import {
  BookOpen,
  Search,
  CheckCircle,
  Clock,
  ShieldCheck,
  Upload,
  Plus,
  FileText,
  Tag,
  ExternalLink,
  ThumbsUp,
  XCircle
} from 'lucide-react';

interface ResearchViewProps {
  user: UserProfile | null;
  onRefresh: () => Promise<void>;
}

export const ResearchView: React.FC<ResearchViewProps> = ({ user, onRefresh }) => {
  const [documents, setDocuments] = useState<ResearchDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDoc, setSelectedDoc] = useState<ResearchDocument | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // New Paper Form
  const [title, setTitle] = useState<string>('');
  const [authors, setAuthors] = useState<string>('');
  const [year, setYear] = useState<number>(2026);
  const [journal, setJournal] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [fullText, setFullText] = useState<string>('');
  const [tags, setTags] = useState<string>('CBT, Mindfulness');

  useEffect(() => {
    loadDocs();
  }, []);

  const loadDocs = async () => {
    try {
      const data = await api.getResearchDocs();
      setDocuments(data.documents);
      if (data.documents.length > 0 && !selectedDoc) {
        setSelectedDoc(data.documents[0]);
      }
    } catch (err) {
      console.error('Failed to load research papers:', err);
    }
  };

  const handleReview = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await api.reviewResearchDoc(id, status);
      await loadDocs();
    } catch (err: unknown) {
      alert(`Review action failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleUploadPaper = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !journal || !summary) return;
    setIsSubmitting(true);
    try {
      await api.uploadResearchDoc({
        title,
        authors: authors.split(',').map(a => a.trim()),
        publicationYear: year,
        journal,
        summary,
        fullText,
        tags: tags.split(',').map(t => t.trim())
      });
      setIsUploading(false);
      setTitle('');
      setAuthors('');
      setJournal('');
      setSummary('');
      setFullText('');
      await loadDocs();
    } catch (err: unknown) {
      alert(`Upload failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredDocs = documents.filter(d =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const canReview = user?.role === 'admin' || user?.role === 'reviewer';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Psychological Research Library & RAG
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Curated, peer-reviewed clinical studies indexed for evidence retrieval by Agent 1 (Research & Evidence Agent).
          </p>
        </div>

        {canReview && (
          <button
            onClick={() => setIsUploading(!isUploading)}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs self-start sm:self-auto"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Research Paper</span>
          </button>
        )}
      </div>

      {/* Upload Paper Modal / Form */}
      {isUploading && (
        <div className="bg-white rounded-2xl border border-indigo-200 p-6 sm:p-8 shadow-md space-y-5">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900">
                Submit Research Paper for Peer Review & Vector Indexing
              </h2>
            </div>
            <button
              onClick={() => setIsUploading(false)}
              className="text-xs font-medium text-slate-500 hover:text-slate-800"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleUploadPaper} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Paper Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Diaphragmatic Breathing and Sympathetic Modulation"
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Authors (Comma separated)</label>
                <input
                  type="text"
                  required
                  value={authors}
                  onChange={e => setAuthors(e.target.value)}
                  placeholder="e.g. John Doe, Jane Smith, et al."
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Publication Year</label>
                <input
                  type="number"
                  value={year}
                  onChange={e => setYear(Number(e.target.value))}
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-200 font-mono-tabular"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Journal / Publication</label>
                <input
                  type="text"
                  required
                  value={journal}
                  onChange={e => setJournal(e.target.value)}
                  placeholder="e.g. Cognitive Therapy and Research, Vol 36"
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-200"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">Abstract / Summary</label>
              <textarea
                required
                value={summary}
                onChange={e => setSummary(e.target.value)}
                rows={2}
                placeholder="Core empirical findings and psychological mechanisms..."
                className="w-full text-xs p-2.5 rounded-xl border border-stone-200"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">
                Full Text / Passage Excerpt (Auto-chunked for RAG)
              </label>
              <textarea
                value={fullText}
                onChange={e => setFullText(e.target.value)}
                rows={4}
                placeholder="Paste key study excerpts or discussion passages..."
                className="w-full text-xs p-2.5 rounded-xl border border-stone-200 font-mono-tabular"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsUploading(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs"
              >
                {isSubmitting ? 'Ingesting...' : 'Ingest & Queue Review'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative max-w-md w-full">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search research by topic (e.g. vagal, cbt, mbsr, insomnia)..."
          className="w-full text-xs sm:text-sm pl-9 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Document List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>Documents ({filteredDocs.length})</span>
            <span>Status</span>
          </div>

          <div className="space-y-2">
            {filteredDocs.map(doc => {
              const isSelected = selectedDoc?.id === doc.id;
              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-2xs'
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-xs font-bold text-slate-900 line-clamp-2">
                      {doc.title}
                    </h3>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded whitespace-nowrap shrink-0 ${
                        doc.reviewStatus === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : doc.reviewStatus === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {doc.reviewStatus}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500">
                    {doc.authors[0]} et al. · {doc.publicationYear}
                  </div>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {doc.tags.map(t => (
                      <span key={t} className="text-[10px] text-slate-600 bg-stone-100 px-1.5 py-0.5 rounded">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Document Details & Passages (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-2xs space-y-6">
          {selectedDoc ? (
            <>
              <div className="space-y-2 pb-4 border-b border-stone-200">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded ${
                      selectedDoc.reviewStatus === 'approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : selectedDoc.reviewStatus === 'pending'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    Review: {selectedDoc.reviewStatus}
                  </span>

                  {/* Review Actions if Reviewer/Admin */}
                  {canReview && selectedDoc.reviewStatus === 'pending' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleReview(selectedDoc.id, 'approved')}
                        className="px-3 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1 shadow-2xs"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Approve Paper</span>
                      </button>
                      <button
                        onClick={() => handleReview(selectedDoc.id, 'rejected')}
                        className="px-3 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  )}
                </div>

                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  {selectedDoc.title}
                </h2>

                <div className="text-xs text-slate-600 space-y-0.5">
                  <div><strong>Authors:</strong> {selectedDoc.authors.join(', ')}</div>
                  <div><strong>Journal:</strong> {selectedDoc.journal} ({selectedDoc.publicationYear})</div>
                  {selectedDoc.doi && <div><strong>DOI:</strong> {selectedDoc.doi}</div>}
                  {selectedDoc.reviewedBy && (
                    <div className="text-emerald-700 font-medium">
                      Reviewed By: {selectedDoc.reviewedBy} on {selectedDoc.reviewDate}
                    </div>
                  )}
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Study Abstract & Findings
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed bg-stone-50 p-4 rounded-xl border border-stone-200/70">
                  {selectedDoc.summary}
                </p>
              </div>

              {/* Indexed Passages Chunks */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Indexed RAG Passages ({selectedDoc.chunks?.length || 0})
                  </h4>
                  <span className="text-[11px] text-slate-400">Available to Research Agent</span>
                </div>

                <div className="space-y-2">
                  {selectedDoc.chunks?.map((chunk, i) => (
                    <div
                      key={chunk.id || i}
                      className="p-3.5 rounded-xl border border-stone-200 bg-white text-xs space-y-2 hover:border-indigo-200 transition-colors"
                    >
                      <p className="text-slate-800 leading-relaxed font-mono-tabular">
                        "{chunk.passageText}"
                      </p>
                      {chunk.keyFindings && chunk.keyFindings.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {chunk.keyFindings.map((f, fi) => (
                            <span key={fi} className="text-[10px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                              ✓ {f}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="py-16 text-center text-xs text-slate-400">
              Select a research study on the left to inspect its metadata and indexed passages.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
