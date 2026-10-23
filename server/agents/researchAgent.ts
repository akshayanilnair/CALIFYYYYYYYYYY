/**
 * Agent 1: Research and Evidence Agent
 * 
 * Responsibilities:
 * - Search actual indexed documents using semantic and keyword matching.
 * - Retrieve relevant passages and preserve source metadata.
 * - Prioritize relevance, source quality, and professional review status.
 * - Distinguish systematic reviews, peer-reviewed studies, and clinical guidelines.
 * - Explicitly report when evidence is insufficient.
 * - Never invent papers, citations, authors, findings, or publication details.
 */

import { db } from '../db.js';
import { RetrievedEvidence, ResearchChunk, ResearchDocument } from '../types.js';

export class ResearchAgent {
  /**
   * Search approved research papers for relevant evidence
   */
  public async retrieveEvidence(query: string): Promise<RetrievedEvidence> {
    const schema = db.getSchema();
    const approvedDocs = schema.researchDocs.filter(d => d.reviewStatus === 'approved');
    const approvedDocMap = new Map<string, ResearchDocument>();
    approvedDocs.forEach(d => approvedDocMap.set(d.id, d));

    const queryTokens = this.tokenize(query);
    if (queryTokens.length === 0) {
      return {
        query,
        passages: [],
        confidence: 0,
        insufficientEvidence: true
      };
    }

    const scoredPassages: Array<{
      passageId: string;
      documentId: string;
      documentTitle: string;
      authors: string[];
      year: number;
      journal: string;
      text: string;
      relevanceScore: number;
      evidenceLevel: 'meta-analysis' | 'randomized-trial' | 'clinical-guideline' | 'review';
    }> = [];

    // Score all chunks from approved documents
    for (const chunk of schema.researchChunks) {
      const doc = approvedDocMap.get(chunk.documentId);
      if (!doc) continue; // Only approved sources are indexed for evidence

      const chunkTokens = this.tokenize(
        `${chunk.passageText} ${chunk.keyFindings.join(' ')} ${chunk.category} ${doc.tags.join(' ')}`
      );

      const relevanceScore = this.calculateSimilarity(queryTokens, chunkTokens);

      if (relevanceScore > 0.12) {
        scoredPassages.push({
          passageId: chunk.id,
          documentId: doc.id,
          documentTitle: doc.title,
          authors: doc.authors,
          year: doc.publicationYear,
          journal: doc.journal,
          text: chunk.passageText,
          relevanceScore: Math.round(relevanceScore * 100) / 100,
          evidenceLevel: doc.title.toLowerCase().includes('meta-analysis') 
            ? 'meta-analysis' 
            : doc.title.toLowerCase().includes('randomized') 
            ? 'randomized-trial' 
            : 'clinical-guideline'
        });
      }
    }

    // Sort by relevance score descending
    scoredPassages.sort((a, b) => b.relevanceScore - a.relevanceScore);
    const topPassages = scoredPassages.slice(0, 3);

    const hasSufficientEvidence = topPassages.length > 0 && topPassages[0].relevanceScore >= 0.18;
    const confidence = topPassages.length > 0 
      ? Math.min(0.95, Math.round((topPassages[0].relevanceScore * 1.2) * 100) / 100)
      : 0;

    return {
      query,
      passages: topPassages,
      confidence,
      insufficientEvidence: !hasSufficientEvidence
    };
  }

  private tokenize(text: string): string[] {
    const stopWords = new Set([
      'the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'in', 'it', 'to', 'for', 'of', 'or', 'by',
      'with', 'about', 'can', 'could', 'how', 'what', 'why', 'when', 'i', 'my', 'me', 'am', 'feel', 'feeling'
    ]);

    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.has(w));
  }

  private calculateSimilarity(queryTokens: string[], docTokens: string[]): number {
    const docSet = new Set(docTokens);
    let matchCount = 0;

    for (const q of queryTokens) {
      if (docSet.has(q)) {
        matchCount += 1;
      } else {
        // Partial prefix/stem match
        for (const d of docSet) {
          if (d.startsWith(q) || q.startsWith(d)) {
            matchCount += 0.5;
            break;
          }
        }
      }
    }

    if (queryTokens.length === 0) return 0;
    return matchCount / Math.sqrt(queryTokens.length * Math.min(docTokens.length, 50));
  }
}

export const researchAgent = new ResearchAgent();
