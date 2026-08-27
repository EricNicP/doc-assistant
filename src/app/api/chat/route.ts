import { NextRequest, NextResponse } from "next/server";
import { ai } from "@/lib/ai";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { question, context } = await req.json();

    if (!question || typeof question !== "string") {
      return NextResponse.json(
        { error: "A valid question is required." },
        { status: 400 }
      );
    }

    if (!context || typeof context !== "string") {
      return NextResponse.json(
        { error: "Document context is required." },
        { status: 400 }
      );
    }

    const prompt = `You are a precise, document-grounded AI assistant.
Answer the user's question STRICTLY and ONLY using the provided document context below.
If the answer is not present in the context, reply: "I cannot find the answer to this question in the provided document."

---
DOCUMENT CONTEXT:
${context.slice(0, 80000)}
---

USER QUESTION:
${question}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    const answerText = response.text || "No response generated.";

    return NextResponse.json({
      success: true,
      answer: answerText,
    });
  } catch (error: any) {
    console.error("❌ Full Chat API Error Details:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process chat request." },
      { status: 500 }
    );
  }
}