import { NextRequest, NextResponse } from "next/server";
import { getBatchEmbeddings, cosineSimilarity } from "@/lib/ai";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { query, paragraphs, topK = 5 } = await req.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "A valid search query is required." },
        { status: 400 }
      );
    }

    if (!Array.isArray(paragraphs) || paragraphs.length === 0) {
      return NextResponse.json(
        { error: "Paragraphs array must contain at least one text chunk." },
        { status: 400 }
      );
    }

    // Embed all paragraphs along with the query in the same vector space
    const allVectors = await getBatchEmbeddings([query, ...paragraphs]);
    const queryVector = allVectors[0];
    const paragraphVectors = allVectors.slice(1);

    const scoredResults = paragraphs.map((text, index) => {
      const vector = paragraphVectors[index];
      const similarity = cosineSimilarity(queryVector, vector);

      return {
        text,
        score: Math.round(similarity * 1000) / 1000,
        index,
      };
    });

    // Rank from highest relevance to lowest
    scoredResults.sort((a, b) => b.score - a.score);

    return NextResponse.json({
      success: true,
      query,
      results: scoredResults.slice(0, Number(topK)),
    });
  } catch (error: any) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: error.message || "Search failed." },
      { status: 500 }
    );
  }
}