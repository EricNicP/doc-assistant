import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || "";

if (!apiKey) {
  console.warn("⚠️ Warning: GEMINI_API_KEY is not set in .env.local");
}

export const ai = new GoogleGenAI({
  apiKey: apiKey,
});

/**
 * Computes cosine similarity between two numeric vectors.
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA?.length || !vecB?.length || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
  return magnitude === 0 ? 0 : dotProduct / magnitude;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2);
}

export async function getBatchEmbeddings(texts: string[]): Promise<number[][]> {
  const tokenizedDocs = texts.map((t) => tokenize(t));
  const vocabulary = Array.from(new Set(tokenizedDocs.flat()));
  const numDocs = texts.length;

  if (vocabulary.length === 0) return texts.map(() => []);

  const idfMap = new Map<string, number>();
  for (const term of vocabulary) {
    const docsContainingTerm = tokenizedDocs.filter((doc) => doc.includes(term)).length;
    idfMap.set(term, Math.log((numDocs + 1) / (docsContainingTerm + 1)) + 1);
  }

  return tokenizedDocs.map((doc) => {
    const termCounts = new Map<string, number>();
    for (const term of doc) {
      termCounts.set(term, (termCounts.get(term) || 0) + 1);
    }

    return vocabulary.map((term) => {
      const tf = (termCounts.get(term) || 0) / (doc.length || 1);
      const idf = idfMap.get(term) || 0;
      return tf * idf;
    });
  });
}